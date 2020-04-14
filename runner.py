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

    return Runner(name=name,
        model=model,
        feature_extractor=encoder,
        prepro=prepro)

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
        name=None):
        """Initializes the Runner."""

        self._name = name
        self._prepro = prepro
        self._feature_extractor = feature_extractor
        self._model = model
        self._idx = None

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
                    'greedy': e['greedy'],
                    'beam_search': e['beam_search'],
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
                'greedy': e['greedy'],
                'beam_search': e['beam_search'],
                'prepro_img': i
            } for (e, i) in zip(r, images)
        ]

def create_demo_runner():
    """Creates a demonstrational runner.

    Creates a defualt runner, not specified by a user configuration.
    It is used to demonstrate Macaque's features.

    Returns:
        A Runner instance.
    """

    prepro_cfg = {
        'targetWidth': 224,
        'targetHeight': 224,
        'mode': 1,
        'name': "_demo_prepro"
    }
    prepro = create_preprocessor(prepro_cfg)

    encoder_cfg = {
        'type': 'keras',
        'keras': {
            'netType': "VGG16",
            'layerSpec': "block5_conv3",
            'ckptPath': ""
        },
        'name': "_demo_encoder"
    }
    encoder = create_feature_extractor(encoder_cfg)

    model_cfg = {
        'type': 'neuralmonkey',
        'input': 'images',
        'neuralmonkey': {
            'configPath': "/home/sam/thesis-code/NeuralMonkeyModels/experiment.ini",
            'varsPath': "/media/sam/Kafka/190424-1/avg-0",
            'dataSeries': "images",
            'srcCaptionSeries': "",
            'greedySeries': "greedy_caption",
            'attnSeries': "alpha",
            'bsSeries': "bs_target"
        },
        'name': "_demo_model"
    }
    model = create_model_wrapper(model_cfg)

    return Runner(model=model, feature_extractor=encoder, prepro=prepro)
