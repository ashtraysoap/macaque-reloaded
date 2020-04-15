class ModelWrapper:
    """Base class for model wrappers."""

    def __init__(self, name, runs_on_features=False):
        self.name = name
        self.runs_on_features = runs_on_features
        self.idx = None

    def run(self, inputs):
        raise NotImplementedError()

    def to_json(self):
        return { 'name': self.name }