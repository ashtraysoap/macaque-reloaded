from json import JSONEncoder, dumps
from neuralmonkey.vocabulary import START_TOKEN, END_TOKEN, PAD_TOKEN


class BeamSearchOutputGraphNode():
    """
    Class representing a node in the tree of beam search
    generated hypotheses.
    """

    def __init__(self, score, token, alignment, children = None):
        """Creates the BeamSearchOutputGraph

        Args:
            score: The loss associated with the hypothesis up to this token.
            token: The string token.
            alignment: A two dimensional Numpy array holding the attention map.
            children: A list of BeamSearchGraphNodes representing the next 
                tokens in extending hypotheses.
        """

        self._score = score
        self._token = token
        self._alignment = alignment

        if children is None:
            self._children = []
        else:
            self._children = children

    @property
    def score(self):
        return self._score

    @property
    def token(self):
        return self._token

    @property
    def alignment(self):
        return self._alignment

    @property
    def children(self):
        return self._children

    def collect_all_hypotheses(self):
        if self._token == END_TOKEN:
            return ([[]], [[]], [[]])

        elif self._children == []:
            return ([[self._token]], [[self._score]], [[self._alignment]])

        token_h = []
        score_h = []
        alignment_h = []

        for c in self._children:
            t, s, a = c.collect_all_hypotheses()
            token_h.extend(t)
            score_h.extend(s)
            alignment_h.extend(a)

        for t, s, a in zip(token_h, score_h, alignment_h):
            t.append(self._token)
            s.append(self._score)
            a.append(self._alignment)

        return (token_h, score_h, alignment_h)

    def collect_hypotheses(self, prefix):
        if self._token == END_TOKEN:
            return [prefix]
        elif self._children == []:
            return None

        res = []
        t, s, a = prefix
        t.append(self._token)
        s.append(self._score)
        a.append(self._alignment)

        for c in self._children:
            tup = c.collect_hypotheses((t[:], s[:], a[:]))
            if tup is not None:
                res.extend(tup)
        return res

class BeamSearchOutputGraph():
    """
    Class representing the tree of hypotheses generated during 
    beam search decoding.
    """

    def __init__(self,
                tokens,
                parent_ids,
                alignments=None,
                scores=None):
        """Creates the BeamSearchOutputGraph.

        Args:
            scores: Numpy array of shape [max_len, beam_size] of partial 
                hypothesis losses.
            tokens: A list of lists of string tokens. First list length equals
                maximum hyp. length, second dimension equals number of 
                hypotheses.
            parent_ids: Numpy array of shape [max_len, beam_size] of parent 
                ids.
            alignments: A list of list of Numpy arrays of token attention
                alignments. The first list's length equals maximum hyp.
                length. The second list's length equals number of beams. 
        """

        self._root = BeamSearchOutputGraphNode(0, "<s>", None)

        if scores is None:
            scores = [[None] * len(tokens)[0]] * len(tokens)

        if alignments is None:
            alignments = [[None] * len(tokens)[0]] * len(tokens)

        # Get rid of start tokens from all hypotheses.
        scores = scores[1:]
        tokens = tokens[1:]
        parent_ids = parent_ids[1:]
        alignments = alignments[1:]

        max_time = len(tokens)
        beam_size = len(tokens[0])
        opened_hyp = [None] * beam_size
        opened_hyp[0] = self._root

        for t in range(max_time):
            future_opened_hyp = [None] * beam_size
            for b in range(beam_size):
                if tokens[t][b] != PAD_TOKEN:
                    node = BeamSearchOutputGraphNode(score=scores[t,b].item(),
                                                    token=tokens[t][b],
                                                    alignment=alignments[t][b])
                    opened_hyp[parent_ids[t,b]].children.append(node)
                    future_opened_hyp[b] = node
            opened_hyp = future_opened_hyp

    @property
    def root(self):
        return self._root

    def collect_all_hypotheses(self):
        """
        Traverses the graph, collecting all hypotheses; finished
        and unfinished.
        """

        th = []
        sh = []
        ah = []

        for c in self._root.children:
            t, s, a = c.collect_all_hypotheses()
            th.extend(t)
            sh.extend(s)
            ah.extend(a)

        for t, s, a in zip(th, sh, ah):
            t.reverse()
            s.reverse()
            a.reverse()

        hyps = list(zip(th, sh, ah))
        hyps = list(zip(*hyps))

        return {'tokens': hyps[0], 'scores': hyps[1], 'alignments': hyps[2]}


    def collect_hypotheses(self):
        """Traverses the graph, collecting the finished hypotheses.
        Returns them ordered ascending by overall negative log probability.
        """

        hyps = []

        for c in self._root.children:
            hs = c.collect_hypotheses(([], [], []))
            if hs is not None:
                hyps.extend(hs)

        hyps.sort(key=lambda t: t[1][-1]) # sort according to the last score
        hyps = list(zip(*hyps))

        return {'tokens': hyps[0], 'scores': hyps[1], 'alignments': hyps[2]}

    def to_json(self):
        return dumps(self, cls=BeamSearchOutputGraphEncoder)


class BeamSearchOutputGraphEncoder(JSONEncoder):
    """Class for JSON-encoding the BeamSearchOutputGraph.
    """

    def default(self, graph):
        return self._encode_node(graph.root)

    def _encode_node(self, node):
        enc_children = []
        if node.children != []:
            for c in node.children:
                enc_children.append(self._encode_node(c))

        if node.alignment is None:
            alig = []
        else:
            alig = node.alignment.tolist()

        return {'token': node.token,
                'score': node.score,
                'alignment': alig,
                'children': enc_children}
