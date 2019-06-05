import json
import os
from warnings import warn

class DataInstance:
    def __init__(self, idx, source):
        self._idx = idx
        self._source = source

    @property
    def idx(self):
        return self._idx

    @property
    def source(self):
        return self._source

class Dataset:
    def __init__(self, name, prefix, batch_size):
        self._name = name
        self._prefix = prefix
        self._batch_size = batch_size
        self._elements = []
        self._count = 0

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

    @property
    def prefix(self):
        return self._prefix

    @property
    def elements(self):
        return self._elements

    def initialize(self, sources=None):
        if not sources:
            srcs = os.listdir(self.prefix) 
        else:
            srcs = [os.path.join(self.prefix, src) for src in sources]
        
        if len(srcs) == 0:
            warn("Directory {} is empty. Dataset does not contain any elements.".format(self.prefix))

        for i, src in enumerate(srcs):
            elem = DataInstance(i, os.path.join(self.prefix, src))
            self._elements.append(elem)

        self._count = len(self._elements)

    def to_json(self):
        pass

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
        return ""

class DataInstanceEncoder(json.JSONEncoder):
    def default(self, data_instance):
        return ""