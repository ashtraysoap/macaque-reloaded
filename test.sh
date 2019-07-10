#!/bin/bash

PYTHONPATH=$PATH:$PYTHONPATH pytest -W ignore tests/
