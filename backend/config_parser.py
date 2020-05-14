import os
from configparser import ConfigParser


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