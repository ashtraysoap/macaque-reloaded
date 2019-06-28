from enum import Enum

from .neural_monkey_model_wrapper import NeuralMonkeyModelWrapper
from .plugin_model_wrapper import PluginModelWrapper

class ModelType(Enum):
    NeuralMonkey = "neural-monkey"
    Plugin = "plugin"

def create_model_wrapper(model_config):
    model_type = model_config['type']
    if model_type == ModelType.NeuralMonkey:
        
        nm_config = model_config['neuralMonkey']
        config_path = nm_config['configPath']
        vars_path = nm_config['varsPath']
        image_series = nm_config['imageSeries']
        feature_series = nm_config['featureSeries']
        src_caption_series = nm_config['srcCaptionSeries']

        model = NeuralMonkeyModelWrapper(config_path=config_path,
                vars_path=vars_path,
                image_series=image_series,
                feature_series=feature_series,
                src_caption_series=src_caption_series)

    elif model_type == ModelType.Plugin:
        plugin_config = model_config['plugin']
        src_path = plugin_config['sourcePath']
        
        model = PluginModelWrapper(plugin_path=src_path)

    else:
        raise ValueError("Unsupported model type %s." % model_type)

    return model