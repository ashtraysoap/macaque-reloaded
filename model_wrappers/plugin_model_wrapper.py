from importlib import import_module
import os
import sys

from .model_wrapper import ModelWrapper

IFC_CLASS = "ModelWrapper"
IFC_METHOD = "run"

class PluginModelWrapper(ModelWrapper):
    """Class for models from user provided modules.
    
    The user can provide his own implementation of a model that 
    can be used in Macaque's pipeline, upon satisfying an interface 
    in his module. The module has to contain a class with a method 
    of specific names and signature.

    Attributes:
        runs_on_features: A boolean value, whether the model runs on features
            or on images.
    """

    def __init__(self, plugin_path, runs_on_features):
        """Initialize a PluginModelWrapper instance.

        Args:
            plugin_path: A string path to the plugin module.
            runs_on_features: A boolean value, whether the model runs on features.
                If False, it is assumed it runs on images.
        Raises:
            ValueError: The file given by `plugin_path` does not exist.
            ValueError: The file given by `plugin_path` does not end with .py.
            ValueError: The file does not contain the interface class.
            ValueError: The interface class does not contain the interface
                method.
        """

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
        """Run the model on inputs.

        Args:
            inputs: A Numpy Array of inputs.
        Returns:
            A list of dictionaries holding the results.
        """
        y = self._run(inputs)
        # validate results

        return y
