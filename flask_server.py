"""This module contains the routing functions for the Flask web server.

It is responsible for handling all the requests coming from the client:
adding datasets, model parts, running runners on dataset, visualizing
attention maps, responding results, etc.

The routing functions receive their arguments from Flask's global Request
object or from the URLs, depending on whether the data can be encoded into
the URL by Flask's capabilities.

The return values from the routing functions are packed into a HTTP response
body sent back to the client by Flask.
"""

import json
import os
import sys
from random import random
from collections import namedtuple
from io import BytesIO

from flask import Flask, render_template, request, send_file
from PIL import Image

from data import create_dataset, Dataset
from visualizations import attention_map_jpg, attention_map_for_original_img
from metrics import evaluate
from feature_extractors import create_feature_extractor
from model_wrappers import create_model_wrapper
from preprocessing import create_preprocessor
from runner import create_runner
from validation import validate_cfg


Result = namedtuple('Result', ['runId', 'runnerId', 'datasetId', 'results'])

# Create the Flask server.
static_path = os.path.abspath('dist')
APP = Flask(__name__, static_folder=static_path)

# Create a binding from the server instance to a Macaque state.
STATE = None
APP.config['state'] = STATE


def start_server(macaque_state, port, public):
    """Start the Flask server.

    Args:
        macaque_state: A MacaqueState instance holding the state of
            the application.
    
    This function blocks until the web server stops.
    """

    global STATE
    STATE = macaque_state
    APP.debug = False
    host = '0.0.0.0' if public else '127.0.0.1'
    
    # APP.run() launches Flask's built-in HTTP server.
    # The function call is blocking - the server waits
    # for user requests and handles them until terminated
    # or until an error occurs.
    APP.run(host=host, port=port)

@APP.route('/', methods=['GET'])
def init():
    """Handle requests for the root page.

    Returns:
        A HTML document in a string.
    """

    # TODO: tu poriesit reload
    # macaque_state ma property `initialised`
    # pri dalsich requestoch vrati home-page
    return render_template('index.html')

@APP.route('/initial_state', methods=['GET'])
def initial_state():
    ps = [p.to_json() for p in STATE.preprocessors]
    es = [e.to_json() for e in STATE.feature_extractors]
    ms = [m.to_json() for m in STATE.models]
    rs = [r.to_json() for r in STATE.runners]
    return json.dumps({
        'preprocessors': ps,
        'encoders': es,
        'models': ms,
        'runners': rs,
        'public': STATE.public
    })

@APP.route('/single_image_upload', methods=['POST'])
def single_image_upload():
    # Access the user-sent image from the request object.
    fname = request.files['input-file'].filename
    request.files['input-file'].save(fname)

    # Create a dataset to contain the image.
    ds = Dataset(
        name='dataset_' + str(int(random() * 1000000)),
        prefix='./',
        batch_size=1,
        images=True)
    ds.initialize(sources=[fname])
    ds_id = STATE.add_dataset(ds)
    return json.dumps({ 'datasetId': ds_id })

@APP.route('/single_image_process/<int:runner_id>/<int:dataset_id>', methods=['GET'])
def single_image_process(runner_id, dataset_id):
    # Compute the results
    runner = STATE.runners[runner_id]
    dataset = STATE.datasets[dataset_id]
    out = runner.run(dataset)
    run_id = STATE.get_current_run_counter()

    r = Result(runId=run_id,
        runnerId=runner_id,
        datasetId=dataset_id,
        results=out)
    STATE.add_results(r)

    return _jsonify_results(out, runner_id, dataset_id, run_id)

@APP.route('/add_dataset', methods=['POST'])
def add_dataset():
    """Handle requests for adding a new dataset.

    Returns:
        The newly created JSON-serialized dataset.
    """

    json_data = _get_json_from_request()
    
    error_log = validate_cfg(json_data, STATE, dataset=True)
    if error_log != {}:
        return json.dumps({ 'log': error_log })
    
    ds = create_dataset(json_data)
    STATE.add_dataset(ds)
    return ds.to_json()

@APP.route('/add_prepro', methods=['POST'])
def add_preprocessor():
    """Handle request for adding a new preprocessor.

    Returns:
        An string ID of the preprocessor.
    """

    json_data = _get_json_from_request()
    
    error_log = validate_cfg(json_data, STATE, prepro=True)
    if error_log != {}:
        return json.dumps({ 'log': error_log })
    
    prepro = create_preprocessor(json_data)
    idx = STATE.add_preprocessor(prepro)
    return json.dumps({
        'id': idx
    })

