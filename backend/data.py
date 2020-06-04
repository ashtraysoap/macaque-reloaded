import json
import os
import re
from warnings import warn

from PIL import Image
import numpy as np

def create_dataset(json_config):
    """Creates a Dataset instance from the configuration.

    Args:
        json_config: A dictionary with keys `name`, `prefix`, `batchSize` and
            optionally `sources` and `references`.
    Returns:
        A initialized Dataset instance built based on the configuration.
    """

    ds = Dataset(name=json_config['name'],
                prefix=json_config['prefix'],
                batch_size=int(json_config['batchSize']))
    
    if json_config['sources'] != "":
        srcs = open(json_config['sources'], 'r', encoding='utf-8').readlines()
        ds.initialize(sources=srcs)
    else:
        ds.initialize()

    for refs_fp in json_config['references']:
        ds.attach_references(refs_fp)

    if json_config['srcCaps']:
        ds.attach_src_captions(json_config['srcCaps'])

    return ds


class DataInstance:
    """Class representing a Dataset element.

    A DataInstance stores information about an element of the
    dataset. Upon loading, it may store the image data, or the feature
    map, depending on the modality of the element.

    Attributes:
        idx: An integer index of the element in the dataset.
        source: A string file path locating the element resource.
        references: A list of reference captions for the element, may be empty.
        source_caption: The source caption of the element, may be None.
        image: A PIL Image, may be None.
        prepro_img: A PIL Image, may be None.
        feature_map: A Numpy array, may be None.
    """

    def __init__(self, idx, source):
        """Creates a DataInstance instance.
        
        Args:
            idx: An integer representing the index of the element in
                the dataset.
            source: A string file path locating the instance resource.
        """
        
        self._idx = idx
        self._source = source
        self._references = []
        self._source_caption = None

        self._image = None
        self._prepro_img = None
        self._feature_map = None

    @property
    def idx(self):
        return self._idx

    @property
    def source(self):
        return self._source

    @property
    def image(self):
        return self._image

    @property
    def references(self):
        return self._references

    @property
    def source_caption(self):
        return self._source_caption
    
    @source_caption.setter
    def source_caption(self, val):
        self._source_caption = val

    @image.setter
    def image(self, val):
        self._image = val

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
    """Class representing datasets.

    The Dataset class holds all the elements of the dataset, general
    information about the dataset and provides means to iterate over it.

    Attributes:
        idx: An integer index of the dataset in the global state's dataset list.
        name: A string name of the dataset.
        count: The number of elements in the dataset.
        batch_size: An integral size of the batch.
        prefix: A string path to the directory where the dataset elements
            are located.
        elements: A list of DataInstance instances.
        images: A boolean value, whether the dataset contains the elements'
            images.
        preprocessed_images: A boolean value, whether the dataset contains 
            the elements' preprocessed images.
        feature_maps: A boolean value, whether the dataset contains elements'
            feature maps.
    """

    def __init__(self, name, prefix, batch_size, images=False, features=False, prepro=False, src_caps=False):
        """Creates a Dataset instance.

        Args:
            name: A string for the dataset name.
            prefix: A string path specifying the location of the elements.
            batch_size: The size of the batch.
            images: A Boolean, whether the dataset elements are images.
            features: A Boolean, whether the dataset elements are feature maps.
            prepro: A boolean, whether the elements are already preprocessed.
        Raises:
            ValueError: The directory given by `prefix` does not exist.
        """

        self._name = name
        self._prefix = prefix
        self._batch_size = batch_size
        self._elements = []
        self._count = 0
        self._images = images
        self._feature_maps = features
        self._preprocessed_imgs = prepro
        self._idx = None

        self.has_source_captions = src_caps

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
    def idx(self):
        return self._idx

    @idx.setter
    def idx(self, val):
        self._idx = val

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
    def images(self):
        return self._images

    @property
    def feature_maps(self):
        return self._feature_maps

    @property
    def preprocessed_imgs(self):
        return self._preprocessed_imgs
    

    def initialize(self, sources=None, fp=None):
        """Initialize the dataset.

        Only after calling this method, elements of the dataset
        are instantiated in DataInstances.

        Args:
            sources: A list of strings. Each string is a file name, which
                should be found in the directory given by the dataset's
                `prefix` attribute.
            fp: A file path. The file should contain file names on separate
                lines, specifying the files containing dataset elements.
        """

        if sources:
            sources = [s.rstrip() for s in sources]

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
        """JSON serializes the dataset.

        Returns:
            A string representing the JSON-serialized dataset instance.
        """

        return json.dumps(self, cls=DatasetEncoder)

    def default(self):
        """Transform the dataset into a JSON-serializable object.

        Returns:
            A JSON-serializable dictionary representation of the
            dataset.
        """
        
        return DatasetEncoder().default(self)

    def load_images(self):
        """Loads the image data into the dataset.
        """

        for e in self.elements:
            e.image = Image.open(e.source)
            e.image = e.image.convert(mode='RGB')
        self._images = True

    def load_image(self, elementId):
        """Loads the image data of a dataset element.

        Args:
            elementId: The index of the dataset element.
        Returns:
            A PIL Image corresponding to the image data of the
            element specified by `elementId`.
        """

        e = self.elements[elementId]
        return Image.open(e.source)

    def attach_prepro_images(self, images):
        """Attaches preprocessed images to the dataset's elements.

        Args:
            images: An iterable of Numpy Arrays.
        """

        for elem, img in zip(self.elements, images):
            elem.prepro_img = img
        self._preprocessed_imgs = True

    def attach_features(self, features):
        """Attaches features to the dataset's elements.

        Args:
            features: A Numpy Array of feature maps.
        """
        
        for elem, fm in zip(self.elements, features):
            elem.feature_map = fm
        self._feature_maps = True

    def attach_features_from_file_list(self, prefix="", sources=None):
        """Attaches features to the dataset's elements.

        Only feature maps serialized in the .npy and .npz formats are
        supported.

        Args:
            prefix: A string path to the directory containing stored feature
                maps.
            sources: A string path to the file containing filenames of the
                stored features, filename per line.
        Raises:
            ValueError: File given by `sources` does not exist.
            ValueError: The number of elements in the dataset and the number of
                feature maps do not match.
            ValueError: Unsupported file format for feature maps.
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

    def attach_references(self, refs_fp):
        """Attaches reference captions to the dataset's elements.

        In the case of multiple reference captions for instance, call
        this method repeatedly, once for each reference set.

        Args:
            refs_fp: A string path to the file containing reference captions,
                caption per line.
        Raises:
            RuntimeError: The file given by `refs_fp` does not exist.
            RuntimeError: The number of dataset elements and reference captions
                does not match.
        """

        if not os.path.exists(refs_fp):
            raise RuntimeError("Given references file path %s does not exist" %refs_fp)

        refs = open(refs_fp, mode='r').readlines()
        
        if len(refs) != self.count:
            raise RuntimeError("The number of dataset elements and \
                reference captions does not match.")

        refs = [_tokenize(r) for r in refs]

        for e, r in zip(self.elements, refs):
            e.references.append(r)
        return

    def attach_src_captions(self, src_cap_fp):
        """Attaches source captions to the dataset's elements.

        Args:
            src_cap_fp: A string path to the file containing source captions,
                caption per line.
        Raises:
            RuntimeError: The file given by `src_cap_fp` does not exist.
            RuntimeError: The number of dataset elements and source captions
                does not match.
        """

        if not os.path.exists(src_cap_fp):
            raise RuntimeError("Given source captions file path %s \
                does not exist.", src_cap_fp)

        src_caps = open(src_cap_fp, 'r').readlines()

        if len(src_caps) != self.count:
            raise RuntimeError("The number of dataset elements and \
                source captions does not match.")
        
        src_caps = [_tokenize(c) for c in src_caps]

        for e, c in zip(self.elements, src_caps):
            e.source_caption = c

        self.has_source_captions = True
        return

    def get_source_captions(self):
        """Returns source captions.

        Returns a list of string source captions or None if 
        source captions are not attached to the dataset.
        """

        if not self.has_source_captions:
            return None
        else:
            return [' '.join(e.source_caption) for e in self.elements]

    def _create_offspring(self):
        return Dataset(name=self.name,
                    prefix=self.prefix,
                    batch_size=self.batch_size,
                    images=self._images,
                    features=self._feature_maps,
                    prepro=self._preprocessed_imgs,
                    src_caps=self.has_source_captions)

    def _set_elements(self, elements):
        self._elements = elements
        self._count = len(elements)

def _tokenize(string):
    string = string.strip()
    # TODO: improve this regex
    string = re.sub('[\.,!?]', '', string)
    return string.split()

class DatasetEncoder(json.JSONEncoder):
    """Dataset JSON-encoder class.

    This class serves for serializing Dataset instances into JSON.
    To JSON-encode a Dataset instance, pass it as an argument to
    one of the serialization methods from the json module or call
    its `default` method. For example, json.dumps(dataset, cls=DatasetEncoder).
    """

    def default(self, dataset):
        """JSON encode a dataset.

        Args:
            dataset: A Dataset instance.
        Returns:
            A JSON-compatible Python dictionary with the encoded dataset.
        """

        instance_encoder = DataInstanceEncoder()
        return {
            "id": dataset.idx,
            "name": dataset.name,
            "prefix": dataset.prefix,
            "batchSize": dataset.batch_size,
            "count": dataset.count,
            "elements": [instance_encoder.default(e) for e in dataset.elements]
        }

class DataInstanceEncoder(json.JSONEncoder):
    """DataInstance JSON-encoder class.

    To JSON-encode a DataInstance instance, instantiate this class
    and call its default method on the data instance. Or pass the
    class along with the data instance to one of the json module's
    serialization methods, as in json.dumps(dataInstance, cls=DataInstanceEncoder).
    """

    def default(self, inst):
        """JSON encode a data instance.

        Args:
            inst: A DataInstance instance.
        Returns:
            A JSON-compatible Python dictionary with the encoded data instance.
        """

        return {
            "id": inst.idx,
            "source": inst.source,
            "sourceCaption": inst._source_caption,
            "references": inst._references,
        }
