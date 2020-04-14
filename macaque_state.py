from runner import create_demo_runner

class MacaqueState():
    """Class responsible for holding global application state.

    Attributes:
        datasets: A list of Dataset instances.
        preprocessors: A list of Preprocessor instances.
        feature_extractors: A list of FeatureExtractor instances.
        models: A list of ModelWrapper instances.
        runners: A list of Runner instances.
        run_results: A list of run results.
        demo_runner_id: The integer id of the demonstrational runner in runners.
    """

    def __init__(self):
        """Initialize MacaqueState with initial empty values."""

        self._datasets = []
        self._preprocessors = []
        self._feature_extractors = []
        self._models = []
        self._runners = []
        self._run_results = []
        self._demo_runner_id = None
        self.demo_runner = None

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

    @property
    def demo_runner_id(self):
        return self._demo_runner_id
    
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

        # dr = create_demo_runner()
        # r_id = self.add_runner(dr)
        # self._demo_runner_id = r_id
        # return r_id
        self.demo_runner = create_demo_runner()
        return
