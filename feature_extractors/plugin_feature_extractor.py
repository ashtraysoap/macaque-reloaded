from enum import Enum
from importlib import import_module
import os
import sys

import numpy as np

from .feature_extractor import FeatureExtractor

class InterfaceMethod(Enum):
    RunOnPaths = 0
    RunOnImages = 1
    RunOnDataset = 2

IFC_CLASS = "FeatureExtractorWrapper"
IFC_METHOD = "extract_features"

class PluginFeatureExtractor(FeatureExtractor):
    def __init__(self, plugin_path):
        
        if not os.path.isfile(plugin_path):
            raise ValueError("The file %s does not exist." % plugin_path)
        if not plugin_path[-3:] == '.py':
            raise ValueError("The plugin file has to contain a Python file extension.")
        
        # importing requires the '.py' stripped
        module_path = plugin_path[:-3]
        
        if module_path[0] == '/':
            # `plugin_path` is given in absolute terms
            path_split = os.path.split(module_path)
            directory = path_split[0]
            source = path_split[1]
            sys.path.append(directory)
            module = import_module(source)
        else:
            path_split = os.path.split(module_path)
            cwd = os.getcwd()
            directory = os.path.join(cwd, path_split[0])
            sys.path.append(directory)
            module = import_module(path_split[1])
        
        if not hasattr(module, IFC_CLASS):
            raise ValueError("The plugin file does not contain the class %s." % IFC_CLASS)

        wrapper_class = getattr(module, IFC_CLASS)
        self._model_wrapper = wrapper_class()

        if not hasattr(wrapper_class, IFC_METHOD):
            raise ValueError("The class {} in {} does not provide the method {}."
                .format(IFC_CLASS, plugin_path, IFC_METHOD))

        self._method = getattr(self._model_wrapper, IFC_METHOD)


    def extract_features(self, images):
        """Extract features from the given images.
        
        Args:
            images: A numpy array of images.

        Returns:
            A numpy array of features.
        """
    
        results = self._method(images)

        if isinstance(results, list):
            results = np.array(results)
        elif not isinstance(results, np.ndarray):
            raise RuntimeError("Features are neither a list nor a numpy array.")

        return results