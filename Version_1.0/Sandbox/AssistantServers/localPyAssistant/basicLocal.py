# The latest working min Server code 20231105
# =================================================
# Note!!!! you will need to install flask_cors
#    open a bash console and do this
#    pip3.10 install --user flask_cors

from flask import Flask
from flask import request
from flask_cors import CORS
import json

# ========= IMPORT your assistant code here
from simpleAssistant import *

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
portNum = 7005  # Set the port number you want
print( "Localhost Python Assistant Port: ", portNum )

srvAdd = "localhost:" + str(portNum)
setServAddressAndSpeakerID( srvAdd, "Betty_1763IRQ" )

@app.route('/', methods=['POST'])
def home():
    inputOVON = json.loads( request.data )
    print( inputOVON )

    ovon_response = exchange(inputOVON)
    return ovon_response

if __name__ == '__main__':
    app.run(host="localhost",port=portNum, debug=True)
# =================================================