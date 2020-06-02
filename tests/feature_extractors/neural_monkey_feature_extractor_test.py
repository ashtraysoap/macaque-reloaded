import numpy as np
import tensorflow as tf

from feature_extractors import NeuralMonkeyFeatureExtractor
from data import Dataset
from data_test import make_initialized_test_dataset
from preprocessing import Preprocessor

TEST_NET_ID = "VGG19"
#TEST_SLIM_PATH = "lib/tensorflow-models/research/slim/"
TEST_SLIM_PATH = "lib/slim/"
TEST_MODEL_CKPT = "/media/sam/Karenin/vgg_19.ckpt"
TEST_CONV_MAP = "vgg_19/conv5/conv5_3"

def create_neural_monkey_feature_extractor():
    return NeuralMonkeyFeatureExtractor(
        net=TEST_NET_ID,
        slim_models=TEST_SLIM_PATH,
        model_checkpoint=TEST_MODEL_CKPT,
        conv_map=TEST_CONV_MAP)

def test_neural_monkey_feature_extractor_constructor():
    with tf.Graph().as_default():
        ext = create_neural_monkey_feature_extractor()
        assert isinstance(ext, NeuralMonkeyFeatureExtractor) == True

def test_neural_monkey_feature_extractor_extract_features():
    with tf.Graph().as_default():
        ext = create_neural_monkey_feature_extractor()
        ds = make_initialized_test_dataset()
        ds.load_images()
        imgs = [e.image for e in ds.elements]
        prepro = Preprocessor()
        imgs = prepro.preprocess_images(imgs)

        results = ext.extract_features(images=imgs)
        assert isinstance(results, np.ndarray) == True
        assert results.shape[0] == ds.count