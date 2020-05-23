import os


def validate_cfg(cfg,
    state,
    dataset=False, 
    prepro=False, 
    encoder=False, 
    model=False, 
    runner=False,
    from_response=True):
    """
    """

    if dataset:
        return validate_dataset_cfg(cfg, state)
    elif prepro:
        return validate_preprocessor_cfg(cfg, state)
    elif encoder:
        return validate_encoder_cfg(cfg, state, from_response=from_response)
    elif model:
        return validate_model_cfg(cfg, state, from_response=from_response)
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
    mandatory_fields = ['name', 'prefix', 'batchSize']

    # for f in mandatory_fields:
    #     if f not in cfg:
    #         log[f] = "The {0} field is mandatory in the dataset configuration.".format(f)
    check_mandatory_fields(cfg, mandatory_fields, log, "dataset")

    # handle name
    if cfg['name'] in datasets:
        log['name'] = "A dataset with this name already exists."
    if cfg['name'] == "":
        log['name'] = "Dataset name has to be specified."
    
    # handle prefix
    if 'prefix' in cfg and not os.path.isdir(cfg['prefix']):
        log['prefix'] = "The directory given by prefix does not exist."
    
    # handle sources
    if 'source' in cfg:
        if cfg['sources'] != "" and not os.path.isfile(cfg['sources']):
            log['sources'] = "The file given by sources does not exist."
    
    # handle source captions
    if 'srcCaps' in cfg:
        if cfg['srcCaps'] != "" and not os.path.isfile(cfg['srcCaps']):
            log['srcCaps'] = "The file given by srcCaptions does not exist."

    # handle reference captions
    if 'references' in cfg:
        for i in range(len(cfg['references'])):
            if cfg['references'][i] != "" and not os.path.isfile(cfg['references'][i]):
                if 'refs' not in log:
                    log['refs'] = {}
                log['references'][str(i)] = "The file does not exist."
    
    # handle batch size
    if 'batchSize' in cfg:
        if cfg['batchSize'].strip() == "":
            log['batchSize'] = "Batch size has to be specified."
        if cfg['batchSize'].isnumeric() == False:
            log['batchSize'] = "Batch size has to be a positive integer."

    return log

def validate_preprocessor_cfg(cfg, state):
    prepros = map(lambda x: x.name, state.preprocessors)
    log = {}
    mandatory_fields = ['name', 'targetWidth', 'targetHeight', 'mode']

    # for f in mandatory_fields:
    #     if f not in cfg:
    #         log[f] = "The {0} field is mandatory in the preprocessor configuration".format(f)
    check_mandatory_fields(cfg, mandatory_fields, log, "preprocessor")

    if 'name' in cfg:
        if cfg['name'] in prepros:
            log['name'] = "A preprocessor with this name already exists."
        if cfg['name'] == "":
            log['name'] = "Preprocessor name has to be specified."
    
    return log

def validate_encoder_cfg(cfg, state, from_response=True):
    encoders = map(lambda x: x.name, state.feature_extractors)
    log = {}
    mandatory_fields = ['name', 'type']

    check_mandatory_fields(cfg, mandatory_fields, log, "encoder")

    # handle name
    if 'name' in cfg:
        if cfg['name'] in encoders:
            log['name'] = "An encoder with this name already exists."
        if cfg['name'] == "":
            log['name'] = "Encoder name has to be specified."

    if 'type' in cfg:
        # Plugin encoder
        if cfg['type'] == 'plugin':
            plugin_cfg = cfg if not from_response else cfg['plugin']
            if 'path' not in plugin_cfg:
                log['plugin']['pluginPath'] = "The plugin path field is mandatory."
            else:
                if plugin_cfg['path'] == "":
                    log['plugin'] = {}
                    log['plugin']['pluginPath'] = "The plugin source has to be specified."
                if plugin_cfg['path'] != "" and not os.path.isfile(plugin_cfg['path']):
                    log['plugin'] = {}
                    log['plugin']['pluginPath'] = "The file does not exist."

        # Keras encoder
        if cfg['type'] == 'keras':
            keras_cfg = cfg if not from_response else cfg['keras']
            
            mand_flds = ['network', 'layer']
            keras_log = {}
            check_mandatory_fields(keras_cfg, mand_flds, keras_log, "encoder")
            if keras_log != {}:
                log['keras'] = keras_log
            
            # handle checkpoint path
            if 'checkpoint' in keras_cfg:
                if keras_cfg['checkpoint'] != "" and not os.path.isfile(keras_cfg['checkpoint']):
                    if 'keras' not in log:
                        log['keras'] = {}
                    log['keras']['checkpoint'] = "The file does not exist."

        # TFSlim / NeuralMonkey encoder
        if cfg['type'] == 'tfSlim':
            slim_cfg = cfg if not from_response else cfg['tfSlim']

            mand_flds = ['network', 'layer', 'checkpoint']
            slim_log = {}
            check_mandatory_fields(slim_cfg, mand_flds, slim_log, "encoder")
            if slim_log != {}:
                log['tfSlim'] = slim_log
        
            # handle checkpoint path
            if 'checkpoint' in slim_cfg:           
                if slim_cfg['checkpoint'] == "":
                    if 'tfSlim' not in log:
                        log['tfSlim'] = {}
                    log['tfSlim']['checkpoint'] = "The checkpoint path has to be specified."
                if slim_cfg['checkpoint'] != "" and not os.path.isfile(slim_cfg['checkpoint']):
                    if 'tfSlim' not in log:
                        log['tfSlim'] = {}
                    log['tfSlim']['checkpoint'] = "The file does not exist."
    
    return log

