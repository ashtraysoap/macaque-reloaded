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

SUPPORTED_READERS = ["numpy_reader", "imagenet_reader", "image_reader.image_reader"]
HINTS_TARGET = ["target", "reference", "ref"]
HINTS_SOURCE = ["source", "src"]

def config_infer(config_path):
    """Needs documentation.
    """
    with open(config_path, 'r', encoding='utf-8') as cf:
        cfg_lines = cf.readlines()

    cfg_lines = _substitute_vars(cfg_lines)

    cfg = ConfigParser()
    cfg.read_file(cfg_lines)

    secs = _get_dataset_sections(cfg)

    series, sources = [], []
    for sec in secs:
        if _has_value(cfg, sec, opt='class', val='dataset.load'):
            series = _append(series, _get_value(cfg, sec, opt='series'))
            sources = _append(sources, _get_value(cfg, sec, opt='data'))

    series = [_parse_series(s) for s in series]
    series = _flatten(series)

    sources = [_parse_sources(s) for s in sources]
    sources = _flatten(sources)

    # to list for re-iterability
    data_map = list(zip(series, sources))

    img, src_cap, ref = _infere_from_map(data_map, cfg)
    return { 'images': img, 'source_captions': src_cap, "references": ref }

def create_fake_config(prefix,
                        files,
                        series,
                        dataset_name="macaque_dataset",
                        reader=None,
                        configparser=None):
    config = []
    config.append("[main]")
    config.append("test_datasets=[<{}>]".format(dataset_name))
    config.append("")
    config.append("[{}]".format(dataset_name))
    config.append("class=dataset.load")
    config.append("series=[\"{}\"]".format(series))
    config.append("data=[(\"{}\", <{}>)]".format(files, reader))

    if reader is None:
        config = [c + '\n' for c in config] 
        return config
    
    config.append("")
    config.append("[{}]".format(reader))
    for opt in configparser.options(reader):
        if opt == "prefix":
            config.append("prefix=\"{}\"".format(prefix))
        else:
            config.append("{}={}".format(opt, configparser.get(reader, opt)))
    config = [c + '\n' for c in config]
    return config

def _infere_from_map(data_map, cfg_parser):
    """Needs docs.
    """
    def match_string(y):
        patt = re.compile(r'"[^"]*"')
        m = patt.match(y)
        if m is not None and m.group(0) == y:
            return True
        return False

    def match_hint(x, hints):
        for h in hints:
            if x.startswith(h):
                return True
        return False

    def match_section(y):
        patt = re.compile(r'\s*\(\s*"[^"]+"\s*,\s*<([^>]*)>\s*\)\s*')
        m = patt.match(y)
        if m is not None:
            return m.group(1)
        return None

    # filter only string sources
    hyp = list(filter(lambda x: match_string(x[1]), data_map))
    # attempt to match series names from HINTS_*
    ref = list(filter(lambda x: match_hint(x[0], HINTS_TARGET), hyp))
    src = list(filter(lambda x: match_hint(x[0], HINTS_SOURCE), hyp))

    ref = [r[0] for r in ref]
    src = [s[0] for s in src]

    # filter (str, sec) couples
    hyp = map(lambda x: (x[0], match_section(x[1])), data_map)
    hyp = filter(lambda x: x[1] is not None, hyp)
    # attempt to match readers from SUPPORTED_READERS
    img = []
    for series, section in hyp:
        val = _get_value(cfg_parser, section, opt='class')
        if val:
            for reader in SUPPORTED_READERS:
                if reader in val:
                    img.append((series, reader, section))

    img = set(img)
    ref = set(ref)
    src = set(src)

    img = list(img)[0] if bool(img) else None
    ref = list(ref)[0] if bool(ref) else None
    src = list(src)[0] if bool(src) else None

    if img:
        img = { 'series': img[0], 'reader': img[1], 'section': img[2] }

    return (img, src, ref)

def _flatten(lol):
    """Flattens a list of lists.
    """
    return [i for lis in lol for i in lis]

def _append(ss, s):
    if s is not None:
        ss.append(s)
    return ss

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

def _sub_vars(strings, var_dict):
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

def _get_dataset_sections(config):
    secs = []
    for option in ['train_dataset', 'val_dataset', 'test_datasets']:
        if config.has_option('main', option):
            sec = config.get('main', option)
            secs.append(sec)
    secs = [_parse_sections(s) for s in secs]
    secs = _flatten(secs)
    return secs

def _substitute_vars(config):
    raw_cfg, _ = parse_file(config)
    var_dict = raw_cfg['vars'] if raw_cfg['vars'] is not None else None

    if var_dict is not None:
        config = _sub_vars(config, var_dict)
    return config

def _get_value(cfg_parser, sec, opt):
    """Returns `None` if the section doesn't contain the given option. 
    """
    return cfg_parser.get(sec, opt) if cfg_parser.has_option(sec, opt) else None

def _has_value(cfg_parser, sec, opt, val):
    if cfg_parser.has_option(sec, opt) \
    and cfg_parser.get(sec, opt) == val:
        return True
    else:
        return False

if __name__ == "__main__":
    print(config_infer('/home/sam/thesis-code/macaque/tests/enc-dec-test.ini'))
    print(config_infer('/home/sam/thesis-code/macaque/tests/no-infer.ini'))