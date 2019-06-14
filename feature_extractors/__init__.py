from enum import Enum

from .feature_extractor import FeatureExtractor
from .keras_feature_extractor import KerasFeatureExtractor
from .neural_monkey_feature_extractor import NeuralMonkeyFeatureExtractor
from .plugin_feature_extractor import PluginFeatureExtractor

SLIM_PATH = "/home/sam/Documents/CodeBox/BC/code/lib/tensorflow-models/research/slim"

class FeatureExtractorId(Enum):
    Keras = "keras"
    Slim = "tf-slim"
    Plugin = "plugin"

def create_feature_extractor(extractor_config):
    extractor_id = extractor_config['method']

    if extractor_id == FeatureExtractorId.Slim:
        slim_config = extractor_config['tf-slim']
        net_type = slim_config['netType']
        model_ckpt = slim_config['modelCkpt']
        feature_map = slim_config['featureMap']
        extractor = NeuralMonkeyFeatureExtractor(net=net_type,
                    slim_models=SLIM_PATH,
                    model_checkpoint=model_ckpt,
                    conv_map=feature_map)

    elif extractor_id == FeatureExtractorId.Keras:
        keras_config = extractor_config['keras']
        net_type = keras_config['netType']
        extractor = KerasFeatureExtractor(net_id=net_type)

    elif extractor_id == FeatureExtractorId.Plugin:
        plugin_config = extractor_config['plugin']
        src_path = plugin_config['sourcePath']
        extractor = PluginFeatureExtractor(plugin_path=src_path)

    else:
        raise ValueError("Unsupported feature extractor type %s." % extractor_id)

    return extractor