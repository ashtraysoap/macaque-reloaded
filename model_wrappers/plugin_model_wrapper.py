from enum import Enum
from importlib import import_module
import os
import sys

from .model_wrapper import ModelWrapper

class InterfaceMethod(Enum):
    RunOnPaths = 0
    RunOnImages = 1
    RunOnFeatures = 2
    RunOnDataset = 3

IFC_CLASS = "ModelWrapper"
IFC_METHODS = {
    InterfaceMethod.RunOnPaths: "run_on_paths",
    InterfaceMethod.RunOnImages: "run_on_images",
    InterfaceMethod.RunOnFeatures: "run_on_features",
    InterfaceMethod.RunOnDataset: "run_on_dataset"
}

class PluginModelWrapper(ModelWrapper):
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
            # Python searches for modules in `sys.path`
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

        if hasattr(wrapper_class, IFC_METHODS[InterfaceMethod.RunOnPaths]):
            self._method_id = InterfaceMethod.RunOnPaths
        elif hasattr(wrapper_class, IFC_METHODS[InterfaceMethod.RunOnImages]):
            self._method_id = InterfaceMethod.RunOnImages
        elif hasattr(wrapper_class, IFC_METHODS[InterfaceMethod.RunOnFeatures]):
            self._method_id = InterfaceMethod.RunOnFeatures
        elif hasattr(wrapper_class, IFC_METHODS[InterfaceMethod.RunOnDataset]):
            self._method_id = InterfaceMethod.RunOnDataset
        else:
            raise ValueError("The class {} in {} does not provide any of the interface methods."
                .format(IFC_CLASS, plugin_path))

        self._method = getattr(self._model_wrapper, IFC_METHODS[self._method_id])

    def run(self, dataset):
        """
        Returns:
            A list of dictionaries. Each dictionary contains the keys
            `caption`, `alignments`, `beam_search_output_graph`.
        """

        def run_model(inputs):
            return self._method(inputs)

        elems = dataset.elements
    
        if self._method_id == InterfaceMethod.RunOnPaths:
            prefix = dataset.prefix
            paths = [os.path.join(prefix, e.source) for e in elems]
            x = paths
        
        elif self._method_id == InterfaceMethod.RunOnImages:
            if dataset.preprocessed_imgs:
                imgs = [e.prepro_img for e in elems]
            else:
                if not dataset.images:
                    dataset.load_images()
                imgs = [e.image for e in elems]
            x = imgs
        
        elif self._method_id == InterfaceMethod.RunOnFeatures:
            if dataset.feature_maps:
                features = [e.feature_map for e in elems]
            else:
                raise RuntimeError("Dataset does not contain any feature maps.")
            x = features
            
        elif self._method_id == InterfaceMethod.RunOnDataset:
            x = dataset
        
        else:
            raise RuntimeError()

        y = run_model(x)
        # validate results

        return y
