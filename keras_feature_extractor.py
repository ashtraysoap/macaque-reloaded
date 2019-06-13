from collections import namedtuple
from importlib import import_module
import os

from keras.preprocessing import image
import numpy as np

from feature_extractor import FeatureExtractor

S = namedtuple('KerasEncoderSpec', ['net', 'module'])

MODELS = {
    'Xception': S('Xception', 'xception'),
    'VGG16': S('VGG16', 'vgg16'),
    'VGG19': S('VGG19', 'vgg19'),
    'ResNet50': S('ResNet50', 'resnet'),
    'ResNet101': S('ResNet101', 'resnet'),
    'ResNet152': S('ResNet152', 'resnet'),
    'ResNet50V2': S('ResNet50V2', 'resnet_v2'),
    'ResNet101V2': S('ResNet101V2', 'resnet_v2'),
    'ResNet152V2': S('ResNet152V2', 'resnet_v2'),
    'ResNeXt50': S('ResNetXt50', 'resnext'),
    'ResNeXt101': S('ResNeXt101', 'resnext'),
    'InceptionV3': S('InceptionV3', 'inception_v3')
}

class KerasFeatureExtractor(FeatureExtractor):
    def __init__(self, net_id, width=224, height=224):
        if not net_id in MODELS:
            raise ValueError("Unsupported network %s." % net_id)

        enc_spec = MODELS[net_id]
        module = import_module('keras.application.' + enc_spec.module)
        model_constr = getattr(module, enc_spec.net) 
        self._model = model_constr(weights='imagenet', include_top=False, pooling=None)
        self._preprocess_input = getattr(module, 'preprocess_input')
        self._width = width
        self._height = height

    def extract_features(self, dataset):
        prefix = dataset.prefix
        elems = dataset.elements
        paths = [os.path.join(prefix, e.source) for e in elems]

        imgs = [image.load_img(p, target_size=(self._width, self._height)) 
            for p in paths]
        xs = [image.img_to_array(i) for i in imgs]
        xs = [np.expand_dims(x, axis=0) for x in xs]
        xs = [self._preprocess_input(x) for x in xs]

        return self._model.predict(xs)