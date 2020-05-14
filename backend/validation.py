import os

import pdb

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

    # handle name
    if cfg['name'] in datasets:
        log['name'] = "A dataset with this name already exists."
    if cfg['name'] == "":
        log['name'] = "Dataset name has to be specified."
    
    # handle prefix
    if not os.path.isdir(cfg['prefix']):
        log['prefix'] = "The directory given by prefix does not exist."
    
    # handle sources
    if cfg['sources'] != "" and not os.path.isfile(cfg['sources']):
        log['sources'] = "The file given by sources does not exist."
    
    # handle source captions
    if cfg['srcCaps'] != "" and not os.path.isfile(cfg['srcCaps']):
        log['srcCaps'] = "The file given by srcCaptions does not exist."

    # handle reference captions
    for i in range(len(cfg['references'])):
        if cfg['references'][i] != "" and not os.path.isfile(cfg['references'][i]):
            if 'refs' not in log:
                log['refs'] = {}
            log['references'][str(i)] = "The file does not exist."
    
    # handle batch size
    if cfg['batchSize'].strip() == "":
        log['batchSize'] = "Batch size has to be specified."
    if cfg['batchSize'].isnumeric() == False:
        log['batchSize'] = "Batch size has to be a positive integer."

    return log

def validate_preprocessor_cfg(cfg, state):
    prepros = map(lambda x: x.name, state.preprocessors)
    log = {}

    if cfg['name'] in prepros:
        log['name'] = "A preprocessor with this name already exists."
    if cfg['name'] == "":
        log['name'] = "Preprocessor name has to be specified."
    
    return log

def validate_encoder_cfg(cfg, state):
    encoders = map(lambda x: x.name, state.feature_extractors)
    log = {}

    # handle name
    if cfg['name'] in encoders:
        log['name'] = "An encoder with this name already exists."
    if cfg['name'] == "":
        log['name'] = "Encoder name has to be specified."

    # Plugin encoder
    if cfg['type'] == 'plugin':
        if cfg['plugin']['path'] == "":
            log['plugin'] = {}
            log['plugin']['pluginPath'] = "The plugin source has to be specified."
        if cfg['plugin']['path'] != "" and not os.path.isfile(cfg['plugin']['path']):
            log['plugin'] = {}
            log['plugin']['pluginPath'] = "The file does not exist."

    # Keras encoder
    if cfg['type'] == 'keras':
        # handle checkpoint path
        if cfg['keras']['ckptPath'] != "" and not os.path.isfile(cfg['keras']['ckptPath']):
            log['keras'] = {}
            log['keras']['ckptPath'] = "The file does not exist."

    # TFSlim / NeuralMonkey encoder
    if cfg['type'] == 'tfSlim':
        # handle checkpoint path
        if cfg['tfSlim']['ckptPath'] == "":
            log['tfSlim'] = {}
            log['tfSlim']['ckptPath'] = "The checkpoint path has to be specified."
        if cfg['tfSlim']['ckptPath'] != "" and not os.path.isfile(cfg['tfSlim']['ckptPath']):
            log['tfSlim'] = {}
            log['tfSlim']['ckptPath'] = "The file does not exist."
    
    return log

def validate_model_cfg(cfg, state):
    models = map(lambda x: x.name, state.models)
    log = {}

    if cfg['name'] == "":
        log['name'] = "Model name has to be specified."

    # Plugin model
    if cfg['type'] == 'plugin':
        if cfg['plugin']['path'] == "":
            log['plugin'] = {}
            log['plugin']['pluginPath'] = "The path to the plugin source has to be specified."
        if cfg['plugin']['path'] != "" and not os.path.isfile(cfg['plugin']['path']):
            log['plugin'] = {}
            log['plugin']['pluginPath'] = "The file does not exist."

    # NeuralMonkey model
    if cfg['type'] == 'neuralmonkey':
        # handle configuration file
        if cfg['neuralmonkey']['configPath'] == "":
            log['neuralmonkey'] = {}
            log['neuralmonkey']['configPath'] = "The configuration file has to be specified."
        if cfg['neuralmonkey']['configPath'] != "" and not os.path.isfile(cfg['neuralmonkey']['configPath']):
            log['neuralmonkey'] = {}
            log['neuralmonkey']['configPath'] = "The file does not exist."
        # handle variables file
        if cfg['neuralmonkey']['varsPath'] == "":
            if 'neuralmonkey' not in log:
                log['neuralmonkey'] = {}
            log['neuralmonkey']['varsPath'] = "The configuration file has to be specified."
        if cfg['neuralmonkey']['varsPath'] != "" and not os.path.isfile(cfg['neuralmonkey']['varsPath']):
            if 'neuralmonkey' not in log:
                log['neuralmonkey'] = {}
            log['neuralmonkey']['varsPath'] = "The file does not exist."

    return log

def validate_runner_cfg(cfg, state):
    runners = map(lambda x: x.name, state.runners)
    log = {}

    if cfg['name'] in runners:
        log['name'] = "A runner with this name already exists."
    if cfg['name'] == "":
        log['name'] = "Runner name has to be specified."

    return log