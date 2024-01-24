# The latest working min Server code 20231105
# =================================================
# Note!!!! you will need to install flask_cors
#    open a bash console and do this
#    pip3.10 install --user flask_cors

from flask import Flask
from flask import request
from flask_cors import CORS
from flask_cors import cross_origin
import json

# ========= IMPORT your assistant code here
import simpleAssistant

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
@cross_origin()
def home():
    
    inputOVON = json.loads( request.data )

    return simpleAssistant.exchange(inputOVON)

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=7002, debug=True)
# =================================================
