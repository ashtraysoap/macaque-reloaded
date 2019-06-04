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
    def __init__(self, name, prefix, batch_size, sources):
        self._name = name
        self._prefix = prefix
        self._batch_size = batch_size
        self._elements = []

        if not os.path.isdir(prefix):
            raise ValueError("Directory {} does not exist.".format(prefix))
        
        srcs = os.listdir(prefix)
        
        if len(srcs) == 0:
            warn("Directory {} is empty. Dataset does not contain any elements.".format(prefix))

        for i, src in enumerate(srcs):
            elem = DataInstance(i, src)
            self._elements.append(elem)

        self._count = len(self._elements)

    def __iter__(self):
        counter = 0
        while counter < self._count:
            upper_bound = min(self._count, counter + self._batch_size)
            yield self._elements[counter : upper_bound]
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

    def to_json(self):
        pass

    # def from_json(self):

def merge_datasets(d1, d2):
    raise NotImplementedError()