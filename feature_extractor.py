"""
This module is based on the `imagenet_features.py` Neural Monkey script.
"""

import os

import numpy as np
import tensorflow as tf
from neuralmonkey.dataset import Dataset
from neuralmonkey.encoders.imagenet_encoder import ImageNet
from neuralmonkey.readers.image_reader import single_image_for_imagenet

class FeatureExtractor():
    def __init__(self):
        pass

    def initialize(self):
        pass

    def next_batch(self):
        pass

class NeuralMonkeyFeatureExtractor(FeatureExtractor):
    def __init__(self, 
                data_generator,
                net, 
                slim_models,
                model_checkpoint,
                conv_map,
                vector=None,
                data_id="images"):
        if conv_map is None == vector is None:
            raise ValueError(
                "You must provide either convolutional map or feed-forward layer.")

        if net.startswith("vgg_"):
            self._img_size = 224
            self._vgg_normalization = True
            self._zero_one_normalization = False
        elif net.startswith("resnet_v2"):
            self._img_size = 229
            self._vgg_normalization = False
            self._zero_one_normalization = True
        else:
            raise ValueError("Unspported network: {}.".format(net))

        self._datagen = data_generator
        self._data_id = data_id

        self._imagenet = ImageNet(name="imagenet", data_id=self._data_id,
            network_type=net, slim_models_path=slim_models, load_checkpoint=model_checkpoint,
            spatial_layer=conv_map, encoded_layer=vector)
        self._fetch = self._imagenet.spatial_states

        self.initialized = False

    def initialize(self):
        self._session = tf.Session()
        self._session.run(tf.global_variables_initializer())
        self._imagenet.load(self._session)
        self.initialized = True

    def next_batch(self):
        try:
            paths_batch = self._datagen.next_batch()
        except StopIteration:
            raise StopIteration("End of the dataset has been reached.")

        images = [single_image_for_imagenet(img_path, self._img_size, 
            self._img_size, self._vgg_normalization, self._zero_one_normalization)
             for img_path in paths_batch]
        
        dataset = Dataset("macaque_dataset", {self._data_id: lambda: np.array(images)}, {})
        feed_dict = self._imagenet.feed_dict(dataset)
        feature_maps = self._session.run(self._fetch, feed_dict=feed_dict)
        return feature_maps

class KerasFeatureExtractor(FeatureExtractor):
    def __init__(self):
        pass