class ModelWrapper:

    def run_on_paths(self, paths):
        mock_result = {
                'caption': [],
                'alignments': [],
                'beam_seach_output_graph': None
            }
        return [mock_result for p in paths]
