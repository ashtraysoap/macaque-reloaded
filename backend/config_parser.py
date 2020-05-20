import os
from configparser import ConfigParser

from data import create_dataset
from preprocessing import create_preprocessor
from feature_extractors import create_feature_extractor
from model_wrappers import create_model_wrapper
from runner import create_runner
from validation import validate_cfg


def find_configs(path="."):
    """Returns a list of configuration filenames
    found in a directory.

    Args:
        dir: The string path to the directory to search.
    Returns:
        A list of filenames with the .ini suffix found in `dir`.
    """

    if not os.path.isdir(path):
        raise RuntimeError("The provided path is not a directory.")

    fs = os.listdir(path)
    fs = [f for f in fs if len(f) > 4 and f[-4:] == ".ini"]
    return fs

def create_configs(configs):
    res = []
    for c in configs:
        config = ConfigParser()
        config.read(c)
        res.append(config)
    return res

def instantiate_configs(state):
    """Instantiate objects defined in the configsuration files.

    Args:
        state: A MacaqueState instance.
    """

    # If the directory does not exist, inform the user and return.
    if not os.path.isdir(state.config_dir):
        print(("Config directory {} does not exist. " \
            "No configs read.").format(state.config_dir))
        return
        
    cfgs = find_configs(state.config_dir)
    
    print("Found {0} configuration files in {1}:".format(len(cfgs), \
        state.config_dir))
    for cfg in cfgs:
        print("\t", cfg)
    print()

    cfg_fps = [os.path.join(state.config_dir, c) for c in cfgs]
    cfgs = create_configs(cfg_fps)

    for cfg, fp in zip(cfgs, cfg_fps):

        if 'dataset' in cfg:
            dataset_cfg = cfg['dataset']
            _create_from_config(state, dataset_cfg, fp, dataset=True)

        if 'prepro' in cfg:
            prepro_cfg = cfg['prepro']
            _create_from_config(state, prepro_cfg, fp, prepro=True)

        if 'encoder' in cfg:
            e_cfg = cfg['encoder']
            _create_from_config(state, e_cfg, fp, encoder=True)

        if 'model' in cfg:
            m_cfg = cfg['model']
            _create_from_config(state, m_cfg, fp, model=True)

        if 'runner' in cfg:
            r_cfg = cfg['runner']
            _create_from_config(state, r_cfg, fp, runner=True)
    return

def _create_from_config(state, cfg, fp, dataset=False, prepro=False, 
    encoder=False, model=False, runner=False):
    
    if dataset:
        create = create_dataset
        add = state.add_dataset
        contains = state.contains_dataset
        string = "dataset"
        String = "Dataset"
    
    if prepro:
        create = create_preprocessor
        add = state.add_preprocessor
        contains = state.contains_prepro
        string = "preprocessor"
        String = "Preprocessor"
    
    if encoder:
        create = lambda x: create_feature_extractor(x, from_response=False)
        add = state.add_feature_extractor
        contains = state.contains_feature_extractor
        string = "encoder"
        String = "Encoder"
    
    if model:
        create = lambda x: create_model_wrapper(x, from_response=False)
        add = state.add_model
        contains = state.contains_model
        string = "model"
        String = "Model"

    if runner:
        create = lambda x: create_runner(state, x)
        add = state.add_runner
        contains = state.contains_runner
        string = "runner"
        String = "Runner"

    error_log = validate_cfg(cfg, state, dataset, prepro, encoder,
        model, runner, from_response=False)

    if error_log == {}:
        inst = create(cfg)
        if inst is not None:
            add(inst)
            return
        print(("Unable to create {0}. An error in the " \
            "configuration occured. Skipping section in " \
            "{1}.").format(string, fp))
    else:
        for v in error_log.values():
            print(v)
        print(("Unable to create {0}. An error in the " \
            "configuration occured. Skipping section in " \
            "{1}.").format(string, fp))
    return