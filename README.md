# open-voice-sandbox

__A browser/assistant system for experimentation with OVON Envelopes. It is:__
* Text and Speech based
* Provides a server to run as localhost to host the browser html/javascript
* Has a list of OVON Envelope based assistant servers to play with
* Has a skeleton python assistant server that you can use to build assistants

## How to get started

### Prerequisites

#### Python 3.x (We are using 3.12 and pythonanywhere.com uses 3.10)

*The following are installed in the command line. Install using pip3*
*Following are ONLY needed if you are building your own assistant server*

* Flask: **pip3 install flask**
* Flask_cors: **pip3 install flask-cors**
* Requests: **pip3 install requests**

#### A modern web browser (any will work for text only)
*BUT for the full advanced speech system you should use MS Edge*

*Chrome will work too __BUT__ you will be offered fewer TTS voices*

* Notes on the Edge Web Browser
	* The Edge browser is a Chromium base browser
	* Importantly Edge provides a wide range of quality TTS voices
	* Also Edge provides high quality Speech Recognition
	* Only Chrome and Edge provide usable ASR (currently)

### Installation
*  _Clone_ Repository on local machine
*  _Navigate_ to project directory in a _console_/cmd window
*  _Start_ the sandbox server by running this command:
	**python sandboxServer.py** (Or the windows bat or Mac sh files)

## How to run the Browser component
* Open you web browser
* In the Navigation bar enter: __http://localhost:6003__
* You will see a page titled __OVON SandBox Homepage__
* Enter your __first__ name (may be used by assistants to address you)
* Press the __"Start Sandbox"__ button

*There are several working assistants that use the OVON Envelope. They were developed by members of our group as experimental examples.*
* Some of the assistants:
	* __wizard:__ Says "Ready" when you start
		* When you type an __input__ it will respond to a question
		* You can continue as long as you like
		* It uses and underlying LLM
		* It runs somewhere on the web
	* __library:__
		* It accepts an _invite_ and an _utterance_
		* Once it responds you can speak/type some input
		* It can tell you things about published books
		* It runs somewhere on the web
	* __discovery:__
		* When started (with a bare invite) it just waits for input
		* It's purpose is to discover the domain that you are interested in
		* You might say something like "I want to know about kites."
		* It runs locally in JavaScript
        * __NOTE:__ It requires an OpenAI key to work (entered on settings page)
	* __betty:__
		* A local python based assistant
		* It only responds to things like "hello" and "goodbye" (see the code)
		* You can build any sort of assistant you want on this model

*After you pressed the __"Start Sandbox"__ button you will land on the __Sandbox-Home__ page.*

*After you select an Assistant _click_ on __Bare Invite__ button*

* This will take you to the __Sandbox - Conversation__ page
* It will send the initial OVON Envelope __invite__ to the Assistant
* You will see the __SENT/RECEIVED__ *OVON* envelopes
* You will see the extracted text __Response__
* You may type in the __Utterance__ box to send an "utterance"
* (remember to end with the *enter* key)
* You can also *click* the microphone icon and speak

## Directory Structure and Files

* Version_1.0/Sandbox [Root]
	* sandboxServer.py [File]
		* the localhost server that supports the browser components
	* AssistantServers [Directory]
		* baseGenericAssistantServer.py is a skeleton for a pythonanywhere.com assistant
		* later we will provide information on how to set up a pythonanywhere account (free) and host your own assistant
		* ignore the other files for now
	* Browsers [Directory]
		* HTML pages for the browser
	* Scripts [Directory]
		* javascript, css, etc. to support the browser