class ModelWrapper:

    def run_on_dataset(self, dataset):
        mock_result = {
                'caption': [],
                'alignments': [],
                'beam_seach_output_graph': None
            }
        return [mock_result for e in dataset.elements]
