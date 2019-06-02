import argparse
import os

import numpy as np
from neuralmonkey.experiment import Experiment
from neuralmonkey.dataset import Dataset

from datagen import PathGenerator
from feature_extractor import NeuralMonkeyFeatureExtractor
from model_interface import NeuralMonkeyModelInterface

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
    # parser.add_argument('--features_dir')
    # parser.add_argument('--features_list')
    # parser.add_argument('--refs')
    parser.add_argument('--nm_model_config_path', type=str, default="/media/sam/Kafka/190424-1/experiment.ini",
                        help="Path to the Neural Monkey config file.")
    # parser.add_argument('--nm_dataset_config_path', type=str, default="",
    #                     help="Path to the Neural Monkey dataset config file.")
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

    datagen = PathGenerator(prefix=args.images_dir, img_paths=args.images_list, batch_size=args.batch_size)
    feature_extractor = NeuralMonkeyFeatureExtractor(datagen,
                                                    net=args.encoder_net,
                                                    slim_models=args.slim_models_path,
                                                    model_checkpoint=args.encoder_checkpoint,
                                                    conv_map=args.spatial_layer)
    feature_extractor.initialize()
    interface = NeuralMonkeyModelInterface(config_path=args.nm_model_config_path,
                                        variables_path=args.nm_variables_path,
                                        feature_extractor=feature_extractor)
    interface.initialize()
    interface.run()


if __name__ == "__main__":
    main()
