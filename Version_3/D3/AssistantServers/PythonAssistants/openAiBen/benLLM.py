# The latest working min Server code 20231105
# =================================================
# Note!!!! you will need to install flask_cors
#    open a bash console and do this
#    pip3.10 install --user flask_cors

from flask import Flask
from flask import request
from flask_cors import CORS
import json
import datetime
import os
import sys 

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..','..'))
sys.path.append(project_root)
# ========= IMPORT your assistant code here
# from MyAssistantPackage import *

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

port = 8243

def read_system_instruction(file_path):
    with open(file_path, 'r') as file:
        return file.read()

@app.route('/', methods=['POST'])
def home():
    from AssistantServers.PythonAssistants.openAiParser import generate_response

    inputOVON = json.loads( request.data )
    entryTime = datetime.datetime.now()
    host = request.host.split(":")[0]
    port = request.host.split(":")[1] if ":" in request.host else 'None'

    sender_from = f"http://{host}:{port}/"
    SYSTEM_INSTRUCTION = read_system_instruction('prompt.txt')
    ovon_response = generate_response(inputOVON, sender_from, SYSTEM_INSTRUCTION)
    exitTime = datetime.datetime.now()
    delta = exitTime - entryTime
    print ( "Time in Proxy (ms)", int(delta.total_seconds() * 1000))
    return ovon_response

if __name__ == '__main__':
    app.run(host="localhost",port=port, debug=True)
# =================================================