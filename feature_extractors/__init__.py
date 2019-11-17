from enum import Enum

from .feature_extractor import FeatureExtractor
from .keras_feature_extractor import KerasFeatureExtractor
from .neural_monkey_feature_extractor import NeuralMonkeyFeatureExtractor
from .plugin_feature_extractor import PluginFeatureExtractor

SLIM_PATH = "/home/sam/Documents/CodeBox/BC/code/lib/tensorflow-models/research/slim"

class FeatureExtractorId(Enum):
    """Class enumerating supported feature extractor types."""

    Keras = "keras"
    Slim = "tf-slim"
    Plugin = "plugin"
    Null = "none"

def create_feature_extractor(extractor_config):
    """Creates a FeatureExtractor from the config dictionary.

    Args:
        extractor_config: A dictionary with the following structure
            {
                'type': { 'tf-slim' | 'keras' | 'plugin' | 'none' },
                'keras': {
                    'netType': { see KerasFeatureExtractor for supported values }
                    'layerSpec':
                    'ckptPath':
                },
                'plugin': {
                    'path': { a string path to the plugin source }
                },
                'tfSlim': {
                    'netType': { see NeuralMonkeyFeatureExtractor for supported values },
                    'checkpoint': { a string path to the model checkpoint },
                    'featureMap': { the feature map to choose as output,
                        see NeuralMonkeyFeatureExtractor for options },
                    'slimPath': { a string path to the Tensorflow Slim repository }
                }
            }
            Only values for the selected type need to be provided.
    Returns:
        A feature extractor instance depending on the configuration.
    Raises:
        ValueError: Unsupported `type` value.
    """

    extractor_id = extractor_config['type']

    if extractor_id == FeatureExtractorId.Slim.value:
        slim_config = extractor_config['tfSlim']
        net_type = slim_config['netType']
        model_ckpt = slim_config['checkpoint']
        feature_map = slim_config['featureMap']
        extractor = NeuralMonkeyFeatureExtractor(net=net_type,
                    slim_models=SLIM_PATH,
                    model_checkpoint=model_ckpt,
                    conv_map=feature_map)

    elif extractor_id == FeatureExtractorId.Keras.value:
        keras_config = extractor_config['keras']
        net_type = keras_config['netType']
        layer_spec = keras_config['layerSpec']
        ckpt_path = keras_config['ckptPath']
        extractor = KerasFeatureExtractor(net_id=net_type,
                    layer_spec=layer_spec,
                    ckpt_path=ckpt_path)

    elif extractor_id == FeatureExtractorId.Plugin.value:
        plugin_config = extractor_config['plugin']
        src_path = plugin_config['path']
        extractor = PluginFeatureExtractor(plugin_path=src_path)

    elif extractor_id == FeatureExtractorId.Null.value:
        return None

    else:
        raise ValueError("Unsupported feature extractor type %s." % extractor_id)

    return extractor