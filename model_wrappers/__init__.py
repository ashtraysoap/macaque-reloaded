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

def create_model_wrapper(model_config, from_response=True):
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
                    'dataSeries': { the name of the data series under which 
                        model input data are expected }
                    'srcCaptionSeries': { the name of the data series under 
                        which source captions are expected }
                    'greedySeries':
                    'attnSeries':
                    'bsSeries':
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
    name = model_config['name']

    if 'input' in model_config:
        runs_on_features = False if model_config['input'] == "images" else True
    else:
        runs_on_features = True if model_config['runsOnFeatures'].lower() \
            == 'true' else False

    if model_type == ModelType.NeuralMonkey.value:
        if from_response:
            nm_config = model_config['neuralmonkey']
        else:
            nm_config = model_config
        config_path = nm_config['configPath']
        vars_path = nm_config['varsPath']
        data_series = nm_config['dataSeries']
        src_caption_series = nm_config['srcCaptionSeries']

        greedy_series = nm_config['greedySeries']
        attn_series = nm_config['attnSeries']
        bs_series = nm_config['bsSeries']

        model = NeuralMonkeyModelWrapper(config_path=config_path,
                vars_path=vars_path,
                data_series=data_series,
                src_caption_series=src_caption_series,
                runs_on_features=runs_on_features,
                caption_series=greedy_series,
                alignments_series=attn_series,
                bs_graph_series=bs_series,
                name=name)

    elif model_type == ModelType.Plugin.value:
        if from_response:
            plugin_config = model_config['plugin']
        else:
            plugin_config = model_config
        src_path = plugin_config['path']
        
        model = PluginModelWrapper(plugin_path=src_path, 
                runs_on_features=runs_on_features,
                name=name)

    else:
        raise ValueError("Unsupported model type %s." % model_type)

    return model