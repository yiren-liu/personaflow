#!/bin/bash
gunicorn -k uvicorn.workers.UvicornH11Worker --workers 9 main:app --bind 0.0.0.0:8321 --access-logfile - --error-logfile - --capture-output --timeout 120