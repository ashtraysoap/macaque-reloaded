from enum import Enum

from .neural_monkey_model_wrapper import NeuralMonkeyModelWrapper
from .plugin_model_wrapper import PluginModelWrapper

class ModelType(Enum):
    NeuralMonkey = "neuralmonkey"
    Plugin = "plugin"

def create_model_wrapper(model_config):
    model_type = model_config['type']
    runs_on_features = False if model_config['input'] == "images" else True
    if model_type == ModelType.NeuralMonkey.value:
        
        nm_config = model_config['neuralmonkey']
        config_path = nm_config['configPath']
        vars_path = nm_config['varsPath']
        image_series = nm_config['imageSeries']
        feature_series = nm_config['featureSeries']
        src_caption_series = nm_config['srcCaptionSeries']

        model = NeuralMonkeyModelWrapper(config_path=config_path,
                vars_path=vars_path,
                image_series=image_series,
                feature_series=feature_series,
                src_caption_series=src_caption_series,
                runs_on_features=runs_on_features)

    elif model_type == ModelType.Plugin.value:
        plugin_config = model_config['plugin']
        src_path = plugin_config['path']
        
        model = PluginModelWrapper(plugin_path=src_path, 
                runs_on_features=runs_on_features)

    else:
        raise ValueError("Unsupported model type %s." % model_type)

    return model