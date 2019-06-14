from collections import namedtuple
import os

import numpy as np
import tensorflow as tf
from neuralmonkey.dataset import Dataset
from neuralmonkey.encoders.imagenet_encoder import ImageNet
from neuralmonkey.readers.image_reader import single_image_for_imagenet

from data import Dataset as MacaqueDataset
from .feature_extractor import FeatureExtractor

S = namedtuple('NeuralMonkeyEncoderSpec', ['net_id', 'input_size'])

MODELS = {
    'VGG16': S('vgg_16', (224, 224)),
    'VGG19': S('vgg_19', (224, 224)),
    'ResNet50V2': S('resnet_v2_50', (229, 229)),
    'ResNet101V2': S('resnet_v2_101', (229, 229)),
    'ResNet152V2': S('renset_v2_152', (229, 229))
}

class NeuralMonkeyFeatureExtractor(FeatureExtractor):
    def __init__(self, 
                net, 
                slim_models,
                model_checkpoint,
                conv_map,
                vector=None,
                data_id="images"):
        if net not in MODELS:
            raise ValueError("Unsupported network %s." % net)
        
        if conv_map is None == vector is None:
            raise ValueError(
                "You must provide either convolutional map or feed-forward layer.")

        net_spec = MODELS[net]
        if net_spec.net_id in ['vgg_16', 'vgg_19']:
            self._vgg_normalization = True
            self._zero_one_normalization = False
        elif net_spec.net_id is ['resnet_v2_50', 'resnet_v2_101', 'resnet_v2_152']:
            self._vgg_normalization = False
            self._zero_one_normalization = True

        self._data_id = data_id

        self._imagenet = ImageNet(name="imagenet",
                data_id=self._data_id,
                network_type=net_spec.net_id,
                slim_models_path=slim_models,
                load_checkpoint=model_checkpoint,
                spatial_layer=conv_map,
                encoded_layer=vector)

        self._fetch = self._imagenet.spatial_states
        self._net_spec = net_spec
        self._session = tf.Session()
        self._session.run(tf.global_variables_initializer())
        self._imagenet.load(self._session)
        
    def extract_features(self, dataset):
        """Extracts features from the dataset.
        
        Args:
            dataset: A `dataset.Dataset` class instance.
        Returns:
            A list of numpy arrays, the extracted feature maps.
        """
        prefix = dataset.prefix
        elems = dataset.elements
        paths = [os.path.join(prefix, e.source) for e in elems]

        images = [single_image_for_imagenet(img_path,
                self._net_spec.input_size[0], 
                self._net_spec.input_size[1],
                self._vgg_normalization,
                self._zero_one_normalization)
                for img_path in paths]

        ds = Dataset("macaque_data",
                {self._data_id: lambda: np.array(images)},
                {})
        feed_dict = self._imagenet.feed_dict(ds)
        return self._session.run(self._fetch, feed_dict=feed_dict)
