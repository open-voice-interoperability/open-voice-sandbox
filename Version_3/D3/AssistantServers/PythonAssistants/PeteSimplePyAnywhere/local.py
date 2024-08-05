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
CORS(app, resources={r"/*": {"origins": "*"}})
port = 8766

@app.route('/', methods=['POST'])
def home():
    inputOVON = json.loads( request.data )

    host = request.host.split(":")[0]
    sender_from = f"http://{host}"
    ovon_response = assistant.generate_response(inputOVON, sender_from)

    return ovon_response

if __name__ == '__main__':
    app.run(host="localhost",port=port, debug=True, use_reloader=False)