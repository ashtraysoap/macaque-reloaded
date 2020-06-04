import numpy as np

from feature_extractors import KerasFeatureExtractor
from data import Dataset
from preprocessing import Preprocessor

TEST_NET_ID = "VGG19"

TEST_PREFIX = "../tests/data/flickr8k_sample_imgs"
TEST_SOURCES = "../tests/data/flickr8k_sample_imgs.txt"
TEST_NAME = "test_ds"
TEST_CKPT_PATH = "../models/plugin_resources/vgg19_weights_tf_dim_ordering_tf_kernels_notop.h5"


def test_keras_feature_extractor_constructor():
    ext = KerasFeatureExtractor(TEST_NET_ID,
        ckpt_path=TEST_CKPT_PATH)
    assert isinstance(ext, KerasFeatureExtractor) == True

def test_keras_feature_extractor_extract_features():
    ext = KerasFeatureExtractor(TEST_NET_ID,
        ckpt_path=TEST_CKPT_PATH)

    ds = Dataset(name=TEST_NAME,
                prefix=TEST_PREFIX,
                batch_size=8)
    ds.initialize(fp=TEST_SOURCES)
    ds.load_images()
    imgs = [e.image for e in ds.elements]
    
    prepro = Preprocessor()

    imgs = prepro.preprocess_images(imgs)

    result = ext.extract_features(images=imgs)
    assert isinstance(result, np.ndarray) == True
    assert len(result) == ds.count
