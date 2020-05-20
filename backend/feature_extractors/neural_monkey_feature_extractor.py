from collections import namedtuple
import os

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

# Mean pixel values from preprocessing of the VGG network
VGG_RGB_MEANS = [[[123.68, 116.779, 103.939]]]


class NeuralMonkeyFeatureExtractor(FeatureExtractor):
    """A class for interacting with pretrained NeuralMonkey encoders.
    
    Supported networks are:
        VGG16
        VGG19
        ResNet50V2
        ResNet101V2
        ResNet152V2
    """
    
    def __init__(self, 
                net, 
                slim_models,
                model_checkpoint,
                conv_map,
                name=None):
        """Create a Nerual Monkey feature extractor. 
        
        Args:
            net: A string identifier of the network type.
            slim_models: A path to the Tensorflow Slim repository.
            model_checkpoint: A path to the model checkpoint.
            conv_map: The string identifier of the convolutional
                map which should be extracted as features.
            name: A string name of the encoder.
        """

        import numpy as np
        import tensorflow as tf
        from neuralmonkey.dataset import Dataset
        from neuralmonkey.encoders.imagenet_encoder import ImageNet
        from neuralmonkey.readers.image_reader import single_image_for_imagenet

        super(NeuralMonkeyFeatureExtractor, self).__init__(name)

        if net not in MODELS:
            raise ValueError("Unsupported network %s." % net)
        
        if conv_map is None:
            raise ValueError(
                "You must provide the convolutional map.")

        net_spec = MODELS[net]
        if net_spec.net_id in ['vgg_16', 'vgg_19']:
            self._vgg_normalization = True
            self._zero_one_normalization = False
        elif net_spec.net_id is ['resnet_v2_50', 'resnet_v2_101', 'resnet_v2_152']:
            self._vgg_normalization = False
            self._zero_one_normalization = True

        self._data_id = "images"

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
        
    def extract_features(self, images):
        """Extracts features from the dataset.
        
        Args:
            images: A Numpy Array of images.
        Returns:
            A list of Numpy Arrays, the extracted feature maps.
        """

        width = self._net_spec.input_size[0]
        height = self._net_spec.input_size[1]
        assert images[1:].shape == (width, height, 3)

        def vgg_norm(img):
            return i - VGG_RGB_MEANS

        def zero_one_norm(img):
            return i / 255

        if self._vgg_normalization:
            images = [vgg_norm(i) for i in images]

        if self._zero_one_normalization:
            images = [zero_one_norm(i) for i in images]

        ds = Dataset("macaque_data",
                {self._data_id: lambda: np.array(images)},
                {})
        feed_dict = self._imagenet.feed_dict(ds)

        results = self._session.run(self._fetch, feed_dict=feed_dict)
        
        if isinstance(results, list):
            results = np.array(results)
        elif not isinstance(results, np.ndarray):
            raise RuntimeError("Features are neither a list nor a numpy array.")

        return results
