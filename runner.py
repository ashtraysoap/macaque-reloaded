from preprocessing import create_preprocessor, PreproMode
from model_wrappers import create_model_wrapper

def create_runner(macaque_state, runner_config):
    """Creates a runner from the config dictionary."""

    if runner_config['prepro'] is not None:
        prepro_id = int(runner_config['prepro'])
        prepro = macaque_state.preprocessors[prepro_id]
    else:
        prepro = None

    if runner_config['encoder'] is not None:
        encoder_id = int(runner_config['encoder'])
        encoder = macaque_state.feature_extractors[encoder_id]
    else:
        encoder = None

    if runner_config['model'] is not None:
        model_id = int(runner_config['model'])
        model = macaque_state.models[model_id]
    else:
        raise RuntimeError("A model has to be provided in the runner.")

    return Runner(model=model,
        feature_extractor=encoder,
        prepro=prepro)

class Runner():
    def __init__(self,
        model,
        feature_extractor=None,
        prepro=None):

        self._prepro = prepro
        self._feature_extractor = feature_extractor
        self._model = model
        self._idx = None

    @property
    def idx(self):
        return self._idx
    
    @idx.setter
    def idx(self, val):
        self._idx = val

    @property
    def preprocessor(self):
        return self._prepro

    def run(self, dataset):
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
                    imgs = batch.get_images()
                else:
                    imgs = self._prepro.preprocess(batch)
                if self._feature_extractor:
                    f = self._feature_extractor.extract_features(imgs)
                    r = self._model.run(f)
                else:
                    r = self._model.run(imgs)
                nr = [
                {
                    'greedy': e['greedy'],
                    'beam_search': e['beam_search'],
                    'prepro_img': i
                } for (e, i) in zip(r, imgs)]
                res.extend(nr)
        return res

    def run_on_images(self, images):
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
                'greedy': e['greedy'],
                'beam_search': e['beam_search'],
                'prepro_img': i
            } for (e, i) in zip(r, images)
        ]

def create_demo_runner():
    prepro_cfg = {
        'targetWidth': 224,
        'targetHeight': 224,
        'mode': 1
    }
    prepro = create_preprocessor(prepro_cfg)

    # model_cfg = {
    #     'type': 'neuralmonkey',
    #     'input': 'images',
    #     'configPath': None,
    #     'varsPath': None,
    #     'imageSeries':
    # }
    model_cfg = {
        'type': 'plugin',
        'input': 'images',
        'plugin': {
            'path': '/home/sam/thesis-code/macaque/tests/mock_plugin_model.py',
        }
    }
    model = create_model_wrapper(model_cfg)
    return Runner(model=model, prepro=prepro)
