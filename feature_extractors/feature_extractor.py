class FeatureExtractor():
    """Base class for all feature extractors."""

    def __init__(self):
        self._idx

    @property
    def idx(self):
        return self._idx

    @idx.setter
    def idx(self, val):
        self._idx = val

    def extract_features(self, images):
        raise NotImplementedError()
