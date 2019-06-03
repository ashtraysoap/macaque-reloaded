import re
from configparser import ConfigParser
from neuralmonkey.config.parsing import parse_file

"""
Given a Neural Monkey configuration file try to draw as much inferences as possible.
Return a structure describing what remains ambiguous and requires futher specification
by the user. And what does not have to be specified and was inferred.

For examples which runners are present, what are the names of the corresponding data_series,
what is the input data_series ...
"""

def _parse_sections(s):
    return re.findall(r'<([^>]*)>', s)

def _parse_series(s):
    return re.findall(r'"([^"]*)"', s)

def _parse_sources(s):
    # TODO: more robust & more general support than strings and (string, reader) tuples
    if s[0] != '[' and s[-1] != ']':
        return
    s = s[1:][:-1].strip()
    srcs = []
    in_str = False
    in_par = False
    src = ""
    for c in s:
        if c == '(' and not in_str:
            in_par = True
        if in_par:
            src += c
        if c == ')' and in_par:
            in_par = False
            srcs.append(src)
            src = ""
        if c == '\"' and not in_str and not in_par:
            in_str = True
            src += c
        elif c == '\"' and in_str:
            in_str = False
            src += c
            srcs.append(src)
            src = ""
        elif in_str:
            src += c
    return srcs

def _substitute_vars(strings, var_dict):
    def parse_line(line):
        in_var = False
        in_str = False
        nl = ""
        v = ""
        for c in line:
            if c == '"' and not in_str:
                in_str = True
            if c == '"' and in_str:
                in_str = False
            
            if in_var:
                v += c
            else:
                nl += c
            
            if in_str and c == '{':
                in_var = True
            if in_str and in_var and c == '}':
                in_var = False
                v = var_dict[v] if v in var_dict else v
                nl += v
                v = ""
        line = nl
        in_var = False
        nl = ""
        v = ""
        for c in line:
            if c == '$':
                in_var = True
            elif c in [',', ' ', '\t', '\n'] and in_var:
                v = var_dict[v] if v in var_dict else v
                nl += v + c
                v = ""
                in_var = False
            elif in_var:
                v += c
            elif not in_var:
                nl += c
        return nl

    result = []
    for l in strings:
        l = parse_line(l)
        result.append(l)
    return result

def infere_data_correspondence(config_path):
    # Attempt to parse the information of interest from the config
    
    with open(config_path, 'r', encoding='utf-8') as cf:
        config = cf.readlines()

    raw_cfg, _ = parse_file(config)
    var_dict = raw_cfg['vars'] if raw_cfg['vars'] is not None else None

    if var_dict is not None:
        config = _substitute_vars(config, var_dict)
    cfg = ConfigParser()
    cfg.read_file(config)
    
    # remove dataset sections from the config
    secs = []
    for option in ['train_dataset', 'val_dataset', 'test_datasets']:
        if cfg.has_option('main', option):
            sec = cfg.get('main', option)
            secs.append(sec)
            cfg.remove_option('main', option)

    secs = [_parse_sections(s) for s in secs]
    secs = [i for sec in secs for i in sec]

    # parse dataset sections to extract <series, sources> correspondence 
    series = []
    sources = []
    se = None
    so = None
    for sec in secs:
        if cfg.has_option(sec, 'class') \
        and cfg.get(sec, 'class') == "dataset.load":
            se = cfg.get(sec, 'series') if cfg.has_option(sec, 'series') else None
            so = cfg.get(sec, 'data') if cfg.has_option(sec, 'data') else None
        if se is not None:
            se = _parse_series(se)
            series.extend(se)
        if so is not None:
            so = _parse_sources(so)
            sources.extend(so)
    data_cor = zip(series, sources)
    for e in data_cor:
        print(e)

    # add new dataset section (config.add_section)

if __name__ == "__main__":
    infere_data_correspondence('/home/sam/thesis-code/enc-dec-test.ini')