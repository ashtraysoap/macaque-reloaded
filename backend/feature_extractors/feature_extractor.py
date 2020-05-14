class FeatureExtractor():
    """Base class for all feature extractors."""

    def __init__(self, name):
        self.name = name
        self.idx = None

    def extract_features(self, images):
        raise NotImplementedError()

    def to_json(self):
        return { 'name': self.name }