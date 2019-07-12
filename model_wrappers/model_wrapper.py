class ModelWrapper:
    def __init__(self):
        raise NotImplementedError()

    def run(self, dataset):
        """
        Returns:
            A list of dictionaries. Each dictionary contains the keys
            `caption`, `alignments`, `beam_search_output_graph`.
        """
        raise NotImplementedError()