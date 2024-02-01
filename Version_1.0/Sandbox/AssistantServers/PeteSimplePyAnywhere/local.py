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


app = Flask(__name__)
CORS(app)

# ========= INSTANCE your assistant code
# myUniqueAssistant = MyAssistant()

@app.route('/', methods=['POST'])
def home():
    inputOVON = json.loads( request.data )
    print( inputOVON )
    # user_input = inputOVON["ovon"]["events"][1]["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
    # user_input = "hello this is Pete"
    ovon_response = assistant.generate_response(inputOVON)
    return ovon_response

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=8766, debug=True)
# =================================================