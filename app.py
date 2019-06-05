from flask_server import start_server

from macaque_state import MacaqueState

def main():
    # do stuff before
    # process cmd args
    # load models
    # other stuff
    state = MacaqueState()
    start_server(state)

if __name__ == "__main__":
    main()