import interface

class Configuration:
    def __init__(self, args=None):
        pass

    def create_model_interface(self):
        return interface.NeuralMonkeyModelInterface()