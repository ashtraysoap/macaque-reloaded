import json

from interface import create_model_interface, ModelInterface

JSON_CONFIG = "./tests/data/model.json"

def test_create_model_interface():
    json_data = json.load(open(JSON_CONFIG))
    ifc = create_model_interface(json_data)
    assert isinstance(ifc, ModelInterface) == True