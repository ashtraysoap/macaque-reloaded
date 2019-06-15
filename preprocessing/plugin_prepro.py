from importlib import import_module
import os
import sys

IFC_PREPRO_FUNC = "preprocess"

def create_prepro_func(plugin_path):
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
        # Python searches for modules on the `sys.path`
        sys.path.append(directory)
        module = import_module(source)
    else:
        if not '' in sys.path:
            sys.path.append('')
        module = import_module(module_path)

    if not hasattr(module, IFC_PREPRO_FUNC):
            raise ValueError("The plugin file does not contain the function %s." 
                % IFC_PREPRO_FUNC)

    prepro_func = getattr(module, IFC_PREPRO_FUNC)
    return prepro_func