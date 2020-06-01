#!/bin/bash

cd backend/
PYTHONPATH=`pwd`:`pwd`/../:$PATH:$PYTHONPATH 
python3 -m pytest -W ignore ../tests/
