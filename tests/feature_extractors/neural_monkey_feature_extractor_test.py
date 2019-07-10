import numpy as np

from feature_extractors import NeuralMonkeyFeatureExtractor
from data import Dataset

TEST_NET_ID = "VGG19"
TEST_SLIM_PATH = "tensorflow-models/research/slim/"
TEST_MODEL_CKPT = "/media/sam/Karenin/vgg_19.ckpt"
TEST_CONV_MAP = "vgg_19/conv5/conv5_3"
TEST_VECTOR = None
TEST_DATA_ID = "test"

def test_neural_monkey_feature_extractor_constructor():
    ext = NeuralMonkeyFeatureExtractor(
        net=TEST_NET_ID,
        slim_models=TEST_SLIM_PATH,
        model_checkpoint=TEST_MODEL_CKPT,
        conv_map=TEST_CONV_MAP,
        vector=TEST_VECTOR,
        data_id=TEST_DATA_ID)

    assert isinstance(ext, NeuralMonkeyFeatureExtractor) == True

def test_neural_monkey_feature_extractor_extract_features():
    assert True