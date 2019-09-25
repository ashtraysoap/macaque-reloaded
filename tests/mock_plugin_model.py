import random

import numpy as np

from neuralmonkey.readers.image_reader import single_image_for_imagenet

class ModelWrapper:
    def run(self, xs):
        print("Entering mock model wrapper.")
        y = { 
            'caption': ["Colorless", "green", "ideas", "sleep", "furiously"],
            'alignments': get_dummy_alphas(size=5),
            'beam_search_output': None,
        }
        res = [y for x in xs]
        print("Computation complete, returning mock resuslts.")
        return res

def get_dummy_alphas(height=14, width=14, size=1):
    res = np.zeros((size, height, width), dtype=np.uint8)

    for k in range(size):
        arr = np.zeros((height, width))
        u = random.randint(0, height - 1)
        v = random.randint(0, width - 1)

        for i in range(height):
            for j in range(width):
                arr[i, j] = height**2 + width**2 - (i - u)**2 - (j - v)**2

        max = np.amax(arr)
        arr = arr / max
        res[k] = np.uint8(225 * arr)

    return res.tolist()