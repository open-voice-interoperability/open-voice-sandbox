# ${\textsf{\color{#3AABFC}Sam.py}}$

### ${\textsf{\color{#3AABFC}Overview}}$
`sam.py` is a Flask-based server that serves as a main entry point for handling OVON messages. 

The server is configured to respond to POST requests, process incoming OVON messages, and generate appropriate responses using the `OvonIOparser` module.

### ${\textsf{\color{#3AABFC}Prerequisites}}$
Before runnning the script, ensure that `flask_cors` is installed. You can install it using the following command: `pip install flask_cors`

### ${\textsf{\color{#3AABFC}Usage}}$
1. Import necessary libraries/modules.
2. Set up Flask application and enable CORS.
3. Define the endpoint `/` to handle requests.
4. Extract OVON message from the request data.
5. Generate a response using the `OvonIOparser` module.
6. Return the OVON response.

# ${\textsf{\color{#3AABFC}OvonIOparser.py}}$

### ${\textsf{\color{#3AABFC}Overview}}$
`OvonIOparser.py` contains functions to parse OVON messages and generate appropriate responses.

It processes events within the OVON message, such as invite and utterance, and formulates responses accordingly.

### ${\textsf{\color{#3AABFC}Functions}}$
`search_intent(input_text)`
* Searches for intents within the input text by comparing it with predefined concepts and examples.
* Returns a list of matched intents along with the matched words.

`generate_response(inputOVON, sender_from)`
* Generates a response based on the input OVON message and sender information. 
* Processes different event types, such as invite and utterance, and constructs an appropriate response.
* Constructs a response OVON message containing events such as whisper and utterance, reflecting the detected intents and response text.