@APP.route('/add_encoder', methods=['POST'])
def add_feature_extractor():
    """Handle request for adding a new encoder.

    Returns:
        An string ID of the encoder.
    """

    json_data = _get_json_from_request()
    
    error_log = validate_cfg(json_data, STATE, encoder=True)
    if error_log != {}:
        return json.dumps({ 'log': error_log })

    encoder = create_feature_extractor(json_data)
    idx = STATE.add_feature_extractor(encoder)
    return json.dumps({
        'id': idx
    })

@APP.route('/add_model', methods=['POST'])
def add_model():
    """Handle request for adding a new model.

    Returns:
        An string ID of the model.
    """

    json_data = _get_json_from_request()
    
    error_log = validate_cfg(json_data, STATE, model=True)
    if error_log != {}:
        return json.dumps({ 'log': error_log })

    model = create_model_wrapper(json_data)
    idx = STATE.add_model(model)
    return json.dumps({
        'id': idx
    })

@APP.route('/add_runner', methods=['POST'])
def add_runner():
    """Handle request for adding a new runner.

    Returns:
        An string ID of the runner.
    """

    json_data = _get_json_from_request()
    
    error_log = validate_cfg(json_data, STATE, runner=True)
    if error_log != {}:
        return json.dumps({ 'log': error_log })

    runner = create_runner(STATE, json_data)
    idx = STATE.add_runner(runner)
    return json.dumps({
        'id': idx
    })

@APP.route('/run_on_dataset/<int:dataset_id>/<int:runner_id>', methods=['GET'])
def run_on_dataset(dataset_id, runner_id):
    """Handle request for running a runner on a dataset.

    Args:
        dataset_id: The integral ID of the dataset.
        runner_id: The integral ID of the runner.
    Returns:
        A JSON string containing the serialized results of the run.
    """

    runner = STATE.runners[runner_id]
    dataset = STATE.datasets[dataset_id]
    outputs = runner.run(dataset)
    r = Result(runId=STATE.get_current_run_counter(),
        runnerId=runner_id,
        datasetId=dataset_id,
        results=outputs)

    # store the results into the state.
    STATE.add_results(r)
    return _jsonify_results(outputs, 
        runner_id, 
        dataset_id, 
        STATE.get_current_run_counter() - 1)

@APP.route('/load_image/<int:dataset>/<int:element>', methods=['GET'])
def load_image(dataset, element):
    """Handles the request for an image from a dataset.

    Args:
        dataset: The integral ID of the dataset containing the image.
        element: The integral ID of the element in the dataset.
    Returns:
        The image binary data.
    """

    d = STATE.datasets[dataset]
    e = d.elements[element]
    path = e.source
    return send_file(path)

@APP.route('/load_attention_map/<int:run>/<int:element>/<int:caption>/<int:token>/', methods=['GET'])
def load_attention_map(run, element, caption, token):
    """Handles the request for an image visualizing the attention map.

    Visualizes the attention map on the preprocessed image.

    Args:
        run: The integral index of the run.
        element: The index of the element in the dataset.
        caption: The index of the caption. 0 is for greedy, higher numbers for
            beam search hypotheses.
        token: The index of the caption's token.
    Returns:
        A bytes object containing the image data.
    """

    res = head(filter(lambda x: x.runId == run, STATE.run_results))
    res = res.results[element]
    if caption == 0:
        alphas = res['greedy']['alignments'][token]
    else:
        alphas = res['beam_search']['alignments'][caption - 1][token]

    img = None if 'prepro_img' not in res else res['prepro_img']
    att_map = attention_map_jpg(alphas=alphas, image=img)
    return img_to_jpg_raw(att_map)

@APP.route('/load_attention_map_for_original_img/<int:run>/<int:element>/<int:caption>/<int:token>', methods=['GET'])
def load_attention_map_for_original_img(run, element, caption, token):
    """Handles the request for an image visualizing the attention map.

    Visualizes the attention map on the original image.

    Args:
        run: The integral index of the run.
        element: The index of the element in the dataset.
        caption: The index of the caption. 0 is for greedy, higher numbers for
            beam search hypotheses.
        token: The index of the caption's token.
    Returns:
        A bytes object containing the image data.
    """

    run_res = STATE.run_results[run]
    if caption == 0:
        alphas = run_res.results[element]['greedy']['alignments'][token]
    else:
        alphas = run_res.results[element]['beam_search']['alignments'][caption - 1][token]

    img = STATE.datasets[run_res.datasetId].load_image(element)
    prepro = STATE.runners[run_res.runnerId].preprocessor
    img = attention_map_for_original_img(alphas=alphas, image=img, prepro=prepro)
    return img_to_jpg_raw(img)

