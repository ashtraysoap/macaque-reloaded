import os

from config_parser import instantiate_configs


class MacaqueState():
    """Class responsible for holding global application state.

    Attributes:
        datasets: A list of Dataset instances.
        preprocessors: A list of Preprocessor instances.
        feature_extractors: A list of FeatureExtractor instances.
        models: A list of ModelWrapper instances.
        runners: A list of Runner instances.
        run_results: A list of run results.
    """

    def __init__(self, public=False, config_dir='./models'):
        """Initialize MacaqueState with initial empty values.
        
        Args:
            public: Whether the application runs on public IP addresses or not.
            config_dir: A string path to the directory containing configuration
                files.
        """

        self._datasets = []
        self._preprocessors = []
        self._feature_extractors = []
        self._models = []
        self._runners = []
        self._run_results = []
        self.public = public
        self.config_dir = config_dir
        
        # Initialize models from configuration files.
        instantiate_configs(self)

        # Create directory that stores user uploaded images.
        # It is deleted on exit by Ctrl-C.
        if not os.path.isdir("imgs"):
            os.mkdir("imgs")

    @property
    def datasets(self):
        return self._datasets

    @property
    def preprocessors(self):
        return self._preprocessors

    @property
    def feature_extractors(self):
        return self._feature_extractors

    @property
    def models(self):
        return self._models

    @property
    def runners(self):
        return self._runners
    
    @property
    def run_results(self):
        return self._run_results

    def add_dataset(self, ds):
        ds.idx = len(self.datasets)
        self.datasets.append(ds)
        return ds.idx

    def add_preprocessor(self, prepro):
        prepro.idx = len(self.preprocessors)
        self.preprocessors.append(prepro)
        return prepro.idx

    def add_feature_extractor(self, fe):
        fe.idx = len(self.feature_extractors)
        self.feature_extractors.append(fe)
        return fe.idx

    def add_model(self, model):
        model.idx = len(self.models)
        self.models.append(model)
        return model.idx

    def add_runner(self, runner):
        runner.idx = len(self.runners)
        self.runners.append(runner)
        return runner.idx

    def add_results(self, res):
        self._run_results.append(res)

    def get_current_run_counter(self):
        """Return the number of run results stored in the state.

        This value is used to set the id of new run results.
        """

        return len(self._run_results)

    def add_demo_runner(self):
        """Add a demonstrational runner to the state's runners list.

        Returns:
            An integer id corresponding to the index of the demo runner
            in the `runners` attribute. 
        """

        self.demo_runner = create_demo_runner()
        return

    def contains_dataset(self, name):
        ds = self.datasets
        return [d for d in ds if d.name == name] != []

    def contains_prepro(self, name):
        ps = self.preprocessors
        return [p for p in ps if p.name == name] != []

    def contains_feature_extractor(self, name):
        es = self.feature_extractors
        return [e for e in es if e.name == name] != []

    def contains_model(self, name):
        ms = self.models
        return [m for m in ms if m.name == name] != []

    def contains_runner(self, name):
        rs = self.runners
        return [r for r in rs if r.name == name] != []

    def get_prepro(self, name):
        for p in self.preprocessors:
            if p.name == name:
                return p
        return None

    def get_encoder(self, name):
        for e in self.feature_extractors:
            if e.name == name:
                return e
        return None
    
    def get_model(self, name):
        for m in self.models:
            if m.name == name:
                return m
        return None

    def get_runner(self, name):
        for r in self.runners:
            if r.name == name:
                return r
        return None