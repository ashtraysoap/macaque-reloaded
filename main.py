#!/usr/bin/env python3

import argparse
import os

import numpy as np
from neuralmonkey.dataset import Dataset
from neuralmonkey.experiment import Experiment
from neuralmonkey.run import load_runtime_config

#from config_analyzer import infere_data_correspondence, create_fake_config
#from datagen import PathGenerator
#from feature_extractor import NeuralMonkeyFeatureExtractor
#from model_interface import NeuralMonkeyModelInterface
from data import Dataset
from feature_extractor import NeuralMonkeyFeatureExtractor
from interface import NeuralMonkeyModelInterface

def check_args(args):
    if (args.images_dir is not None) and (not os.path.exists(args.images_dir)):
        raise ValueError('`images_dir` does not exist.')
    # check all the rest
    # check that number of images matches the number of references etc.

def main():
    parser = argparse.ArgumentParser()

    parser.add_argument('--images_dir', type=str, default="/media/sam/Karenin/Flickr8k/Flicker8k_Dataset",
                        help="Path to the directory containing the images of the dataset.")
    parser.add_argument('--images_list', type=str, default="../f8k-demo-img.txt",
                        help="Path to the file which contains per line names of the files in `images_dir` to process.")
    # parser.add_argument('--refs')
    parser.add_argument('--nm_model_config_path', type=str, default="/media/sam/Kafka/190424-1/experiment.ini",
                        help="Path to the Neural Monkey config file.")
    parser.add_argument('--nm_variables_path', type=str, default="/media/sam/Kafka/190424-1/avg-0",
                        help="Path to the Neural Monkey model's variables.")
    parser.add_argument('--nm_checkpoint_dir',
                        help="Path to the Neural Monkey experiment's output directory.")
    parser.add_argument('--batch_size', type=int, default=2,
                        help="Batch size.")
    parser.add_argument('--encoder_net', type=str, default="vgg_16",
                        help="The type of feature extractor to use.")
    parser.add_argument('--encoder_checkpoint', type=str, default="/media/sam/Karenin/vgg_16.ckpt",
                        help="Path to the feature extractor's checkpoint file.")
    parser.add_argument('--slim_models_path', type=str, default="tensorflow-models/research/slim",
                        help="Path to the tensorflow/models/research/slim directory.")
    parser.add_argument('--spatial_layer', type=str, default="vgg_16/conv5/conv5_3",
                        help="The identifier of the spatial layer to use as feature maps.")

    args = parser.parse_args()

    # if args.nm_model_config_path is not None:
    #     text_ds, reader_ds, other_ds, edit_cfg, cfg_parser = infere_data_correspondence(args.nm_model_config_path)

    # data_config = create_fake_config(prefix=args.images_dir,
    #                                 files=args.images_list,
    #                                 series=reader_ds[0][0],
    #                                 reader=reader_ds[0][1],
    #                                 configparser=cfg_parser)
    
    # with open('data.ini', 'w', encoding='utf-8') as outf:
    #     outf.writelines(data_config)

    # datasets_model = load_runtime_config('data.ini')
    # exp = Experiment(config_path=edit_cfg)
    # exp.build_model()
    # exp.load_variables(datasets_model.variables)

    # for dataset in datasets_model.test_datasets:
    #     print(exp.run_model(dataset, write_out=False))

    ds = Dataset("macaque", prefix=args.image_dir, batch_size=2)
    ds.initialize(sources=args.image_list)
    i = NeuralMonkeyModelInterface(args.nm_model_config_path, args.nm_variables_path)

    if i.decoder_only:
        fe = NeuralMonkeyFeatureExtractor(net="vgg_19", slim_models=args.slim_models_path,
            model_checkpoint=args.encoder_checkpoint, conv_map="vgg_19/conv5/conv5_3")
        i.feature_extractor = fe

    print(i.run_on_dataset(ds))


if __name__ == "__main__":
    main()
