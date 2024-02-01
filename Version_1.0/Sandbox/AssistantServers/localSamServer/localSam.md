# Sam.py

### Overview
`sam.py` is a Flask-based server script that serves as the main entry point for handling OVON messages. 

The server is configured to respond to POST requests, process incoming OVON messages, and generate appropriate responses using the `OvonIOparser` module.

### Prerequisites 
Before runnning the script, ensure that `flask_cors` is installed. You can install it using the following command:
```
pip install flask_cors
```

### Usage 
1. Import necessary libraries/modules.
2. Set up Flask application and enable CORS.
3. Define the endpoint `/` to handle requests.
4. Extract OVON message from the request data.
5. Generate a response using the `OvonIOparser` module.
6. Return the OVON response.

# OvonIOparser.py

### Overview
`OvonIOparser.py` contains functions to parse OVON messages and generate appropriate responses.

It processes events within the OVON message, such as invite and utterance, and formulates responses accordingly.

### Functions 
`generate_response(inputOVON, sender_from)`

Generates a response based on the input OVON message and sender information. It processes different event types, such as invite and utterance, and constructs an appropriate response.