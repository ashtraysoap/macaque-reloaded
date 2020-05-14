#!/usr/bin/env python3

"""The application entrypoint.
"""

import fire

def main(port=5000, public=False):
    """The application entrypoint
    
    Args:
        port: The port number on which the application will listen.
        public: Optional argument, if specified the application will
            listen on all public IPs. Otherwise, it runs only locally.
    """

    from flask_server import start_server
    from macaque_state import MacaqueState

    state = MacaqueState(public=public)
    start_server(macaque_state=state, port=port, public=public)

if __name__ == "__main__":
    fire.Fire(main)
