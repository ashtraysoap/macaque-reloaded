from enum import Enum

from .plugin_prepro import create_prepro_func

class PreproMethodId(Enum):
    Plugin = "plugin"
    Rescale = "rescale"
    VGGPrepro = "vggPrepro"
    ResNetPrepro = "resnetPrepro"
    Null = "none"

def create_prepro(prepro_config):
    method = prepro_config['method']
    if method == PreproMethodId.Rescale.value:
        prepro_func = dummy_prepro
    elif method == PreproMethodId.Plugin.value:
        src_path = prepro_config['pluginPath']
        prepro_func = create_prepro_func(src_path)
    elif method == PreproMethodId.VGGPrepro.value:
        prepro_func = dummy_prepro
    elif method == PreproMethodId.ResNetPrepro.value:
        prepro_func = dummy_prepro
    elif method == PreproMethodId.Null.value:
        return None
    else:
        raise ValueError("Unsupported preprocessing type {}.".format(method))

    return prepro_func

def dummy_prepro():
    pass