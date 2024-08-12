# ${\textsf{\color{#3AABFC}benLLM.py}}$

### ${\textsf{\color{#3AABFC}Overview}}$
`benLLM.py` is a Flask-based server script that serves as the main entry point for handling OVON messages. 

The server listens for POST requests, processes incoming OVON messages, and generates responses using the `OvonIOparser` module.

###  ${\textsf{\color{#3AABFC}Prerequisites}}$
Before runnning the script, ensure that `flask_cors` module is installed. You can install it using the following command: `pip install flask_cors`

###  ${\textsf{\color{#3AABFC}Usage}}$
1. Import necessary libraries/modules.
2. Set up Flask application and enable CORS.
3. Define the endpoint `/` to handle requests.
4. Extract OVON message from the request data.
5. Generate a response using the `OvonIOparser` module.
6. Return the OVON response.

###  ${\textsf{\color{#3AABFC}Starting the Server}}$
To start the server, run the following command in your terminal:
``` python benLLM.py ```
This command will launch the Flask server, and it will be accessible at `http://localhost:8243/`

__Notes on starting the server:__ 
* On MS Windows systems you can just double click the winBenLLMLocalPyStartup.bat file. 
* _On Mac you double click the MacBenLLMLocal.command file._

###  ${\textsf{\color{#3AABFC}Notes}}$ 
1. Ensure that you have the OpenAI API key configured
2. Make sure to have `Flask` and `flask_cors` installed before running the script.
3. CORS (Cross-Origin Resource Sharing) is enabled to allow requests from and origin (`*`). Adjust the CORS configuration based on your application's security requirements.

# ${\textsf{\color{#3AABFC}openAiParser.py}}$

###  ${\textsf{\color{#3AABFC}Overview}}$
`OvonIOparser.py` contains functions to parse OVON messages and generate appropriate responses.

It utilizes the the OpenAI GPT4-o model for creating assistant responses based on user input. 

__NOTE:__ Use `pip install openai` to install the library.

###  ${\textsf{\color{#3AABFC}Functions}}$
`configure()`

Configures the OpenAI API key from environment variables.

`search_intent(input_text)`
* Searches for intents within the input text by comparing it with predefined concepts and examples.
* Returns a list of matched intents along with the matched words.

`generate_response(inputOVON, sender_from)`
* Generates a response based on the input OVON message and sender information. 
* Processes different event types, such as invite and utterance, and constructs an appropriate response using the GPT-3.5-turbo model.
* Constructs a response OVON message containing events such as whisper and utterance, reflecting the detected intents and response text.

###  ${\textsf{\color{#3AABFC}Notes}}$
1. Ensure you have a valid OpenAI API key and initialize it in the file.
2. The `SYSTEM_INSTRUCTION` variable provides guidance to the assistant, outlining its behavior and response expectations. Modify it as needed for specific use cases.