def validate_model_cfg(cfg, state, from_response=True):
    models = map(lambda x: x.name, state.models)
    log = {}
    mandatory_fields = ['name', 'type', 'runsOnFeatures']

    # for f in mandatory_fields:
    #     if f not in cfg:
    #         log[f] = "The {0} field is mandatory in the model configuration".format(f)
    check_mandatory_fields(cfg, mandatory_fields, log, "model")

    if 'name' in cfg:
        if cfg['name'] == "":
            log['name'] = "Model name has to be specified."
        if cfg['name'] in models:
            log['name'] = "A model with this name already exists."

    if 'type' in cfg:
        # Plugin model
        if cfg['type'] == 'plugin':
            plugin_cfg = cfg if not from_response else cfg['plugin']
            if 'path' not in plugin_cfg:
                log['plugin']['pluginPath'] = "The plugin path field is mandatory."
            else:
                if plugin_cfg['path'] == "":
                    log['plugin'] = {}
                    log['plugin']['pluginPath'] = "The path to the plugin source has to be specified."
                if plugin_cfg['path'] != "" and not os.path.isfile(plugin_cfg['path']):
                    log['plugin'] = {}
                    log['plugin']['pluginPath'] = "The file does not exist."

        # NeuralMonkey model
        if cfg['type'] == 'neuralmonkey':
            nm_cfg = cfg if not from_response else cfg['neuralmonkey']
            mand_flds = ['configPath', 'varsPath', 'dataSeries', 'greedySeries']
            nm_log = {}
            check_mandatory_fields(nm_cfg, mand_flds, nm_log, "model")
            if nm_log != {}:
                log['neuralmonkey'] = nm_log

            # handle configuration file
            if 'configPath' in nm_cfg:
                if nm_cfg['configPath'] == "":
                    if 'neuralmonkey' not in log:
                        log['neuralmonkey'] = {}
                    log['neuralmonkey']['configPath'] = "The configuration file has to be specified."
                if nm_cfg['configPath'] != "" and not os.path.isfile(nm_cfg['configPath']):
                    if 'neuralmonkey' not in log:
                        log['neuralmonkey'] = {}
                    log['neuralmonkey']['configPath'] = "The file does not exist."
            # handle variables file
            if 'varsPath' in nm_cfg:
                if nm_cfg['varsPath'] == "":
                    if 'neuralmonkey' not in log:
                        log['neuralmonkey'] = {}
                    log['neuralmonkey']['varsPath'] = "The configuration file has to be specified."
                if nm_cfg['varsPath'] != "" and not os.path.isfile(nm_cfg['varsPath'] + ".index"):
                    if 'neuralmonkey' not in log:
                        log['neuralmonkey'] = {}
                    log['neuralmonkey']['varsPath'] = "The file does not exist."

    return log

def validate_runner_cfg(cfg, state):
    runners = map(lambda x: x.name, state.runners)
    log = {}
    mandatory_fields = ['name', 'model']
    
    # for f in mandatory_fields:
    #     if f not in cfg:
    #         log[f] = "The {0} field is mandatory in the runner configuration".format(f)
    check_mandatory_fields(cfg, mandatory_fields, log, "runner")

    if 'name' in cfg:
        if cfg['name'] in runners:
            log['name'] = "A runner with this name already exists."
        if cfg['name'] == "":
            log['name'] = "Runner name has to be specified."

    return log

def check_mandatory_fields(cfg, fields, log, string=""):
    for f in fields:
        if f not in cfg:
            log[f] = "The {0} field is mandatory in the {1} configuration.".format(f, string)