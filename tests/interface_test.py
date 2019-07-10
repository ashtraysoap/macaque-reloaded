import json

from interface import create_model_interface, ModelInterface
from data import Dataset

TEST_CONFIG = "./tests/data/model.json"

TEST_PREFIX = "./tests/data/flickr8k_sample_imgs"
TEST_SOURCES = "./tests/data/flickr8k_sample_imgs.txt"
TEST_NAME = "test_ds"

def test_interface_create_model_interface():
    json_data = json.load(open(TEST_CONFIG))
    ifc = create_model_interface(json_data)
    assert isinstance(ifc, ModelInterface) == True

def test_interface_run_model_on_dataset():
    json_model = json.load(open(TEST_CONFIG))
    model = create_model_interface(json_model)

    ds = Dataset(name=TEST_NAME,
                prefix=TEST_PREFIX,
                batch_size=8)
    ds.initialize(fp=TEST_SOURCES)

    res = model.run_on_dataset(ds)
    assert res != None