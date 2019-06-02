import numpy as np
from neuralmonkey.dataset import Dataset
from neuralmonkey.experiment import Experiment

from feature_extractor import NeuralMonkeyFeatureExtractor

class ModelInterface:
    def __init__(self):
        pass

    def initialize(self):
        pass

    def run(self):
        pass

class NeuralMonkeyModelInterface(ModelInterface):
    def __init__(self,
                config_path,
                variables_path,
                checkpoint_path=None,
                feature_extractor=None,
                data_generator=None):
        self._config_path = config_path
        self._variables_path = variables_path
        self._checkpoint_path = checkpoint_path
        self._feature_extractor = feature_extractor
        self._data_generator = data_generator

        # check validity of arguments

        self._decoder_only = True


    def initialize(self):
        self._exp = Experiment(config_path=self._config_path)
        self._exp.build_model()
        self._exp.load_variables([self._variables_path])

    def run(self):
        data_id = "images"

        if self._decoder_only:
            if not self._feature_extractor.initialized:
                self._feature_extractor.initialize()
            while True:
                try:
                    batch = self._feature_extractor.next_batch()
                    # create the dataset by dataset.load mimicing the way it is created by config files
                    # this should be possible after you know the reader to user (and the name of the data series)
                    dataset = Dataset("macaque_dataset", {data_id: lambda: np.array(batch)}, {})
                    results = self._exp.run_model(dataset, write_out=False)
                    print(results)
                except StopIteration:
                    break
        else:
            while True:
                try:
                    batch = self._data_generator.next_batch()
                    dataset = Dataset("macaque_dataset", {data_id: lambda: batch}, {})
                    results = self._exp.run_model(dataset, write_out=False)
                    print(results)
                except StopIteration:
                    break