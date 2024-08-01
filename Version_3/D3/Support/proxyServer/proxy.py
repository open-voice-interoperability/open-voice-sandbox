#simple proxy server

import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import socket #just to test awful hack for latency

app = Flask(__name__)
CORS(app)

#just to test awful hack for latency
def do_nothing(*args):
    return None

@app.route('/', methods=['POST'])
def home():
    entryTime = datetime.datetime.now()
    target_url = 'http://localhost:15455/ejCassandra'
    #target_url = 'http://localhost:8242/'

    ovonStr = request.data
    inputOVON = json.loads( ovonStr )
    sendTo = inputOVON["ovon"]["sender"]["to"]
    print( "Extracted sendTo url: ", sendTo)
    print( "Full OVON: ", ovonStr)

    if len(sendTo) > 0:
        #response = requests.post( sendTo, json=ovonStr )

        #just to test awful hack for latency
        socket.gethostbyaddr = do_nothing
        socket.gethostbyname = do_nothing

        response = requests.post( target_url, json=ovonStr )
        print( "returned response", response.text)
  
    exitTime = datetime.datetime.now()
    delta = exitTime - entryTime
    print ( "Time in Proxy (ms)", int(delta.total_seconds() * 1000))

    return response.text

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=6006, threaded=True)