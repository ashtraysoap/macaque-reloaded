import json

from flask import Flask, render_template, request

from data import Dataset
from interface import create_model_interface

APP = Flask(__name__)
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

    print(json_data)
    ds = Dataset(name=json_data['name'],
                prefix=json_data['imgDir'],
                batch_size=json_data['batchSize'])
    
    srcs = open(json_data['imgSrcs'], 'r', encoding='utf-8')
    ds.initialize(sources=srcs)

    STATE.add_dataset(ds)
    return ds.to_json()

@APP.route('/add_model', methods=['POST'])
def add_model():
    json_data = _get_json_from_request()

    ifc = create_model_interface(json_data)
    STATE.add_model_interface(ifc)
    return ifc.to_json

@APP.route('/run_model_on_dataset', methods=['POST'])
def run_model_on_dataset():
    json_data = _get_json_from_request()

    ds = json_data['dataset']
    m = STATE.model_interfaces[json_data['model']]
    
    new_ds, out_ds = m.run_on_dataset(STATE.datasets[ds])
    
    STATE.update_dataset(name=ds, ds=new_ds)
    return out_ds.to_json()

@APP.route('/update_user', methods=['POST'])
def update_user():

    # parse the received json
    # update the user
    # convert user to json and send

    pass

@APP.route('/attach_encoder', methods=['POST'])
def attach_encoder_to_model():
    json_data = _get_json_from_request()

    if json_data['encoder_type'] == "tf-slim":
        net_type = json_data['net_type']
        slim_path = json_data['slim_path']
        ckpt_path = json_data['ckpt_path']
        conv_layer = json_data['conv_layer']
        vector = json_data['vector']

        fe = feature_extractor.NeuralMonkeyFeatureExtractor(
            net=net_type,
            slim_models=slim_path,
            model_checkpoint=ckpt_path,
            conv_map=conv_layer,
            vector=vector)
        
        model_ifc = STATE.model_interfaces[json_data['model']]
        model_ifc.feature_extractor = fe
        return model_ifc.to_json()
    else:
        raise NotImplementedError("Maybe later")

def _get_json_from_request():
    return request.get_json(force=True)
