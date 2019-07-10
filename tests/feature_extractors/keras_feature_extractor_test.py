import numpy as np

from feature_extractors import KerasFeatureExtractor
from data import Dataset

NET_ID = "VGG19"

TEST_PREFIX = "./tests/data/flickr8k_sample_imgs"
TEST_SOURCES = "./tests/data/flickr8k_sample_imgs.txt"
TEST_NAME = "test_ds"

def test_keras_feature_extractor_constructor():
    ext = KerasFeatureExtractor(NET_ID)
    assert isinstance(ext, KerasFeatureExtractor) == True

def test_keras_feature_extractor_extract_features():
    ext = KerasFeatureExtractor(NET_ID)

    ds = Dataset(name=TEST_NAME,
                prefix=TEST_PREFIX,
                batch_size=8)
    ds.initialize(fp=TEST_SOURCES)

    result = ext.extract_features(dataset=ds)
    assert isinstance(result, list) == True
    assert isinstance(result[0], np.ndarray) == True
    assert len(result) == ds.count
