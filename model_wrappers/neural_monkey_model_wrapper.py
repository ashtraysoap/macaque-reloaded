import os

import numpy as np

from neuralmonkey.dataset import Dataset
from neuralmonkey.experiment import Experiment

from .model_wrapper import ModelWrapper

class NeuralMonkeyModelWrapper(ModelWrapper):
    def __init__(self,
                config_path,
                vars_path,
                image_series="",
                feature_series="",
                src_caption_series=""):

        if not os.path.isfile(config_path):
            raise ValueError("File {} does not exist.".format(config_path))

        self._config_path = config_path
        self._vars_path = vars_path
        self._image_series = image_series
        self._feature_series = feature_series
        self._src_caption_series = src_caption_series

        self._exp = Experiment(config_path=config_path)
        self._exp.build_model()
        self._exp.load_variables([vars_path])


    def run(self, dataset):
        """
        Returns:
            A list of dictionaries. Each dictionary contains the keys
            `caption`, `alignments`, `beam_search_output_graph`.
        """
        elems = dataset.elements

        # enc-dec model (runs on images)
        if self._image_series:
            if dataset.preprocessed_images:
                imgs = [e.prepro_img for e in elems]
            elif dataset.raw_images:
                imgs = [e.raw_img for e in elems]
            else:
                dataset.load_raw_imgs()
                imgs = [e.raw_img for e in elems]
            
            if self._src_caption_series:
                # handle multimodal translation case
                pass
            else:
                ds = Dataset("macaque_data", {self._image_series: lambda: np.array(imgs)}, {})

        # dec-only model (runs on feature maps)
        elif self._feature_series:
            if dataset.feature_maps:
                feats = [e.feature_map for e in elems]
            
            if self._src_caption_series:
                # handle multimodal translation case
                pass
            else:
                ds = Dataset("macaque_data", {self._feature_series: lambda: np.array(feats)}, {})

        runners_results, output_series = self._exp.run_model(dataset=ds, write_out=False)

        # at this point a correspondence between NM exp's output series and 
        # `caption` `alignments` `beam_search_output_graph` is required

        mock_result = {
            'caption': [],
            'alignments': [],
            'beam_search_output_graph': None
        }
        return [mock_result for e in dataset.elements]
