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

def create_feature_extractor(extractor_config, from_response=True):
    """Creates a FeatureExtractor from the config dictionary.

    Args:
        extractor_config: A dictionary.
        from_response: Boolean value; whether the config was sent from the client
            in a response, or was loaded from a configuration file. This is needed
            because the data format differs slightly.

    Returns:
        A feature extractor instance depending on the configuration.
    Raises:
        ValueError: Unsupported `type` value.
    """

    extractor_id = extractor_config['type']
    name = extractor_config['name']

    if extractor_id == FeatureExtractorId.Slim.value:
        if from_response:
            slim_config = extractor_config['tfSlim']
        else:
             slim_config = extractor_config
        net_type = slim_config['network']
        model_ckpt = slim_config['checkpoint']
        feature_map = slim_config['featureMap']
        extractor = NeuralMonkeyFeatureExtractor(net=net_type,
                    slim_models=SLIM_PATH,
                    model_checkpoint=model_ckpt,
                    conv_map=feature_map,
                    name=name)

    elif extractor_id == FeatureExtractorId.Keras.value:
        if from_response:
            keras_config = extractor_config['keras']
        else:
            keras_config = extractor_config
        net_type = keras_config['network']
        layer_spec = keras_config['layerSpec']
        if 'checkpoint' in keras_config:
            ckpt_path = keras_config['checkpoint']
        else:
            ckpt_path = ""
        extractor = KerasFeatureExtractor(net_id=net_type,
                    layer_spec=layer_spec,
                    ckpt_path=ckpt_path,
                    name=name)

    elif extractor_id == FeatureExtractorId.Plugin.value:
        if from_response:
            plugin_config = extractor_config['plugin']
        else:
            plugin_config = extractor_config
        src_path = plugin_config['path']
        extractor = PluginFeatureExtractor(plugin_path=src_path, name=name)

    elif extractor_id == FeatureExtractorId.Null.value:
        return None

    else:
        raise ValueError("Unsupported feature extractor type %s." % extractor_id)

    return extractor