#!/bin/sh

ls -la /usr/src/app
netstat -ant

cd /usr/src/app
python app.py
