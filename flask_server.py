from flask import Flask, render_template

def start_server():
    APP.run()

APP = Flask(__name__)

@APP.route('/', methods=['GET'])
def root():
    return render_template('root.html')
