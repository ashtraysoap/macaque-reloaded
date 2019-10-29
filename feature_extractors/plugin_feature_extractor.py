from enum import Enum
from importlib import import_module
import os
import sys

import numpy as np

from .feature_extractor import FeatureExtractor


IFC_CLASS = "FeatureExtractorWrapper"
IFC_METHOD = "extract_features"

class PluginFeatureExtractor(FeatureExtractor):
    """Class for feature extractors from user provided modules.
    
    The user can provide his own implementation of a feature extractor
    that can be used in Macaque's model pipeline, upon satisfying an
    interface in his module. The module has to contain a class with a
    method of specific names and signature.
    """

    def __init__(self, plugin_path):
        """Initialize a PluginFeatureExtractor instance.
        
        Args:
            plugin_path: A string path to the plugin module.
        Raises:
            ValueError: The file in `plugin_path` does not exist.
            ValueError: The file in `plugin_path` does not end in .py.
            ValueError: The file does not contain the interface class.
            ValueError: The interface class does not contain the interface method.
        """
        
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
            images: A Numpy Array of images.
        Returns:
            A Numpy Array of features.
        Raises:
            RuntimeError: The results returned by the plugin are not in a
                supported format. Supported format are either Python list or
                Numpy Arrays.
        """
    
        results = self._method(images)

        if isinstance(results, list):
            results = np.array(results)
        elif not isinstance(results, np.ndarray):
            raise RuntimeError("Features are neither a list nor a Numpy Array.")

        return results