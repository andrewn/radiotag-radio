#!/usr/bin/env python

# To install:
#   sudo pip install gevent Flask

import gevent
import gevent.monkey
from gevent.pywsgi import WSGIServer
gevent.monkey.patch_all()

from flask import Flask, request, redirect, jsonify, Response, render_template

import os
app_root = os.path.abspath(".")
port = os.getenv('PORT', 4000)

import json

import pifacecad

listener = pifacecad.SwitchEventListener()
lcd = pifacecad.LCD()

app = Flask(__name__)

@app.route('/')
def root():
  return redirect('/static/index.html')

@app.route('/buttons/<int:num>', methods=['POST'])
def set_button(num):
  listener.events[num](num)
  return redirect('/')

@app.route('/text')
def text():
  return jsonify(lines=lcd.lines)

http_server = WSGIServer(('127.0.0.1', port), app)
print "Started on port " + str(port)
print "Web interface at: http://localhost:" + str(port) + "/static/index.html"
# http_server.serve_forever()
http_server.start()
