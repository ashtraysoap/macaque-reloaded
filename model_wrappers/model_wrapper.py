class ModelWrapper:
    """Base class for model wrappers."""

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
        raise NotImplementedError()