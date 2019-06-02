from configparser import ConfigParser

"""
Given a Neural Monkey configuration file try to draw as much inferences as possible.
Return a structure describing what remains ambiguous and requires futher specification
by the user. And what does not have to be specified and was inferred.

For examples which runners are present, what are the names of the corresponding data_series,
what is the input data_series ...
"""

def infere_data_correspondence(config_path):
    config = open(config_path).readlines()

    # determine whether we are dealing with enc-dec model or dec-only
    # infere the correspondence of (images, data serie, reader)
    # (references, data serie) (features, data serie, reader)

    # return a composite structure with information such as
    # is decoder-only ?
    # what are the correspondences ?

    # attempt to parse the information of interest from the config
    ds = []
    config = ConfigParser(config_path)
    for sec in config.sections():
        if config.options(sec).__contains__('class') \
        and config.get(sec, 'class') == "dataset.load":
            series = config.get(sec, 'series')
            data_sources = config.get(sec, 'data')
            ds.append(zip(series, data_sources))

    flag = False
    for line in config:
        # test whether inside of a dataset section
        if line == "class=dataset.load":
            flag = True
        
        if flag and line.startswith("series="):
            # parse the list that follows
            pass
        
        if flag and line.startswith("data="):
            # parse the list that follows
            pass

        if flag and line[0] == ('['):
            flag = False