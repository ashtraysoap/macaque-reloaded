from enum import Enum

from .neural_monkey_model_wrapper import NeuralMonkeyModelWrapper
from .plugin_model_wrapper import PluginModelWrapper


class ModelType(Enum):
    """Class enumerating supported types of model wrappers.

    Supported types are:
        neuralmonkey
        plugin
    """
    
    NeuralMonkey = "neuralmonkey"
    Plugin = "plugin"

def create_model_wrapper(model_config):
    """Create a model wrapper from the config dictionary.

    Args:
        model_config: A dictionary with the following structure
            {
                'type': { 'neuralmonkey' | 'plugin' },
                'input': { 'images' | 'features' },
                'neuralmonkey': {
                    'configPath': { a string path to the Neural Monkey 
                        configuration file }
                    'varsPath': { a string path to the model checkpoint }
                    'imageSeries': { the name of the data series under which 
                        images are expected }
                    'featureSeries': { the name of the data series under which 
                        features are expected }
                    'srcCaptionSeries': { the name of the data series under 
                        which source captions are expected }
                },
                'plugin': {
                    'path': { a string path to the plugin source }
                }
            }
            Only one of the keys 'neuralmonkey' and 'plugin' have to be fully
            provided, depending on the model wrapper type.
    Returns:
        A model wrapper instance.
    Raises:
        ValueError: Unsupported `type` value.
    """

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