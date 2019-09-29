class ModelWrapper:
    def __init__(self):
        self._idx
        self._input_shape
        self._runs_on_features

    @property
    def idx(self):
        return self._idx

    @idx.setter
    def idx(self, val):
        self._idx = val

    def run(self, inputs):
        """
        Returns:
            A list of dictionaries. Each dictionary contains the keys
            `caption`, `alignments`, `beam_search_output_graph`.
        """
        raise NotImplementedError()