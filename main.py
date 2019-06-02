import os
import numpy as np
from neuralmonkey.experiment import Experiment
from neuralmonkey.dataset import Dataset

import argparse

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
    # ... add args
    parser.add_argument('--images_dir', type=str, default="/media/sam/Karenin/Flickr8k/Flicker8k_Dataset",
                        help="Path to the directory containing the images of the dataset.")
    parser.add_argument('--images_list', type=str, default="../f8k-demo-img.txt",
                        help="Path to the file which contains per line names of the files in `images_dir` to process.")
    # parser.add_argument('--features_dir')
    # parser.add_argument('--features_list')
    # parser.add_argument('--refs')
    parser.add_argument('--nm_config_path', type=str, default="/media/sam/Kafka/190424-1/experiment.ini",
                        help="Path to the Neural Monkey config file.")
    parser.add_argument('--nm_variables_path', type=str, default="/media/sam/Kafka/190424-1/avg-0",
                        help="Path to the Neural Monkey model's variables.")
    parser.add_argument('--nm_checkpoint_dir',
                        help="Path to the Neural Monkey experiment's output directory.")
    parser.add_argument('--batch_size', type=int, default=2,
                        help="Batch size.")

    args = parser.parse_args()
    datagen = PathGenerator(prefix=args.images_dir, img_paths=args.images_list, batch_size=args.batch_size)
    feature_extractor = NeuralMonkeyFeatureExtractor(datagen,
                                                    net="vgg_16",
                                                    slim_models="tensorflow-models/research/slim",
                                                    model_checkpoint="/media/sam/Karenin/vgg_16.ckpt",
                                                    conv_map="vgg_16/conv5/conv5_3")
    feature_extractor.initialize()
    interface = NeuralMonkeyModelInterface(config_path=args.nm_config_path,
                                        variables_path=args.nm_variables_path,
                                        feature_extractor=feature_extractor)
    interface.initialize()
    interface.run()


if __name__ == "__main__":
    main()
    # exp = Experiment(config_path='/media/sam/Kafka/190424-1/experiment.ini')
    # exp.build_model()
    # exp.load_variables(['/media/sam/Kafka/190424-1/avg-0'])

    # imgs = [np.load('../vgg-demo-out/' + f)['arr_0'] for f in os.listdir('../vgg-demo-out')]
    # dataset = Dataset("dataset", {"images": lambda: np.array(imgs)}, {})

    # results = exp.run_model(dataset, write_out=False)
    # print(results)