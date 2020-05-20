from collections import namedtuple
from importlib import import_module
import os

import numpy as np

from .feature_extractor import FeatureExtractor

S = namedtuple('KerasEncoderSpec', ['net', 'module', 'input_size'])

MODELS = {
    'Xception': S('Xception', 'xception', (299, 299)),
    'VGG16': S('VGG16', 'vgg16', (224, 224)),
    'VGG19': S('VGG19', 'vgg19', (224, 224)),
    'ResNet50': S('ResNet50', 'resnet', (224, 224)),
    'ResNet101': S('ResNet101', 'resnet', (224, 224)),
    'ResNet152': S('ResNet152', 'resnet', (224, 224)),
    'ResNet50V2': S('ResNet50V2', 'resnet_v2', (224, 224)),
    'ResNet101V2': S('ResNet101V2', 'resnet_v2', (224, 224)),
    'ResNet152V2': S('ResNet152V2', 'resnet_v2', (224, 224)),
    'ResNeXt50': S('ResNetXt50', 'resnext', (224, 224)),
    'ResNeXt101': S('ResNeXt101', 'resnext', (224, 224)),
    'InceptionV3': S('InceptionV3', 'inception_v3', (299, 299))
}

class KerasFeatureExtractor(FeatureExtractor):
    """A class for interfacing with Keras pretrained encoders.

    On the first usage of a network type the network weights will be 
    downloaded. This may take some time.

    Supported networks are:
        Xception
        VGG16
        VGG19
        ResNet50
        ResNet101
        ResNet152
        ResNet50V2
        ResNet101V2
        ResNet152V2
        ResNeXt50
        ResNeXt101
        InceptionV3
    """

    def __init__(self, net_id, layer_spec="", ckpt_path="", name=""):
        """Initialize a KerasFeatureExtractor instance.
        
        Args:
            net_id: A string identifier of the network.
            layer: The name of the layer to use for feature extraction.
            ckpt_path: A path to the stored model checkpoint.
            name: A string name of the network.
        Raises:
            ValueError: Unsupported network.
        """

        from keras.preprocessing import image
        from keras import Model
        from keras import backend as K

        super(KerasFeatureExtractor, self).__init__(name)
        
        K.clear_session()

        if not net_id in MODELS:
            raise ValueError("Unsupported network %s." % net_id)

        weights = 'imagenet' if not ckpt_path else ckpt_path
        enc_spec = MODELS[net_id]
        module = import_module('keras.applications.' + enc_spec.module)
        model_constr = getattr(module, enc_spec.net)
        self._model = model_constr(weights=weights, include_top=False, pooling=None)
        
        if layer_spec:
            layer = self._model.get_layer(layer_spec)
            self._model = Model(inputs=self._model.input, outputs=layer.output)

        # A Keras bug requires calling this function. 
        # See https://github.com/keras-team/keras/issues/6462.
        self._model._make_predict_function()            
        self._preprocess_input = getattr(module, 'preprocess_input')
        self._input_size = enc_spec.input_size

    def extract_features(self, images):
        """Extracts features from the images.

        Args:
            images: A Numpy Array of images from the source dataset.
        Returns:
            A Numpy Array of extracted features.
        """

        xs = [self._preprocess_input(x) for x in images]
        xs = np.asarray(xs)

        return self._model.predict(xs)