@APP.route('/load_attention_map_for_bs_token', methods=['POST'])
def load_attention_map_for_bs_token():
    """
    """
    json_data = _get_json_from_request()
    run = json_data['run']
    element = json_data['element']
    alignments = json_data['alignments']
    
    run_res = STATE.run_results[run]
    img = STATE.datasets[run_res.datasetId].load_image(element)
    prepro = STATE.runners[run_res.runnerId].preprocessor
    img = attention_map_for_original_img(alphas=alignments, 
            image=img, 
            prepro=prepro)
    return img_to_jpg_raw(img)


@APP.route('/load_bs_graph/<int:run>/<int:instance>', methods=['GET'])
def load_bs_graph(run, instance):
    res = STATE.run_results[run]
    graph = res.results[instance]['beam_search']['graph']
    if graph is not None:
        o = graph.to_json()
        return o
    else:
        return None

@APP.route('/evaluate_metric/<int:dataset>/<string:metric>', methods=['GET'])
def evaluate_metric(dataset, metric):
    """Evaluates a metric on the results of all runs on a given dataset.

    Args:
        dataset: The integral ID of the dataset.
        metric: The string name of the metric.
    Returns:
        A JSON serialized dictionary of the resulting scores.
    """

    # TODO: check that the dataset has reference captions
    run_res = filter(lambda x: x.datasetId == dataset, STATE.run_results)
    ds = STATE.datasets[dataset]
    refs = [e.references for e in ds.elements]
    results = {}

    for r in run_res:
        results[r.runId] = {}
        # evaluate greedy captions
        gr_caps, bs_caps = _collect_hyps(r)
        
        # do something with this
        bs_caps = _transpose_bs_hyps(bs_caps)

        scores, mean = evaluate(metric, gr_caps, refs)
        results[r.runId]['greedy'] = {
            'scores': scores,
            'mean': mean
        }
        # evaluate beam search captions from all beams
        results[r.runId]['beamSearch'] = []
        for hyps in bs_caps:
            scores, mean = evaluate(metric, hyps, refs)
            results[r.runId]['beamSearch'].append({
                'scores': scores,
                'mean': mean
            })

    return json.dumps(results)

def _get_json_from_request():
    return request.get_json(force=True)

def _collect_hyps(run_results):
    gr_caps = [r['greedy']['caption'] for r in run_results.results]
    bs_caps = [r['beam_search']['captions'] for r in run_results.results]
    return (gr_caps, bs_caps)

def _transpose_bs_hyps(hyps):
    if hyps is None:
        return None
    if len(hyps) == 0:
        return []
    beam_size = len(hyps[0])
    res = []
    res = [[] for i in range(beam_size)]
    for elem in hyps:
        for i in range(beam_size):
            res[i].append(elem[i])
    return res

def head(xs):
    """Returns the first element of an iterable.

    Args:
        xs: An iterable.
    Returns:
        The first element of `xs` or None if `xs` is empty.
    """

    xs = list(xs)
    if len(xs) > 0: 
        return xs[0] 
    return None

def img_to_jpg_raw(img):
    """Convert a PIL Image into JPG binary data.

    Args:
        img: A PIL Image.
    Returns:
        A bytes object containing the image data.
    """

    blob = BytesIO()
    img.save(blob, 'JPEG')
    return blob.getvalue()

def _jsonify_results(results, runner_id, dataset_id, run_id):
    rs = []
    for x in results:
        r = { 'greedy': {}, 'beamSearch': {}}
        if 'greedy' not in x or x['greedy'] is None:
            r['greedy'] = {'caption': [], 'alignments': [], 'hasAttn': False}
        else:
            if 'caption' in x['greedy'] and x['greedy']['caption'] is not None:
                r['greedy']['caption'] = x['greedy']['caption']
            if 'alignments' in x['greedy'] and x['greedy']['alignments'] is not None:
                r['greedy']['hasAttn'] = True
            else:
                r['greedy']['hasAttn'] = False
        
        if 'beam_search' not in x or x['beam_search'] is None:
            r['beamSearch'] = {'captions': [], 
                'hasAttn': False,
                'hasGraph': False
            }
        else:
            if 'captions' in x['beam_search']:
                r['beamSearch']['captions'] = x['beam_search']['captions']
            if 'alignments' in x['beam_search']:
                r['beamSearch']['hasAttn'] = True
            else:
                r['beamSearch']['hasAttn'] = False
            if 'graph' in x['beam_search']:
                r['beamSearch']['hasGraph'] = True
            else:
                r['beamSearch']['hasGraph'] = False

        rs.append(r)
    
    return json.dumps({
        'runId': run_id,
        'runnerId': runner_id,
        'datasetId': dataset_id,
        'results': rs
    })
