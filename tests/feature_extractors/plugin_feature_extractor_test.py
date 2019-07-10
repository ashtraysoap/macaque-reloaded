import os

from feature_extractors import PluginFeatureExtractor
from tests.data_test import make_initialized_test_dataset

TEST_PLUGIN_PATH_DATASETS = "tests/data/plugin_feature_extractor_on_dataset.py"
TEST_PLUGIN_PATH_DATASETS_2 = "./tests/data/plugin_feature_extractor_on_dataset.py"
TEST_PLUGIN_PATH_IMAGES = "tests/data/plugin_feature_extractor_on_images.py"
TEST_PLUGIN_PATH_PATHS = "tests/data/plugin_feature_extractor_on_paths.py"

def test_plugin_feature_extractor_construct_relative_path():
    ext = PluginFeatureExtractor(plugin_path=TEST_PLUGIN_PATH_DATASETS)
    assert isinstance(ext, PluginFeatureExtractor) == True

def test_plugin_feature_extractor_construct_relative_path_2():
    ext = PluginFeatureExtractor(plugin_path=TEST_PLUGIN_PATH_DATASETS_2)
    assert isinstance(ext, PluginFeatureExtractor) == True

def test_plugin_feature_extractor_construct_absolute_path():
    path = os.getcwd()
    path = os.path.join(path, TEST_PLUGIN_PATH_DATASETS)
    ext = PluginFeatureExtractor(plugin_path=path)
    assert isinstance(ext, PluginFeatureExtractor) == True

def test_plugin_feature_extractor_run_on_dataset():
    path = os.getcwd()
    path = os.path.join(path, TEST_PLUGIN_PATH_DATASETS)
    ext = PluginFeatureExtractor(plugin_path=path)
    ds = make_initialized_test_dataset()

    results = ext.extract_features(dataset=ds)
    assert results is not None

def test_plugin_feature_extractor_run_on_images():
    # TODO: dataset lacks required functionality
    path = os.getcwd()
    path = os.path.join(path, TEST_PLUGIN_PATH_IMAGES)
    ext = PluginFeatureExtractor(plugin_path=path)
    ds = make_initialized_test_dataset()

    results = ext.extract_features(dataset=ds)
    assert results is not None

def test_plugin_feature_extractor_run_on_paths():
    path = os.getcwd()
    path = os.path.join(path, TEST_PLUGIN_PATH_PATHS)
    ext = PluginFeatureExtractor(plugin_path=path)
    ds = make_initialized_test_dataset()

    results = ext.extract_features(dataset=ds)
    assert results is not None