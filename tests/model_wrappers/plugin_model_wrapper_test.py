import os

from model_wrappers import PluginModelWrapper

TEST_PLUGIN_PATH_IC = "../tests/data/plugin_model_wrapper_image_captioning.py"
TEST_PLUGIN_PATH_MMT = "../tests/data/plugin_model_wrapper_multimodal_translation.py"


def test_plugin_model_wrapper_constructor_rel_path():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_IC, 
        runs_on_features=True, name="mock")
    assert isinstance(model, PluginModelWrapper) == True

def test_plugin_model_wrapper_constructor_abs_path():
    path = os.path.join(os.getcwd(), TEST_PLUGIN_PATH_IC)
    model = PluginModelWrapper(plugin_path=path,
        runs_on_features=True, name="mock")
    assert isinstance(model, PluginModelWrapper) == True

def test_plugin_model_wrapper_ic_run():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_IC,
        runs_on_features=True, name="mock")
    inputs = 1234
    results = model.run(1234)
    assert inputs == results

def test_plugin_model_wrapper_mmt_run():
    model = PluginModelWrapper(plugin_path=TEST_PLUGIN_PATH_MMT,
        runs_on_features=True, name="mock")
    inputs = (1234, 3456)
    results = model.run(1234, 3456)
    assert inputs == results