import os

from data import Dataset

TEST_PREFIX = "./tests/data/flickr8k_sample_imgs"
TEST_SOURCES = "./tests/data/flickr8k_sample_imgs.txt"
TEST_NAME = "test_ds"

def make_test_dataset():
    return Dataset(name=TEST_NAME,
                prefix=TEST_PREFIX,
                batch_size=8)

def test_dataset_constructor():
    ds = make_test_dataset()
    assert isinstance(ds, Dataset) == True
    assert ds.name == TEST_NAME
    assert ds.prefix == TEST_PREFIX
    assert ds.batch_size == 8
    assert ds.count == 0

def test_dataset_init():
    ds = make_test_dataset()
    srcs = open(TEST_SOURCES, 'r').readlines()
    ds.initialize(sources=srcs)
    count = len(srcs)
    assert ds.count == count

def test_dataset_init_fp():
    ds = make_test_dataset()
    ds.initialize(fp=TEST_SOURCES)
    srcs = open(TEST_SOURCES, 'r').readlines()
    count = len(srcs)
    assert ds.count == count

def test_dataset_init_no_args():
    ds = make_test_dataset()
    ds.initialize()
    paths = os.listdir(TEST_PREFIX)
    assert ds.count == len(paths)

def test_dataset_iter():
    ds = make_test_dataset()
    ds.initialize(fp=TEST_SOURCES)

    count = ds.count
    x = 0
    for batch in ds:
        x += len(batch.elements)
    assert x == count
    