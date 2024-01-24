from http.server import BaseHTTPRequestHandler, HTTPServer

from flask import Flask
from flask import request
from flask_cors import CORS
import json
assistantPort = 7001

# ========= IMPORT your assistant code here
# from MyAssistantPackage import *

app = Flask(__name__)
CORS(app)

# ========= INSTANCE your assistant code
# myUniqueAssistant = MyAssistant()

@app.route('/', methods=['POST'])
def home():
    inputOVON = json.loads( request.data )
    print( inputOVON )
    
# ========= This is where the brains of the bot are invoked for one turn
# ========= CALL your assistant code
#  response_data = myUniqueAssistant.exchange( inputOVON )
# =========
 
# ========= The following is just so works without any assistant code
    response_data = "I did return this thing 20231105!"
    
    return response_data
    
if __name__ == '__main__':
    app.run(host="0.0.0.0",port=assistantPort, debug=True)
