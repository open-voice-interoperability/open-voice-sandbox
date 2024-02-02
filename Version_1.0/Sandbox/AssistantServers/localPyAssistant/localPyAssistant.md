# basicLocal.py

### Overview
`sam.py` is a Flask-based server script that serves as the main entry point for handling OVON messages. 

The server listens for POST requests, processes incoming OVON messages, and generates responses using the `simpleAssistant` module.

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
5. Generate a response using the `simpleAssistant` module.
6. Return the OVON response.

### Starting the Server
To start the server, run the following command in your terminal:
``` python basicLocal.py ```
This command will launch the Flask server, and it will be accessible at `http://localhost:7005/`

__Note:__ On MS Windows systems you can just double click the winBasicLocalPyStartup.bat file.

### Notes 
1. Make sure to have `Flask` and `flask_cors` installed before running the script.
2. CORS (Cross-Origin Resource Sharing) is enabled to allow requests from and origin (`*`). Adjust the CORS configuration based on your application's security requirements.

# simpleAssistant.py

### Overview
`simpleAssistant.py` contains functions to parse OVON messages and generate appropriate responses.

It uses simple word spotting to implement functionality. (See openAiSam for more sophisticated interaction using an LLM)

### Functions 
`exchange( inputEvelope )`

This is the top function that accepts an __Envelope__ and returns and __Envelope__.
