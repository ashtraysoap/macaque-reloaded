from runner import create_demo_runner

class MacaqueState():
    def __init__(self):
        self._datasets = []
        self._preprocessors = []
        self._feature_extractors = []
        self._models = []
        self._runners = []
        self._run_results = []
        self._user = None
        self._demo_runner_id = None

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
    def model_interfaces(self):
        return self._model_interfaces

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
    def user(self):
        return self._user

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
        return len(self._run_results)

    def add_demo_runner(self):
        dr = create_demo_runner()
        r_id = self.add_runner(dr)
        self._demo_runner_id = r_id
        return r_id
