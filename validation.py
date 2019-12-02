import os

def validate_cfg(cfg,
    state,
    dataset=False, 
    prepro=False, 
    encoder=False, 
    model=False, 
    runner=False):
    """
    """
    
    if dataset:
        return validate_dataset_cfg(cfg, state)
    elif prepro:
        return validate_preprocessor_cfg(cfg, state)
    elif encoder:
        return validate_encoder_cfg(cfg, state)
    elif model:
        return validate_model_cfg(cfg, state)
    elif runner:
        return validate_runner_cfg(cfg, state)
    raise RuntimeError("")

def validate_dataset_cfg(cfg, state):
    """Validates a dataset initialization configuration.

    Args:
        cfg: A dictionary.
        datasets: A list of names of registered datasets.
    Returns:
        A dictionary. Keys correspond to `cfg` keys and values
        containg error messages.
    """

    datasets = map(lambda x: x.name, state.datasets)
    log = {}
    if cfg['name'] in datasets:
        log['name'] = "A dataset with this name already exists."
    
    if not os.path.isdir(cfg['prefix']):
        log['prefix'] = "The directory given by prefix does not exist."
    
    if cfg['sources'] != "" and not os.path.isfile(cfg['sources']):
        log['sources'] = "The file given by sources does not exist."
    
    if cfg['srcCaptions'] != "" and not os.path.isfile(cfg['scrCaptions']):
        log['srcCaptions'] = "The file given by srcCaptions does not exist."

    return log

def validate_preprocessor_cfg(cfg, state):
    
    prepros = map(lambda x: x.name, state.preprocessors)
    log = {}
    if cfg['name'] in prepros:
        log['name'] = "A preprocessor with this name already exists."
    
    return log

def validate_encoder_cfg(cfg, state):
    pass

def validate_model_cfg(cfg, state):
    pass

def validate_runner_cfg(cfg, state):

    runners = map(lambda x: x.name, state.runners)
    log = {}
    if cfg['name'] in runners:
        log['name'] = "A runner with this name already exists."