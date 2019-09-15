class MacaqueState():
    def __init__(self):
        self._datasets = {}
        self._model_interfaces = {}
        self._run_results = {}
        self._run_counter = 0
        self._user = None

    @property
    def datasets(self):
        return self._datasets

    @property
    def model_interfaces(self):
        return self._model_interfaces
    
    @property
    def run_results(self):
        return self._run_results

    @property
    def user(self):
        return self._user

    def add_model_interface(self, ifc):
        if ifc.name in self._model_interfaces:
            raise ValueError("An interface with this name is already used.")
        
        self._model_interfaces[ifc.name] = ifc

    def add_dataset(self, ds):
        if ds.name in self._datasets:
            raise ValueError("A dataset with this name is already used.")
        
        self._datasets[ds.name] = ds

    def add_results(self, datasetId, res):
        if datasetId in self._run_results:
            self._run_results[datasetId][self._run_counter] = res
        else:
            self._run_results[datasetId] = {}
            self._run_results[datasetId][self._run_counter] = res
        self._run_counter += 1

    def update_dataset(self, name, ds):
        if name not in self._datasets:
            raise ValueError("There is no dataset with name {}".format(name))

        self._datasets[name] = ds

    def get_current_run_counter(self):
        return self._run_counter

    def get_run_results(self, datasetId):
        return self._run_results[datasetId]

    def get_run_results_for_instance(self, datasetId, dataInstanceId):
        return list(map(lambda x: { x[0]: x[1][dataInstanceId] }, self._run_results[datasetId].items()))