import json

from interface import create_model_interface, ModelInterface
from data import Dataset
from tests.data_test import make_initialized_test_dataset

TEST_CONFIG = "./tests/data/model.json"
MOCK_PLUGIN_MODEL = "./tests/data/mock_plugin_model.json"

TEST_PREFIX = "./tests/data/flickr8k_sample_imgs"
TEST_SOURCES = "./tests/data/flickr8k_sample_imgs.txt"
TEST_NAME = "test_ds"

def test_interface_create_model_interface():
    json_data = json.load(open(TEST_CONFIG))
    ifc = create_model_interface(json_data)
    assert isinstance(ifc, ModelInterface) == True

def test_interface_run_on_dataset():
    json_model = json.load(open(TEST_CONFIG))
    model = create_model_interface(json_model)
    ds = make_initialized_test_dataset()
    res = model.run_on_dataset(ds)
    assert res != None

def test_interface_run_on_dataset_mock_plugin_model():
    json_model = json.load(open(MOCK_PLUGIN_MODEL))
    model = create_model_interface(json_model)
    ds = make_initialized_test_dataset()
    res = model.run_on_dataset(ds)
    assert res != None
