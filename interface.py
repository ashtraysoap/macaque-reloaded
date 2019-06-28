import os
from enum import Enum

from feature_extractors import create_feature_extractor
from model_wrappers import create_model_wrapper
from preprocessing import create_prepro


def create_model_interface(json_config):
    model_ifc = ModelInterface()

    if json_config['preprocessing']:
        prepro = create_prepro(json_config['preprocessing'])
        model_ifc.preprocessing = prepro

    if json_config['featureExtractor']:
        feature_ext = create_feature_extractor(json_config['featureExtractor'])
        model_ifc.feature_extractor = feature_ext

    if json_config['model']:
        model = create_model_wrapper(json_config['model'])
        model_ifc.model_wrapper = model

    return model_ifc

class ModelInterface:
    def __init__(self):
        self._preprocessing = None
        self._feature_extractor = None
        self._model_wrapper = None
        self._batch_size = 0

    @property
    def preprocessing(self):
        return self._preprocessing

    @preprocessing.setter
    def preprocessing(self, value):
        self._preprocessing = value

    @property
    def feature_extractor(self):
        return self._feature_extractor

    @feature_extractor.setter
    def feature_extractor(self, value):
        self._feature_extractor = value

    @property
    def model_wrapper(self):
        return self._model_wrapper

    @model_wrapper.setter
    def model_wrapper(self, value):
        self._model_wrapper = value

    @property
    def batch_size(self):
        return self._batch_size

    @batch_size.setter
    def batch_size(self, value):
        self._batch_size = value

    def run_on_dataset(self, dataset):
        dataset.batch_size = self._batch_size
        results = []

        for batch in dataset:
            if self._preprocessing:
                batch = self._preprocess(batch)
            if self._feature_extractor:
                batch = self._extract_features(batch)
            out = self._run_model(batch)
            results.extend(out)
        return results

    def to_json(self):
        raise NotImplementedError()

    def _preprocess(self, dataset):
        return self._preprocessing(dataset)

    def _extract_features(self, dataset):
        return self._feature_extractor.extract_features(dataset)

    def _run_model(self, dataset):
        return self._model_wrapper.run(dataset)

    # def run_on_dataset(self, dataset):
    #     results = []
    #     for batch in dataset:
    #         b = self.format_batch(batch)
    #         out = self.run_on_batch(b)
    #         results.extend(out)
    #     out = self.reconstruct_dataset(results)
    #     d = merge_datasets(dataset, out)
    #     return (d, out)