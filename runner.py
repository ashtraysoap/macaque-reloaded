def create_runner(macaque_state, runner_config):
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
                    'caption': e['caption'],
                    'alignments': e['alignments'],
                    'beam_search_output': e['beam_search_output'],
                    'prepro_img': i
                } for (e, i) in zip(r, imgs)]
                res.extend(nr)
        return res
