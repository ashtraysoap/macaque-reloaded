class ModelWrapper:

    def run_on_images(self, images):
        mock_result = {
                'caption': [],
                'alignments': [],
                'beam_seach_output_graph': None
            }
        return [mock_result for i in images]
