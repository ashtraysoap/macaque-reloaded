class ModelWrapper:

    def run_on_features(self, features):
        mock_result = {
                'caption': [],
                'alignments': [],
                'beam_seach_output_graph': None
            }
        return [mock_result for f in features]
