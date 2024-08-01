from flask import Flask
from flask import request
from flask_cors import CORS
import json
import assistant
import datetime

# ========= IMPORT your assistant code here
# from MyAssistantPackage import *

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
port = 8222

def read_system_instruction(file_path):
    with open(file_path, 'r') as file:
        return file.read()


SYSTEM_INSTRUCTION = read_system_instruction('prompt.txt')
print(SYSTEM_INSTRUCTION)

@app.route('/', methods=['POST'])
def home():
    entryTime = datetime.datetime.now()
    inputOVON = json.loads( request.data )

    host = request.host.split(":")[0]
    port = request.host.split(":")[1] if ":" in request.host else 'None'
    sender_from = f"http://{host}:{port}/"
    ovon_response = assistant.generate_response(inputOVON, sender_from)
  
    exitTime = datetime.datetime.now()
    delta = exitTime - entryTime
    print ( "Time in Proxy (ms)", int(delta.total_seconds() * 1000))

    return ovon_response

if __name__ == '__main__':
    app.run(host="localhost",port=port, debug=True)
# =================================================