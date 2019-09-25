class FeatureExtractor():
    def __init__(self):
        self._idx

    @property
    def idx(self):
        return self._idx

    @idx.setter
    def idx(self, val):
        self._idx = val

    def extract_features(self, images):
        """
        Arguments:
            images: a numpy array of the dataset's images.

        Returns:
            A numpy array of feature maps extracted from the dataset's images.
        """
        pass
