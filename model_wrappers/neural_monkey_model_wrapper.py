import pdb

import os
import numpy as np
from math import sqrt

from neuralmonkey.dataset import Dataset
from neuralmonkey.experiment import Experiment

from .model_wrapper import ModelWrapper
from beam_search_output import BeamSearchOutputGraph

class NeuralMonkeyModelWrapper(ModelWrapper):
    def __init__(self,
                runs_on_features,
                config_path,
                vars_path,
                data_series="",
                src_caption_series="",
                caption_series="",
                alignments_series="",
                bs_graph_series="bs_target"):
        """
        caption_series -> GreedyRunner output_series
        alignments_series -> WordAlignmentRunner output_series
        bs_graph_series -> BeamSearchRunner output_series
        """

        if not os.path.isfile(config_path):
            raise ValueError("File {} does not exist.".format(config_path))

        self._runs_on_features = runs_on_features
        self._config_path = config_path
        self._vars_path = vars_path
        self._data_series = data_series
        self._src_caption_series = src_caption_series
        self._caption_series = caption_series
        self._alignments_series = alignments_series
        self._bs_graph_series = bs_graph_series

        self._exp = Experiment(config_path=config_path)
        self._exp.build_model()
        self._exp.load_variables([vars_path])

    @property
    def runs_on_features(self):
        return self._runs_on_features

    def run(self, inputs):
        """
        Args:
            inputs: A Numpy Array of inputs.
        Returns:
            A list of dictionaries. Each dictionary contains the keys
            `caption`, `alignments`, `beam_search_output_graph`.
        """

        n_elems = inputs.shape[0]
        # enc-dec model (runs on images)
        if not self._runs_on_features:
            if self._src_caption_series:
                # TODO: handle multimodal translation case
                pass
            else:
                ds = Dataset("macaque_data", {self._data_series: lambda: inputs}, {})

        # dec-only model (runs on feature maps)
        else:
            if self._src_caption_series:
                # TODO: handle multimodal translation case
                pass
            else:
                ds = Dataset("macaque_data", {self._data_series: lambda: inputs}, {})

        _, output_series = self._exp.run_model(dataset=ds, write_out=False)

        if self._caption_series:
            captions = output_series[self._caption_series]
        else:
            captions = [None] * n_elems
        if self._alignments_series:
            alignments = output_series[self._alignments_series]
        else:
            alignments = [None] * n_elems
        if self._bs_graph_series:
            bs_out = output_series[self._bs_graph_series]
            graphs = []
            for b in bs_out:
                attns = [_transform_alignments(a) for a in b['alignments']]
                graphs.append(BeamSearchOutputGraph(
                    scores=b['scores'],
                    tokens=b['tokens'],
                    parent_ids=b['parent_ids'],
                    alignments=attns))

            hyps = [g.collect_hypotheses() for g in graphs]
            bs_caps = [h['tokens'] for h in hyps]
            bs_attns = [h['alignments'] for h in hyps]
            #bs_attns = [[_transform_alignments(h) for h in hyp['alignments']] for hyp in hyps]
        else:
            graphs = [None] * n_elems
            bs_caps = [None] * n_elems
            bs_attns = [None] * n_elems

        
        results = []
        for c, a, bs_g, bs_c, bs_a in zip(captions, alignments, graphs, bs_caps, bs_attns):
            results.append({
                'greedy': {
                    'caption': c,
                    'alignments': a
                },
                'beam_search': {
                    'captions': bs_c,
                    'alignments': bs_a,
                    'graph': bs_g
                }
            })

        return results

def _transform_alignments(alignments):
    """Reshape and normalize alignments.

    Args:
        alignments: A list of Numpy Arrays. Each Array stands for an
            attention map during a decoding step.
    Returns:
        The normalized alignments reshaped into 2D.
    """
    res = []
    for a in alignments:
        a = _normalize_alignments(a)
        ndim = len(a.shape)
        if ndim == 2:
            res.append(a)
        elif ndim == 1:
            x = int(sqrt(a.shape[0]))
            res.append(np.reshape(a, [x, x]))
    return res

def _normalize_alignments(a):
    max = np.amax(a)
    a = a / max
    return np.uint8(225 * a)