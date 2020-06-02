import os

import numpy as np

from feature_extractors import PluginFeatureExtractor
from data_test import make_initialized_test_dataset

TEST_PLUGIN_PATH = "../tests/data/plugin_feature_extractor.py"


def test_plugin_feature_extractor_construct_relative_path():
    ext = PluginFeatureExtractor(plugin_path=TEST_PLUGIN_PATH)
    assert isinstance(ext, PluginFeatureExtractor) == True

def test_plugin_feature_extractor_construct_absolute_path():
    path = os.getcwd()
    path = os.path.join(path, TEST_PLUGIN_PATH)
    ext = PluginFeatureExtractor(plugin_path=path)
    assert isinstance(ext, PluginFeatureExtractor) == True

def test_plugin_feature_extractor_run_on_dataset():
    ext = PluginFeatureExtractor(plugin_path=TEST_PLUGIN_PATH)
    data = np.zeros(1)
    results = ext.extract_features(data)
    assert results == data
