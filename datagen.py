import os

class DataGenerator():
    def __init__(self, prefix, paths, batch_size=None):
        self._paths = [os.path.join(prefix, i.rstrip()) for i in open(paths)]
        self._n_elements = len(self._paths)
        if batch_size is None:
            batch_size = self._n_elements
        else:
            self._batch_size = batch_size
        self._counter = 0

    def next_batch(self):
        raise NotImplementedError()

class ImageGenerator(DataGenerator):
    def __init__(self, prefix, img_paths, batch_size=None):
        super(ImageGenerator, self).__init__(prefix, img_paths, batch_size)

    def next_batch(self):
        pass
        
class PathGenerator(DataGenerator):
    def __init__(self, prefix, img_paths, batch_size=None):
        super(PathGenerator, self).__init__(prefix, img_paths, batch_size)

    def next_batch(self):
        if self._counter >= self._n_elements:
            raise StopIteration("The end of the dataset has been reached. Call `restart()`"
                " to reset the batch pointer.")

        upper_bound = min(self._counter + self._batch_size, self._n_elements)
        img_paths = self._paths[self._counter : upper_bound]
        self._counter = upper_bound
        return img_paths