from tests.data_test import make_initialized_test_dataset
from model_wrappers import NeuralMonkeyModelWrapper

def create_neural_monkey_model_wrapper():
    return NeuralMonkeyModelWrapper(
        config_path="./tests/data/enc-dec-test.ini",
        vars_path="./tests/data/enc-dec-test/variables.data.final",
        image_series="images",
        feature_series="",
        src_caption_series="")

def test_neural_monkey_model_wrapper_constructor():
    model = create_neural_monkey_model_wrapper()
    assert isinstance(model, NeuralMonkeyModelWrapper)

def test_neural_monkey_model_wrapper_run():
    model = create_neural_monkey_model_wrapper()
    ds = make_initialized_test_dataset()
    results = model.run(ds)
    assert results is not None
