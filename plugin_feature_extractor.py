from importlib import import_module
import os
import sys

from feature_extractor import FeatureExtractor

INTERFACE_CLASS = "FeatureExtractorWrapper"
INTERFACE_METHOD = "run"

class PluginFeatureExtractor(FeatureExtractor):
    def __init__(self, plugin_path):
        
        if not os.path.isfile(plugin_path):
            raise ValueError("The file %s does not exist." % plugin_path)
        if not plugin_path[-3:] == '.py':
            raise ValueError("The plugin file has to contain a Python file extension.")
        
        # importing requires the '.py' stripped
        plugin_path = plugin_path[:-3]
        
        if plugin_path[0] == '/':
            # `plugin_path` is given in absolute terms
            path_split = os.path.split(plugin_path)
            directory = path_split[0]
            source = path_split[1]
            sys.path.append(directory)
            module = import_module(source)
        else:
            if not '' in sys.path:
                sys.path.append('')
            module = import_module(plugin_path)
        
        if not hasattr(module, INTERFACE_CLASS):
            raise ValueError("The plugin file does not contain the class %s." % INTERFACE_CLASS)

        self._modelWrapper = getattr(module, INTERFACE_CLASS)

        if not hasattr(self._modelWrapper, INTERFACE_METHOD):
            raise ValueError("The class {} in {} does not have a method {}."
                .format(INTERFACE_CLASS, plugin_path, INTERFACE_METHOD))

def extract_features(self, dataset):
    pass