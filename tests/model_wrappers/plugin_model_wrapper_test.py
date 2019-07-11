import os

from tests.data_test import make_initialized_test_dataset
from model_wrappers import PluginModelWrapper

TEST_PLUGIN_PATH_DATASET = "tests/data/plugin_model_wrapper_on_dataset.py"
TEST_PLUGIN_PATH_FEATURES = "tests/data/plugin_model_wrapper_on_features.py"
TEST_PLUGIN_PATH_IMAGES = "tests/data/plugin_model_wrapper_on_images.py"
TEST_PLUGIN_PATH_PATHS = "tests/data/plugin_model_wrapper_on_paths.py"

TEST_PREFIX = "./tests/data/flickr8k_sample_feats"
TEST_SOURCES = "./tests/data/flickr8k_sample_feats.txt"

def test_plugin_model_wrapper_constructor_rel_path():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_DATASET)
    assert isinstance(model, PluginModelWrapper) == True

def test_plugin_model_wrapper_constructor_rel_path_2():
    path = './' + TEST_PLUGIN_PATH_DATASET
    model = PluginModelWrapper(plugin_path=path)
    assert isinstance(model, PluginModelWrapper) == True

def test_plugin_model_wrapper_constructor_abs_path():
    path = os.path.join(os.getcwd(), TEST_PLUGIN_PATH_DATASET)
    model = PluginModelWrapper(plugin_path=path)
    assert isinstance(model, PluginModelWrapper) == True

def test_plugin_model_wrapper_run_on_dataset():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_DATASET)
    ds = make_initialized_test_dataset()
    results = model.run(dataset=ds)
    assert results is not None

def test_plugin_model_wrapper_run_on_features():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_FEATURES)
    ds = make_initialized_test_dataset()
    ds.attach_features_from_file_list(prefix=TEST_PREFIX, sources=TEST_SOURCES)
    results = model.run(dataset=ds)
    assert results is not None

def test_plugin_model_wrapper_run_on_images():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_IMAGES)
    ds = make_initialized_test_dataset()
    results = model.run(dataset=ds)
    assert results is not None

def test_plugin_model_wrapper_run_on_paths():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_PATHS)
    ds = make_initialized_test_dataset()
    results = model.run(dataset=ds)
    assert results is not None