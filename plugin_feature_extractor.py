from enum import Enum
from importlib import import_module
import os
import sys

from feature_extractor import FeatureExtractor

class InterfaceMethod(Enum):
    RunOnPaths = 0
    RunOnImages = 1
    RunOnDataset = 2

IFC_CLASS = "FeatureExtractorWrapper"
IFC_METHODS = {
    InterfaceMethod.RunOnPaths: 'run_on_paths',
    InterfaceMethod.RunOnImages: 'run_on_images',
    InterfaceMethod.RunOnDataset: 'run_on_dataset'
}

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
            if not '' in sys.path:
                sys.path.append('')
            module = import_module(module_path)
        
        if not hasattr(module, IFC_CLASS):
            raise ValueError("The plugin file does not contain the class %s." % IFC_CLASS)

        wrapper_class = getattr(module, IFC_CLASS)
        self._model_wrapper = wrapper_class()

        if hasattr(wrapper_class, IFC_METHODS[InterfaceMethod.RunOnPaths]):
            self._method_id = InterfaceMethod.RunOnPaths
        elif hasattr(wrapper_class, IFC_METHODS[InterfaceMethod.RunOnImages]):
            self._method = InterfaceMethod.RunOnImages
        elif hasattr(wrapper_class, IFC_METHODS[InterfaceMethod.RunOnDataset]):
            self._method = InterfaceMethod.RunOnDataset
        else:
            raise ValueError("The class {} in {} does not provide any of the interface methods."
                .format(IFC_CLASS, plugin_path))

        self._method = getattr(self._model_wrapper, IFC_METHODS[self._method_id])

def extract_features(self, dataset):
    elems = dataset.elements
    results = []
    
    if self._method_id == InterfaceMethod.RunOnPaths:
        prefix = dataset.prefix
        paths = [os.path.join(prefix, e.source) for e in elems]
        results = self._method(paths)
    elif self._method_id == InterfaceMethod.RunOnImages:
        # raw images
        if dataset.preprocessed_images:
            imgs = [e.prepro_img for e in elems]
        # preprocessed images
        elif dataset.raw_images:
            imgs = [e.raw_img for e in elems]
        else:
            raise RuntimeError("Dataset does not contain any image data.")
        results = self._method(imgs)
    elif self._method_id == InterfaceMethod.RunOnDataset:
        results = self._method(dataset)
    else:
        raise RuntimeError()

    return results