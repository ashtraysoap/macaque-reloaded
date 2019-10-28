#!/usr/bin/env python3

"""The application entrypoint.
"""

from flask_server import start_server

from macaque_state import MacaqueState

def main():
    """The application entrypoint"""

    # do stuff before
    # process cmd args
    # load models
    # other stuff
    state = MacaqueState()
    start_server(state)

if __name__ == "__main__":
    main()