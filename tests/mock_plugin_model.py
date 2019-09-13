class ModelWrapper:
    def run_on_paths(self, paths):
        print("Entering mock model wrapper.")
        x = { 
            'caption': ["Colorless", "green", "ideas", "sleep", "furiously"],
            'alignments': None,
            'beam_search_output': None
        }
        res = [x for p in paths]
        print("Computation complete, returning mock resuslts.")
        return res
