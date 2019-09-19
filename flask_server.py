import json
import os
from io import BytesIO

from flask import Flask, render_template, request, send_file

from data import create_dataset
from interface import create_model_interface
from visualizations import attention_map_jpg


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
    # validate json_data
    ds_id = json_data['dataset']
    results = []
    for m_id in json_data['models']:
        m = STATE.model_interfaces[m_id]
        result = m.run_on_dataset(STATE.datasets[ds_id])
        STATE.add_results(ds_id, result)
        run_id = STATE.get_current_run_counter() - 1
        # only send the captions to the client, the rest is on demand
        r = {
            'runId': run_id,
            'modelId': m_id,
            'datasetId': ds_id,
            'captions': list(map(lambda x: x['caption'], result))
        }
        results.append(r)
    return json.dumps(results)

@APP.route('/update_user', methods=['POST'])
def update_user():
    pass

@APP.route('/load_image/<string:dataset>/<int:element>', methods=['POST', 'GET'])
def load_image(dataset, element):
    d = STATE.datasets[dataset]
    e = d.elements[element]
    path = e.source
    return send_file(path)

@APP.route('/load_results/<string:dataset>/<int:element>', methods=['POST', 'GET'])
def load_results(dataset, element):
    # run_results is a dictionary, keys are runIds and values
    # are results for the given dataset element
    run_results = STATE.get_run_results_for_instance(dataset, element)
    new_results = {}
    for run_id, results in run_results.items():
        caption = results['caption']
        alignments = results['alignments']
        prepro_img = results['prepro_img'] if 'prepro_img' in results else None
        bs_out = results['beam_search_output'] if 'beam_search_output' in results else None

        new_results[run_id] = {
            'caption': caption,
            'alignments': alignments,
            'bsOutput': bs_out
        }

    return json.dumps(new_results)

@APP.route('/load_attention_maps/<string:dataset>/<int:element>', methods=['POST', 'GET'])
def load_attention_maps(dataset, element):
    pass

@APP.route('/load_prepro_image/<string:dataset>/<int:element>', methods=['POST', 'GET'])
def load_prepro_images(dataset, element):
    pass

@APP.route('/load_attention_map/<int:run>/<string:dataset>/<int:element>/<int:token>/', methods=['POST', 'GET'])
def load_attention_map(run, dataset, element, token):
    run_results = STATE.get_run_results_for_instance(dataset, element)
    run_results = run_results[run]
    alphas = run_results['alignments'][token]
    prepro_img = run_results['prepro_img']
    jpg_map = attention_map_jpg(alphas, prepro_img)
    blob = BytesIO()
    jpg_map.save(blob, 'JPEG')
    return blob.getvalue()

def _get_json_from_request():
    return request.get_json(force=True)
