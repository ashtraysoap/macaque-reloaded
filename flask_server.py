import json
import os

from flask import Flask, render_template, request

from data import create_dataset
from interface import create_model_interface

# Create the Flask server.
static_path = os.path.abspath('dist')
APP = Flask(__name__, static_folder=static_path)
# Create a binding from the server instance to a Macaque state.
STATE = None
APP.config['state'] = STATE

def start_server(macaque_state):
    global STATE
    STATE = macaque_state
    APP.run()

@APP.route('/', methods=['GET'])
def init():
    return render_template('index.html')

@APP.route('/add_dataset', methods=['POST'])
def add_dataset():
    json_data = _get_json_from_request()
    # validate json_data
    ds = create_dataset(json_data)
    STATE.add_dataset(ds)
    return ds.to_json()

@APP.route('/add_model', methods=['POST'])
def add_model():
    json_data = _get_json_from_request()
    # validate json_data
    ifc = create_model_interface(json_data)
    STATE.add_model_interface(ifc)
    return ifc.to_json()

@APP.route('/run_model_on_dataset', methods=['POST'])
def run_model_on_dataset():
    json_data = _get_json_from_request()
    ds = json_data['dataset']
    results = []
    for m_id in json_data['models']:
        m = STATE.model_interfaces[m_id]
        result = m.run_on_dataset(STATE.datasets[ds])
        result = {
            'runId': 1,
            'modelId': m_id,
            'datasetId': ds,
            'results': result
        }
        print(result)
        results.append(result)
    return json.dumps(results)

@APP.route('/update_user', methods=['POST'])
def update_user():
    pass

@APP.route('/attach_encoder', methods=['POST'])
def attach_encoder_to_model():
    pass

def _get_json_from_request():
    return request.get_json(force=True)
