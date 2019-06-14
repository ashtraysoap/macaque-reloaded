import os
from enum import Enum

import numpy as np
import neuralmonkey.dataset as dataset
from neuralmonkey.experiment import Experiment

from config_analyzer import config_infer
from data import merge_datasets
from feature_extractors import create_feature_extractor

def create_prepro(prepro_config):
    method = prepro_config['method']
    if method == 'none':
        pass
    elif method == 'source':
        pass

def create_model_wrapper(model_config):
        model_opts = json_config['model']
        if model_opts['method'] == 'neural-monkey':
            config_path = model_opts['configPath']
            vars_path = model_opts['varsPath']
            model_ifc = NeuralMonkeyModelInterface(config_path=config_path,
                vars_path=vars_path)
        elif model_opts['method'] == 'tf-source':
            pass
        elif model_opts['method'] == 'source':
            pass
        else:
            raise ValueError("Unsupported model type %s." % model_opts['method'])


def create_model_interface(json_config):
    model_ifc = ModelInterface()

    if json_config['preprocessing']:
        prepro = create_prepro(json_config['preprocessing'])
        model_ifc.attach_prepro(prepro)

    if json_config['featureExtractor']:
        feature_ext = create_feature_extractor(json_config['featureExtractor'])
        model_ifc.attach_feature_extractor(feature_ext)

    if json_config['model']:
        model = create_model_wrapper(json_config['model'])
        model_ifc.attach_model(model)

    return model_ifc

class Task(Enum):
    Unknown = 0
    ImageCaptioning = 1
    MultimodalTranslation = 2

class ModelInterface:
    def __init__(self):
        raise NotImplementedError()

    def initialize(self):
        raise NotImplementedError()

    def run_on_dataset(self, dataset):
        results = []
        for batch in dataset:
            b = self.format_batch(batch)
            out = self.run_on_batch(b)
            results.extend(out)
        out = self.reconstruct_dataset(results)
        d = merge_datasets(dataset, out)
        return (d, out)

    def format_batch(self, batch):
        """Processes the batch into a form acceptable by the model.
        """
        raise NotImplementedError()

    def run_on_batch(self, batch):
        """Runs the model on the batch
        """
        raise NotImplementedError()

    def reconstruct_dataset(self, data):
        raise NotImplementedError()

    def to_json(self):
        raise NotImplementedError()

class NeuralMonkeyModelInterface(ModelInterface):
    def __init__(self, config_path, vars_path):
        if not os.path.isfile(config_path):
            raise ValueError("File {} does not exist.".format(config_path))
        
        self._config_path = config_path

        self._task = Task.Unknown
        self._img_series = ""
        self._img_reader = ""
        self._img_reader_section = ""
        self._ref_series = ""
        self._src_cap_series = ""

        # try to infere the correspondence between data and model inputs
        concl_dict = config_infer(config_path)
        if concl_dict['images'] is not None:
            self._task = Task.ImageCaptioning
            self._img_series = concl_dict['images']['series']
            self._img_reader = concl_dict['images']['reader']
            self._img_reader_section = concl_dict['images']['section']
        if concl_dict['source_captions'] is not None:
            self._task = Task.MultimodalTranslation
            self._src_cap_series = concl_dict['src_captions']
        if concl_dict['references'] is not None:
            self._ref_series = concl_dict['references']

        self._feature_extractor = None

        # potentially remove dataset sections from the config

        self._exp = Experiment(config_path=config_path)
        self._exp.build_model()
        self._exp.load_variables([vars_path])

    @property
    def task(self):
        return self._task

    @property
    def decoder_only(self):
        return True if self._img_reader == "numpy_reader" else False

    @feature_extractor.setter
    def feature_extractor(self, value):
        self._feature_extractor = value

    def format_batch(self, batch):
        """Processes the batch into a form acceptable by the model.

        Args:
            batch: A `Dataset` class instance.
        Returns:
            A Neural Monkey Dataset of a form that the model expects.
        """
        if self._task == Task.ImageCaptioning:
            if self._img_reader == "numpy_reader":
                if not self._feature_extractor:
                    raise ValueError("Feature extractor is None.")
                
                feature_maps = self._feature_extractor.extract_features(batch)
                
                return dataset.Dataset("macaque_data",
                        {self._img_series: np.array(feature_maps)},
                        {})
                
            elif self._img_reader == "imagenet_reader":
                # process for imagenet
                raise NotImplementedError()
            else:
                raise ValueError("Unsupported reader {}.".format(self._img_reader))
        elif self._task == Task.MultimodalTranslation:
            raise NotImplementedError()

    def run_on_batch(self, batch):
        return self._exp.run_model(dataset=batch, write_out=False)

    def reconstruct_dataset(self, data):
        pass


if __name__ == "__main__":
    ifc = NeuralMonkeyModelInterface('tests/enc-dec-test.ini', '../enc-dec-test/variables.data')