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
                src_caption_series="",
                caption_series="",
                alignments_series="",
                bs_graph_series=""):

        if not os.path.isfile(config_path):
            raise ValueError("File {} does not exist.".format(config_path))

        self._config_path = config_path
        self._vars_path = vars_path
        self._image_series = image_series
        self._feature_series = feature_series
        self._src_caption_series = src_caption_series
        self._caption_series = caption_series
        self._alignments_series = alignments_series
        self._bs_graph_series = bs_graph_series

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
            if dataset.preprocessed_imgs:
                imgs = [e.prepro_img for e in elems]
            else:
                if not dataset.images:
                    dataset.load_images()
                imgs = [e.image for e in elems]
            
            if self._src_caption_series:
                # handle multimodal translation case
                pass
            else:
                ds = Dataset("macaque_data", {self._image_series: lambda: np.array(imgs)}, {})

        # dec-only model (runs on feature maps)
        elif self._feature_series:
            if dataset.feature_maps:
                feats = [e.feature_map for e in elems]
            else:
                raise RuntimeError("The dataset does not contain any features.")
            
            if self._src_caption_series:
                # handle multimodal translation case
                pass
            else:
                ds = Dataset("macaque_data", {self._feature_series: lambda: np.array(feats)}, {})
        
        else:
            raise NotImplementedError()

        runners_results, output_series = self._exp.run_model(dataset=ds, write_out=False)

        if self._caption_series:
            captions = output_series[self._caption_series]
        else:
            captions = [None] * dataset.count
        if self._alignments_series:
            alignments = output_series[self._alignments_series]
        else:
            alignments = [None] * dataset.count
        if self._bs_graph_series:
            bs_graph_output = output_series[self._bs_graph_series]
        else:
            bs_graph_output = [None] * dataset.count
        
        results = []
        for c, a, b in zip(captions, alignments, bs_graph_output):
            results.append({
                'caption': c,
                'alignments': a,
                'beam_search_output_graph': b
            })

        return results
