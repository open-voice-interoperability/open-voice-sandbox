# The latest working min Server code 20231105
# =================================================
# Note!!!! you will need to install flask_cors
#    open a bash console and do this
#    pip3.10 install --user flask_cors

from flask import Flask
from flask import request
from flask_cors import CORS
import json
import assistant

# ========= IMPORT your assistant code here

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/', methods=['POST'])
def home():
    inputOVON = json.loads( request.data )

    host = request.host.split(":")[0]
    sender_from = f"https://{host}"
    print(f"Input OVON: {inputOVON}")
    print(f"Sender from: {sender_from}")
    ovon_response = assistant.generate_response(inputOVON, sender_from)

    return ovon_response