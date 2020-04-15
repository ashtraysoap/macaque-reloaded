import os

from config_parser import find_configs, create_configs
from preprocessing import create_preprocessor
from feature_extractors import create_feature_extractor
from model_wrappers import create_model_wrapper
from runner import create_runner, create_demo_runner

MODELS_DIR = "./models"

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
        
        # initialize models from configuration files
        self.create_from_configs()

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

        self.demo_runner = create_demo_runner()
        return

    def create_from_configs(self):
        cfgs = find_configs(MODELS_DIR)
        cfgs = [os.path.join(MODELS_DIR, c) for c in cfgs]
        cfgs = create_configs(cfgs)

        for cfg in cfgs:
            if 'prepro' in cfg:
                prepro_cfg = cfg['prepro']
                if 'name' not in prepro_cfg:
                    raise RuntimeWarning("Preprocessor name has to be specified. \
                        Skipping config.")
                    continue
                name = prepro_cfg['name']
                if self.contains_prepro(name):
                    pass # todo
                prepro = create_preprocessor(prepro_cfg)
                if prepro is not None:
                    self.add_preprocessor(prepro)

            if 'encoder' in cfg:
                e_cfg = cfg['encoder']
                if 'name' not in e_cfg:
                    pass # todo
                name = e_cfg['name']
                if self.contains_encoder(name):
                    pass # todo
                encoder = create_feature_extractor(e_cfg, from_response=False)
                if encoder is not None:
                    self.add_feature_extractor(encoder)

            if 'model' in cfg:
                m_cfg = cfg['model']
                if 'name' not in m_cfg:
                    pass # todo
                name = m_cfg['name']
                if self.contains_model(name):
                    pass # todo
                model = create_model_wrapper(m_cfg, from_response=False)
                if model is not None:
                    self.add_model(model)

            if 'runner' in cfg:
                r_cfg = cfg['runner']
                if 'name' not in r_cfg:
                    pass # todo
                name = r_cfg['name']
                if self.contains_runner(name):
                    pass # todo
                runner = create_runner(self, r_cfg)
                if runner is not None:
                    self.add_runner(runner)

    def contains_prepro(self, name):
        ps = self.preprocessors
        return [p for p in ps if p.name == name] != []

    def contains_encoder(self, name):
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