# PythonAnywhere-hosted Assistant

The PythonAnywhere-hosted assistant consists of two main files: `local.py` and `assistant.py`. This assistant is designed to respond to various events, including invites and user utterances. It demonstrates how to integrate the assistant with a Flask server.

## ${\textsf{\color{#3AABFC}local.py}}$
### Install Dependencies
* Make sure to install the required dependencies by opening a Bash console and running the following command:
``` pip3.10 install --user flask_cors```

### Code Overview
* The Flask server listens for POST requests on the `/` endpoint.
* It imports the assistant module (`assistant.py`) for response generation.
* The `generate_response` function is called to handle incoming OVON messages.

## ${\textsf{\color{#3AABFC}assistant.py}}$
### Code Overview
* The assistant module defines a `generate_response` function that processes OVON events and generates appropriate responses. 
* It recognizes different event types, such as "invite" and "utterance", adapting responses accordingly.
* This particular assistant checks for greetings and specific keywords (e.g., "weather") to provide context-aware responses.


### Customization
* Modify `greetings` and `weather_terms` lists to tailor the assistant's behavior to specific needs. 
* Adapt the response logic based on specific use cases.

## ${\textsf{\color{#3AABFC}Creating your own PythonAnywhere assistant }}$
#### 1. Create a PythonAnywhere account
* If you don't have a PythonAnywhere account, sign up at [PythonAnywhere](https://www.pythonanywhere.com/)
#### 2. Access the PythonAnywhere console
* Log in to  your PythonAnywhere account and navigate to the Dashboard
#### 3. Upload Your Files
* Go to the "Files" tab and upload your assistant files, `local.py` and `assistant.py`
#### 4. Open Bash Console
* Navigate to "Consoles" tab and open a Bash console.
#### 5. Install Dependencies
* In the Bash console, install the necessary dependencies. For example, if you are using Flask and Flask-CORS, run:
```pip3.10 install --user flask flask-cors```
#### 6. Running the Server
* To run the server, press the `>>>Run` button.
* If that doesn't work then press on the circle refresh looking button next to the `>>>Run` button.


