#  ${\textsf{\color{#3AABFC}open-voice-sandbox}}$ 
*__Note:__ The Sandbox __implements__ the formal [InteropDialogEventSpecs](https://github.com/open-voice-interoperability/docs/tree/main/specifications) in a working environment.*

__A browser/assistant system for experimentation with OVON Envelopes. It is:__
* Text and Speech based
* Provides a server to run as localhost to host the browser html/javascript
* Has a list of OVON Envelope based assistant servers to play with
* Has a skeleton python assistant server that you can use to build assistants

## ${\textsf{\color{#3AABFC}Version 2 Updates}}$
* Added concepts for certain assistants to understand conversation better and for discovery.
* Added floor events to handle delegations/transfers to different assistants.
* Updated Sequence Diagram page quite a bit for better analytics. 
* And more updates to come..

## ${\textsf{\color{#3AABFC}How to get started}}$

### Prerequisites

#### Python 3.x (We are using 3.12 and pythonanywhere.com uses 3.10)

*The following are installed in the command line. Install using pip3*
*Following are ONLY needed if you are building your own assistant server*

* Flask: **`pip3 install flask`**
* Flask_cors: **`pip3 install flask-cors`**
* Requests: **`pip3 install requests`**

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
	
	**`python sandboxServer.py`** 
	#### OR 
* by double clicking the .bat file (for windows) or the .command file (for Mac)

## ${\textsf{\color{#3AABFC}How to run the Browser component}}$
* Double click the **`sbStartup.html`**
	#### OR
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

## ${\textsf{\color{#3AABFC}Directory Structure and Files}}$



* Version_2.0/Sandbox [Root]
	* sandboxServer.py [File]
		* the localhost server that supports the browser components
	* AssistantServers [Directory]
		* PeteSimplePyAnywhere [Directory] This is a skeleton for a pythonanywhere.com assistant. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_2.0/Sandbox/AssistantServers/PeteSimplePyAnywhere/pyAnywhere.md)
		* localPyAssistant [Directory]
		This is a python server that will run on your machine (localhost) and makes it easier to debug your experiments with the __Envelope__. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_2.0/Sandbox/AssistantServers/localPyAssistant/localPyAssistant.md)
		* internalBasic [Directory]
		This is a simple JavaScript server that will run in the browser making it easy to experiment with the __Envelope__. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_2.0/Sandbox/AssistantServers/InternalBasic/InternalBasic.md)
		* internalServer [Directory]
		This is a JavaScript server that runs in the browser and supports OpenAI LLMs. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_2.0/Sandbox/AssistantServers/InternalServer/internalServer.md)
		* feel free to explore the other assistant files, but it is okay to ignore them for now.
	* Browsers [Directory]
		* HTML pages for the browser [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_2.0/Sandbox/Browsers/sbBrowsers.md)
	* Scripts [Directory]
		* javascript, css, etc. to support the browser [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_2.0/Sandbox/Scripts/scripts.md)

## ${\textsf{\color{#3AABFC}FAQs}}$
[Here](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_2.0/Sandbox/FAQs/generalFAQs.md) are some of the FAQs we have come up with, feel free to submit any inquries/questions you may have to our [discussions](https://github.com/open-voice-interoperability/open-voice-sandbox/discussions) page or on our [discord](https://discord.gg/xt3ynbDE)