import numpy as np

from data_test import make_initialized_test_dataset
from model_wrappers import NeuralMonkeyModelWrapper

TEST_PREFIX = "../tests/data/flickr8k_sample_feats"
TEST_SOURCES = "../tests/data/flickr8k_sample_feats.txt"

def create_neural_monkey_model_wrapper_enc_dec():
    return NeuralMonkeyModelWrapper(
        config_path="../models/plugin_resources/enc-dec-test/enc-dec-test.ini",
        vars_path="../models/plugin_resources/enc-dec-test/variables.data.final",
        runs_on_features=False,
        data_series="images")

def create_neural_monkey_model_wrapper_dec_only():
    return NeuralMonkeyModelWrapper(
        config_path="../tests/data/dec-only.ini",
        vars_path="../tests/data/output/dec-only-test/variables.data.final",
        runs_on_features=True,
        data_series="feature_maps",
        caption_series="greedy_caption")

def test_neural_monkey_model_wrapper_constructor_enc_dec():
    model = create_neural_monkey_model_wrapper_enc_dec()
    assert isinstance(model, NeuralMonkeyModelWrapper)

def test_neural_monkey_model_wrapper_constructor_dec_only():
    model = create_neural_monkey_model_wrapper_dec_only()
    assert isinstance(model, NeuralMonkeyModelWrapper)

def test_neural_monkey_model_wrapper_enc_dec_run():
    model = create_neural_monkey_model_wrapper_enc_dec()
    ds = make_initialized_test_dataset()
    ds.load_images()
    imgs = [e.image for e in ds.elements]
    from preprocessing import Preprocessor
    prepro = Preprocessor()
    imgs = prepro.preprocess_images(imgs)
    results = model.run(imgs)
    assert isinstance(results, list) == True
    assert len(results) == ds.count
    assert isinstance(results[-1], dict) == True

def test_neural_monkey_model_wrapper_dec_only_run():
    model = create_neural_monkey_model_wrapper_dec_only()
    ds = make_initialized_test_dataset()
    ds.attach_features_from_file_list(prefix=TEST_PREFIX, sources=TEST_SOURCES)
    features = [e.feature_map for e in ds.elements]
    results = model.run(np.asarray(features))
    assert isinstance(results, list) == True
    assert len(results) == ds.count
    assert isinstance(results[-1], dict) == True
