class MacaqueState():
    def __init__(self):
        self._datasets = {}
        self._model_interfaces = {}
        self._user = None

    @property
    def datasets(self):
        return self._datasets

    @property
    def model_interfaces(self):
        return self._model_interfaces

    @property
    def user(self):
        return self._user

    def add_model_interface(self, ifc):
        if self._model_interfaces[ifc.name] is not None:
            raise ValueError("An interface with this name is already used.")
        
        self._model_interfaces[ifc.name] = ifc

    def add_dataset(self, ds):
        if self._datasets[ds.name] is not None:
            raise ValueError("A dataset with this name is already used.")
        
        self._datasets[ds.name] = ds