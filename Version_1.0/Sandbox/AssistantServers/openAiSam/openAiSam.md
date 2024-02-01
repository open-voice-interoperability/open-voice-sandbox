# Sam.py

### Overview
`sam.py` is a Flask-based server script that serves as the main entry point for handling OVON messages. 

The server listens for POST requests, processes incoming OVON messages, and generates responses using the `OvonIOparser` module.

### Prerequisites 
Before runnning the script, ensure that `flask_cors` module is installed. You can install it using the following command:
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

### Starting the Server
To start the server, run the following command in your terminal:
``` python sam.py ```
This command will launch the Flask server, and it will be accessible at `http://localhost:8243/`

### Notes 
1. Ensure that you have the OpenAI API key configured
2. Make sure to have `Flask` and `flask_cors` installed before running the script.
3. CORS (Cross-Origin Resource Sharing) is enabled to allow requests from and origin (`*`). Adjust the CORS configuration based on your application's security requirements.

# OvonIOparser.py

### Overview
`OvonIOparser.py` contains functions to parse OVON messages and generate appropriate responses.

It utilizes the the OpenAI GPT-3.5-turbo model for creating assistant responses based on user input.

### Functions 
`configure()`

Configures the OpenAI API key from environment variables.

`generate_response(inputOVON, sender_from)`

Generates a response based on the input OVON message and sender information. It processes different event types, such as invite and utterance, and constructs an appropriate response using the GPT-3.5-turbo model.

### Notes
1. Ensure you have a valid OpenAI API key and initialize it in the file.
2. The `SYSTEM_INSTRUCTION` variable provides guidance to the assistant, outlining its behavior and response expectations. Modify it as needed for specific use cases.
