from tests.data_test import make_initialized_test_dataset
from model_wrappers import NeuralMonkeyModelWrapper

TEST_PREFIX = "./tests/data/flickr8k_sample_feats"
TEST_SOURCES = "./tests/data/flickr8k_sample_feats.txt"

def create_neural_monkey_model_wrapper_enc_dec():
    return NeuralMonkeyModelWrapper(
        config_path="./tests/data/enc-dec-test.ini",
        vars_path="./tests/data/output/enc-dec-test/variables.data.final",
        image_series="images",
        feature_series="",
        src_caption_series="")

def create_neural_monkey_model_wrapper_dec_only():
    return NeuralMonkeyModelWrapper(
        config_path="./tests/data/dec-only.ini",
        vars_path="./tests/data/output/dec-only-test/variables.data.final",
        image_series="",
        feature_series="feature_maps",
        src_caption_series="")

def test_neural_monkey_model_wrapper_constructor_enc_dec():
    model = create_neural_monkey_model_wrapper_enc_dec()
    assert isinstance(model, NeuralMonkeyModelWrapper)

def test_neural_monkey_model_wrapper_constructor_dec_only():
    model = create_neural_monkey_model_wrapper_dec_only()
    assert isinstance(model, NeuralMonkeyModelWrapper)

def test_neural_monkey_model_wrapper_enc_dec_run():
    model = create_neural_monkey_model_wrapper_enc_dec()
    ds = make_initialized_test_dataset()
    results = model.run(ds)
    assert isinstance(results, list) == True
    assert len(results) == ds.count
    assert isinstance(results[-1], dict) == True

def test_neural_monkey_model_wrapper_dec_only_run():
    model = create_neural_monkey_model_wrapper_dec_only()
    ds = make_initialized_test_dataset()
    ds.attach_features_from_file_list(prefix=TEST_PREFIX, sources=TEST_SOURCES)
    results = model.run(ds)
    assert isinstance(results, list) == True
    assert len(results) == ds.count
    assert isinstance(results[-1], dict) == True
