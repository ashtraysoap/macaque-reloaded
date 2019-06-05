import json

from flask import Flask, render_template, request

APP = Flask(__name__)
STATE = None
APP.config['state'] = STATE

def start_server(macaque_state):
    STATE = macaque_state
    APP.run()

@APP.route('/', methods=['GET'])
def init():
    return render_template('index.html')

@APP.route('/add_dataset', methods=['POST'])
def add_dataset():
    json_data = request.get_json(force=True)

    # create dataset from json constructor params
    # register dataset in state
    # convert dataset to json

    return json.dumps(json_data)

@APP.route()
def add_model():

    # create model interface from json received
    # register the model interface in state
    # convert the model ifc to json

    pass

@APP.route()
def run_model_on_dataset():

    # from json received get model and dataset ids
    # run model on dataset
    # convert output dataset to json

    pass

@APP.route()
def update_user():

    # parse the received json
    # update the user
    # convert user to json and send

    pass

@APP.route()
def attach_encoder_to_model():

    # construct a feature extractor from the json
    # attach it to the model
    # convert model to json and return

    pass
