import json
import os
from collections import namedtuple
from io import BytesIO

from flask import Flask, render_template, request, send_file

from data import create_dataset
from interface import create_model_interface
from visualizations import attention_map_jpg, attention_map_for_original_img

from feature_extractors import create_feature_extractor
from model_wrappers import create_model_wrapper
from preprocessing import create_preprocessor
from runner import create_runner

Result = namedtuple('Result', ['runId', 'runnerId', 'datasetId', 'results'])

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

@APP.route('/add_prepro', methods=['POST'])
def add_preprocessor():
    json_data = _get_json_from_request()
    # validate json
    # json_data = { targetWidth, targetHeight, mode }
    prepro = create_preprocessor(json_data)
    idx = STATE.add_preprocessor(prepro)
    return str(idx)

@APP.route('/add_encoder', methods=['POST'])
def add_feature_extractor():
    json_data = _get_json_from_request()
    # validate json
    encoder = create_feature_extractor(json_data)
    idx = STATE.add_feature_extractor(encoder)
    return str(idx)

@APP.route('/add_model', methods=['POST'])
def add_model():
    json_data = _get_json_from_request()
    # validate json
    model = create_model_wrapper(json_data)
    idx = STATE.add_model(model)
    return str(idx)

@APP.route('/add_runner', methods=['POST'])
def add_runner():
    json_data = _get_json_from_request()
    # validate json
    # json_data = { preproId, encoderId, modelId }
    runner = create_runner(STATE, json_data)
    idx = STATE.add_runner(runner)
    return str(idx)

@APP.route('/run_on_dataset/<int:datasetId>/<int:runnerId>', methods=['GET', 'POST'])
def run_on_dataset(datasetId, runnerId):
    runner = STATE.runners[runnerId]
    dataset = STATE.datasets[datasetId]
    outputs = runner.run(dataset)
    r = Result(runId=STATE.get_current_run_counter(),
        runnerId=runnerId,
        datasetId=datasetId,
        results=outputs)
    STATE.add_results(r)
    return json.dumps({
        'runId': STATE.get_current_run_counter() - 1,
        'runnerId': runnerId,
        'datasetId': datasetId,
        'captions': list(map(lambda x: {
            'greedyCaption': [] if x['greedy'] is None 
                else x['greedy']['caption'],
            'beamSearchCaptions': [] if x['beam_search'] is None 
                else x['beam_search']['captions']
        }, outputs))
    })

@APP.route('/load_image/<int:dataset>/<int:element>', methods=['POST', 'GET'])
def load_image(dataset, element):
    d = STATE.datasets[dataset]
    e = d.elements[element]
    path = e.source
    return send_file(path)

@APP.route('/load_attention_map/<int:run>/<int:element>/<int:caption>/<int:token>/', methods=['POST', 'GET'])
def load_attention_map(run, element, caption, token):
    res = head(filter(lambda x: x.runId == run, STATE.run_results))
    res = res.results[element]
    if caption == 0:
        alphas = res['greedy']['alignments'][token]
    else:
        alphas = res['beam_search']['alignments'][caption - 1][token]

    img = None if 'prepro_img' not in res else res['prepro_img']
    att_map = attention_map_jpg(alphas=alphas, image=img)
    return img_to_jpg_raw(att_map)

@APP.route('/load_attention_map_for_original_img/<int:run>/<int:element>/<int:caption>/<int:token>', methods=['POST', 'GET'])
def load_attention_map_for_original_img(run, element, caption, token):
    run_res = STATE.run_results[run]
    if caption == 0:
        alphas = run_res.results[element]['greedy']['alignments'][token]
    else:
        alphas = run_res.results[element]['beam_search']['alignments'][caption - 1][token]

    img = STATE.datasets[run_res.datasetId].load_image(element)
    prepro = STATE.runners[run_res.runnerId].preprocessor
    img = attention_map_for_original_img(alphas=alphas, image=img, prepro=prepro)
    return img_to_jpg_raw(img)

def _get_json_from_request():
    return request.get_json(force=True)

def head(xs):
    xs = list(xs)
    if len(xs) > 0: 
        return xs[0] 
    return None

def img_to_jpg_raw(img):
    blob = BytesIO()
    img.save(blob, 'JPEG')
    return blob.getvalue()