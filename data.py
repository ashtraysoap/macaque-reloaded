import json
import os
from warnings import warn

import numpy as np

class DataInstance:
    def __init__(self, idx, source):
        self._idx = idx
        self._source = source
        self._caption = None
        self._references = []
        self._source_caption = None
        self._alignments = None
        self._beam_search_output = None

        self._prepro_img = None
        self._feature_map = None

    @property
    def idx(self):
        return self._idx

    @property
    def source(self):
        return self._source

    @property
    def prepro_img(self):
        return self._prepro_img

    @prepro_img.setter
    def prepro_img(self, val):
        self._prepro_img = val

    @property
    def feature_map(self):
        return self._feature_map

    @feature_map.setter
    def feature_map(self, val):
        self._feature_map = val

class Dataset:
    def __init__(self, name, prefix, batch_size):
        self._name = name
        self._prefix = prefix
        self._batch_size = batch_size
        self._elements = []
        self._count = 0
        self._feature_maps = False
        self._preprocessed_imgs = False

        if not os.path.isdir(prefix):
            raise ValueError("Directory {} does not exist.".format(prefix))
        
    def __iter__(self):
        counter = 0
        while counter < self._count:
            upper_bound = min(self._count, counter + self._batch_size)
            ds = self._create_offspring()
            ds._set_elements(self._elements[counter : upper_bound])
            yield ds
            counter = upper_bound

    @property
    def name(self):
        return self._name
    
    @property
    def count(self):
        return self._count

    @property
    def batch_size(self):
        return self._batch_size

    @batch_size.setter
    def batch_size(self, val):
        self._batch_size = val

    @property
    def prefix(self):
        return self._prefix

    @property
    def elements(self):
        return self._elements

    @property
    def feature_maps(self):
        return self._feature_maps

    @property
    def preprocessed_imgs(self):
        return self._preprocessed_imgs

    def initialize(self, sources=None, fp=None):
        if not sources and not fp:
            sources = os.listdir(self.prefix) 
        
        if fp is not None:
            with open(fp, 'r') as f:
                sources = [src.rstrip() for src in f.readlines()]

        if len(sources) == 0:
            warn("Directory {} is empty. Dataset does not contain any elements.".format(self.prefix))

        for i, src in enumerate(sources):
            elem = DataInstance(i, os.path.join(self.prefix, src))
            self._elements.append(elem)

        self._count = len(self._elements)

    def to_json(self):
        return json.dumps(self, cls=DatasetEncoder)
        
    def attach_prepro_images(self, images):
        """
        Args:
            images: ??????????
        """
        # TODO: check validity of args

        for elem, img in zip(self.elements, images):
            elem.prepro_img = img
        self._preprocessed_imgs = True

    def attach_features(self, features):
        """
        Args:
            features: A numpy array of feature maps.
        """
        for elem, fm in zip(self.elements, features):
            elem.feature_map = fm
        self._feature_maps = True

    def attach_features_from_file_list(self, prefix="", sources=None):
        """
            Requires documentation.
        """
        if not sources:
            srcs = os.listdir(prefix)
        else:
            if not os.path.isfile(sources):
                raise ValueError("File {} does not exits.".format(sources))
            srcs = [l.rstrip() for l in open(sources, 'r').readlines()]
        
        srcs = [os.path.join(prefix, src) for src in srcs]

        if not len(srcs) == self.count:
            raise ValueError("Number of elements and feature maps does not match.")

        def load_feature_map(fp):
            if fp[-4:] == '.npy':
                x = np.load(fp)
            elif fp[-4:] == '.npz':
                x = np.load(fp)
                x = x[x.files[0]]
            else:
                raise ValueError("Unsupported file format for features in {}".format(fp))
            return x

        fmaps = map(load_feature_map, srcs)

        for elem, fm in zip(self.elements, fmaps):
            elem.feature_map = fm
        self._feature_maps = True

    def _create_offspring(self):
        return Dataset(name=self.name,
                    prefix=self.prefix,
                    batch_size=self.batch_size)

    def _set_elements(self, elements):
        self._elements = elements
        self._count = len(elements)

def merge_datasets(d1, d2):
    raise NotImplementedError()

def dataset_from_json(json_str):
    raise NotImplementedError()

class DatasetEncoder(json.JSONEncoder):
    def default(self, dataset):
        instance_encoder = DataInstanceEncoder()
        return {
            "name": dataset.name,
            "prefix": dataset.prefix,
            "batch_size": dataset.batch_size,
            "count": dataset.count,
            "elements": [instance_encoder.default(e) for e in dataset.elements]
        }

class DataInstanceEncoder(json.JSONEncoder):
    def default(self, inst):
        return {
            "id": inst.idx,
            "source": inst.source,
            "caption": inst._caption,
            "source_caption": inst._source_caption,
            "references": inst._references,
            "alignments": inst._alignments,
            "beam_search_output": inst._beam_search_output
        }