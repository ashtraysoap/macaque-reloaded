from enum import Enum

import numpy as np
from PIL import Image

def create_preprocessor(prepro_config):
    print(prepro_config)
    w = prepro_config['targetWidth']
    h = prepro_config['targetHeight']
    m = prepro_config['mode']
    w = int(w)
    h = int(h)
    m = PreproMode(int(m))
    return Preprocessor(target_width=w, target_height=h, mode=m)

class PreproMode(Enum):
    AspectRatioCrop = 1
    AspectRatioPad = 2
    RescaleWidthRescaleHeight = 3
    RescaleWidthPadOrCropHeight = 4
    RescaleHeightPadOrCropWidth = 5

class Preprocessor():
    def __init__(self, target_width=224, target_height=224, mode=PreproMode.AspectRatioCrop):
        self._target_width = target_width
        self._target_height = target_height
        self._mode = mode
        self._idx = None

    @property
    def idx(self):
        return self._idx

    @idx.setter
    def idx(self, val):
        self._idx = val

    @property
    def target_width(self):
        return self._target_width

    @property
    def target_height(self):
        return self._target_height

    @property
    def mode(self):
        return self._mode

    def preprocess(self, dataset):
        """
            Preprocesses images from the dataset.

            Returns: A numpy array of preprocessed images.
        """
        def rescale_width_rescale_height(img):
            return img.resize((self._target_width, self._target_height))

        def rescale_height_pad_or_crop_width(img):
            img = img.resize((img.width, self._target_height))
            if img.width > self._target_width:
                return crop(img, self._target_width, self._target_height)
            else:
                return pad(img, self._target_width, self._target_height)

        def rescale_width_pad_or_crop_height(img):
            img = img.resize((self._target_width, img.height))
            if img.height > self._target_height:
                return crop(img, self._target_width, self._target_height)
            else:
                return pad(img, self._target_width, self._target_height)

        def keep_aspect_ratio_and_pad(img):
            w = img.width
            h = img.height
            rw = self._target_width / w
            rh = self._target_height / h
            if rw < rh:
                img = img.resize((self._target_width, int(h * rw)))
            else:
                img = img.resize((int(w * rh), self._target_height))
            return pad(img, self._target_width, self._target_height)

        def keep_aspect_ratio_and_crop(img):
            w = img.width
            h = img.height
            rw = self._target_width / w
            rh = self._target_height / h
            if rw > rh:
                img = img.resize((self._target_width, int(h * rw)))
            else:
                img = img.resize((int(w * rh), self._target_height))
            return crop(img, self._target_width, self._target_height)

        dataset.load_images()
        pil_imgs = [e.image for e in dataset.elements]
        mode = self._mode

        if mode == PreproMode.RescaleWidthRescaleHeight:
            return [rescale_width_rescale_height(img) for img in pil_imgs]
        elif mode == PreproMode.RescaleHeightPadOrCropWidth:
            return [rescale_height_pad_or_crop_width(img) for img in pil_imgs]
        elif mode == PreproMode.RescaleWidthPadOrCropHeight:
            return [rescale_width_pad_or_crop_height(img) for img in pil_imgs]
        elif mode == PreproMode.AspectRatioCrop:
            return [keep_aspect_ratio_and_crop(img) for img in pil_imgs]
        elif mode == PreproMode.AspectRatioPad:
            return [keep_aspect_ratio_and_pad(img) for img in pil_imgs]

        print('Mode is ', mode, ', returning None')
        return None

def crop(image, target_width, target_height):
    """
    crop die center of dis image
    """
    w = image.width
    h = image.height
    d_w = w - target_width
    d_h = h - target_height
    left = d_w / 2
    upper = d_h / 2
    right = target_width + left
    lower = target_height + upper
    return image.crop((left, upper, right, lower))

def pad(image, target_width, target_height):
    """
    pad die image so thad di original is placed center
    """
    img_padded = np.zeros((target_height, target_width, 3))
    w = image.width
    h = image.height
    d_w = int((target_width - w) / 2)
    d_h = int((target_height - h) / 2)
    img = np.array(image)
    img_padded[d_h:(h + d_h), d_w:(w + d_w), :] = img
    return Image.fromarray(img_padded.astype('uint8'))

def test_prepro():
    from data import Dataset
    ds = Dataset(name='ds', prefix='/home/sam/Pictures', batch_size=1)
    ds.initialize(sources=['puppy.jpg'])
    p1 = Preprocessor(224, 224, PreproMode.RescaleHeightPadOrCropWidth)
    p2 = Preprocessor(224, 224, PreproMode.RescaleWidthPadOrCropHeight)
    p3 = Preprocessor(224, 224, PreproMode.RescaleWidthRescaleHeight)
    p4 = Preprocessor(224, 224, PreproMode.AspectRatioCrop)
    p5 = Preprocessor(224, 224, PreproMode.AspectRatioPad)
    i1 = p1.preprocess(ds)[0]
    i2 = p2.preprocess(ds)[0]
    i3 = p3.preprocess(ds)[0]
    i4 = p4.preprocess(ds)[0]
    i5 = p5.preprocess(ds)[0]
    i1.show()
    input()
    i2.show()
    input()
    i3.show()
    input()
    i4.show()
    input()
    i5.show()
    return
