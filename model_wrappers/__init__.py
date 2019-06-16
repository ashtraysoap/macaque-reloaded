from enum import Enum

from .neural_monkey_model_wrapper import NeuralMonkeyModelWrapper
from .plugin_model_wrapper import PluginModelWrapper

class ModelType(Enum):
    NeuralMonkey = "neural-monkey"
    Plugin = "plugin"

def create_model_wrapper(model_config):
    model_type = model_config['model_type']
    if model_type == ModelType.NeuralMonkey:
        
        config_path = model_config['configPath']
        vars_path = model_config['varsPath']
        image_series = model_config['imageSeries']
        feature_series = model_config['featureSeries']
        src_caption_series = model_config['srcCaptionSeries']

        model = NeuralMonkeyModelWrapper(config_path=config_path,
                vars_path=vars_path,
                image_series=image_series,
                feature_series=feature_series,
                src_caption_series=src_caption_series)

    elif model_type == ModelType.Plugin:
        plugin_path = model_config['pluginPath']
        
        model = PluginModelWrapper(plugin_path=plugin_path)

    else:
        raise ValueError("Unsupported model type %s." % model_type)

    return model