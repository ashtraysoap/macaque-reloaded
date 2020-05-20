import os

from preprocessing import create_preprocessor, PreproMode
from model_wrappers import create_model_wrapper
from feature_extractors import create_feature_extractor

def create_runner(macaque_state, runner_config):
    """Creates a runner from the config dictionary.
    
    Args:
        macaque_state: A MacaqueState instance holding the application state.
        runner_config: A dictionary with the keys `prepro`, `encoder` and `model`.
    Returns:
        A Runner instance for the given configuration.
    """

    name = runner_config['name'] if runner_config['name'] else None

    if runner_config['prepro'] is not None:
        # prepro_id = int(runner_config['prepro'])
        # prepro = macaque_state.preprocessors[prepro_id]
        prepro = runner_config['prepro']
        prepro = macaque_state.get_prepro(prepro)
    else:
        prepro = None

    if runner_config['encoder'] is not None:
        # encoder_id = int(runner_config['encoder'])
        # encoder = macaque_state.feature_extractors[encoder_id]
        encoder = runner_config['encoder']
        encoder = macaque_state.get_encoder(encoder)
    else:
        encoder = None

    if runner_config['model'] is not None:
        # model_id = int(runner_config['model'])
        # model = macaque_state.models[model_id]
        model = runner_config['model']
        model = macaque_state.get_model(model)
    else:
        raise RuntimeError("A model has to be provided in the runner.")

    if 'about' in runner_config:
        about_fp = runner_config['about']
    else:
        about_fp = None

    return Runner(name=name,
        model=model,
        feature_extractor=encoder,
        prepro=prepro,
        about_fp=about_fp)

class Runner():
    """Class which allows performing inference on datasets.

    The Runner class holds the configuration for a run - optionally
    the preprocessor and the feature extractor, and a model.

    Attributes:
        idx: An integer, the id of the instance in the global state.
        preprocessor: A Preprocessor instance.
    """

    def __init__(self,
        model,
        feature_extractor=None,
        prepro=None,
        name=None,
        about_fp=None):
        """Initializes the Runner."""

        self._name = name
        self._prepro = prepro
        self._feature_extractor = feature_extractor
        self._model = model
        self._idx = None
        self.about = None

        if about_fp is not None and os.path.isfile(about_fp):
            self.about = open(about_fp, mode='r', encoding='utf-8').read().strip().split('\n\n')
            

    @property
    def name(self):
        return self._name

    @property
    def idx(self):
        return self._idx
    
    @idx.setter
    def idx(self, val):
        self._idx = val

    @property
    def preprocessor(self):
        return self._prepro
    
    @property
    def feature_extractor(self):
        return self._feature_extractor

    @property
    def model(self):
        return self._model

    def run(self, dataset):
        """Runs the model specified by the runner on a dataset.

        Args:
            dataset: A Dataset instance to be run on.
        Returns:
            A list of dictionaries containing the run results.
        """

        res = []
        if dataset.feature_maps:
            if not self._model.runs_on_features:
                raise RuntimeError()
            for batch in dataset:
                f = batch.get_features()
                r = self._model.run(f)
                res.extend(r)
        else:
            if not self._feature_extractor and self._model.runs_on_features:
                raise RuntimeError()
            for batch in dataset:
                if not self._prepro:
                    imgs = batch.load_images()
                else:
                    imgs = self._prepro.preprocess(batch)
                if self._feature_extractor:
                    f = self._feature_extractor.extract_features(imgs)
                    r = self._model.run(f)
                else:
                    r = self._model.run(imgs)
                nr = [
                {
                    'greedy': e['greedy'] if 'greedy' in e else None,
                    'beam_search': e['beam_search'] if 'beam_search' in e else None,
                    'prepro_img': i
                } for (e, i) in zip(r, imgs)]
                res.extend(nr)
        return res

    def run_on_images(self, images):
        """Runs the runner on images.

        Args:
            images: A list of PIL.Image instances.
        Returns:
            A list of dictionaries containing the run results.
        """

        if self._prepro:
            images = self._prepro.preprocess_images(images)
        else:
            # PIL Image to Numpy Array
            images = [np.array(i) for i in images]

        if self._feature_extractor:
            feats = self._feature_extractor.extract_features(images)
            r = self._model.run(feats)
        else:
            r = self._model.run(images)
        return [
            {
                'greedy': e['greedy'] if 'greedy' in e else None,
                'beam_search': e['beam_search'] if 'beam_search' in e else None,
                'prepro_img': i
            } for (e, i) in zip(r, images)
        ]

    def to_json(self):
        d = {
            'name': self.name,
            'model': self.model.name
        }
        if self.preprocessor is not None:
            d['preprocessor'] = self.preprocessor.name
        if self.feature_extractor is not None:
            d['encoder'] = self.feature_extractor.name
        if self.about is not None:
            d['about'] = self.about
        return d
