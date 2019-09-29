from importlib import import_module
import os
import sys

from .model_wrapper import ModelWrapper

IFC_CLASS = "ModelWrapper"
IFC_METHOD = "run"

class PluginModelWrapper(ModelWrapper):
    def __init__(self, plugin_path, runs_on_features):
        self._runs_on_features = runs_on_features

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

        if hasattr(wrapper_class, IFC_METHOD):
            self._method = getattr(self._model_wrapper, IFC_METHOD)
            self._run = lambda x: self._method(x)
        else:
            raise ValueError("The class {} in {} does not provide the `run` method."
                .format(IFC_CLASS, plugin_path))

    @property
    def runs_on_features(self):
        return self._runs_on_features

    def run(self, inputs):
        """
        Returns:
            A list of dictionaries. Each dictionary contains the keys
            `caption`, `alignments`, `beam_search_output_graph`.
        """
        y = self._run(inputs)
        # validate results

        return y
