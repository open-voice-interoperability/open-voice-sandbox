#  ${\textsf{\color{#3AABFC}open-voice-sandbox}}$ 
*__Note:__ The Sandbox __implements__ the formal [InteropDialogEventSpecs](https://github.com/open-voice-interoperability/docs/tree/main/specifications) in a working environment.*

__A browser/assistant system for experimentation with OVON Envelopes. It is:__
* Text and Speech based
* Provides a server to run as localhost to host the browser html/javascript
* Has a list of OVON Envelope based assistant servers to play with
* Has a skeleton python assistant server that you can use to build assistants

## ${\textsf{\color{#3AABFC}Version 3 Updates (Use THIS Version - Latest)}}$
__If you want a VERY QUICK Start, then do the following:__
* After cloning the repository navigate to the Version_3/D3 directory in your file explorer.
* Start up the local sandbox server (it *requires* Python):
	* For Windows: double-click **windowsStartup.command**
	* For Mac: double-click **macStartup.bat**
* *Open* up a MS Edge browser.
	* (NOTE: The sandbox __does__ work with the Chrome browser, __BUT__ there are fewer and lower quality TTS voices available. This will be an issue if you are experimenting with several different assistants.)
* *Enter* the URL: [localhost:6002](http://localhost:6002/sbStartup.html)
* You should see a diagram of the sandbox.
* *Enter* the name you want to be addressed by (e.g. Sarah).
* *Click* the **Start Sandbox** button.
* *Click* on the __Select an Assistant__ dropdown and select __Wizard__.
* *Click* the **Bare Invite** button.
* This will open the __Conversation__ page.
	* You will see __Assistant: Wizard__
	* The Wizard will say: __This is the Wizard Agent. Ask me anything.__
	* To *say* something to the Wizard either:
		* *Click* the blue __microphone__ icon and speak, *or*
		* *Type* text in the __Utterance__ box (& press enter)
	* Below are the __OVON__ messages that were __SENT__ and __RECIEVED__.
	* __NOTE:__ The Wizard is a single question/response assistant, it __does not__ maintain context.
* Other NON-LLM Assistants are:
	* Smart Library - an expert on published books
	* Jonathan - a pythonAnywhere example (dumb, only greets)
	* PetePyAnywhere - a pythonAnywhere example (code in the sandbox under AssistantServers/PythonAssistants)
	* Sam - runs on a local python server (simple but you can modify the python)
		* you must start it in directory: Version_3\D3\AssistantServers\PythonAssistants\localSamServer

* If you want to experiment with your own __LLM based Assistants__ (requires an __OpenAI key__ ) then look [here](https://github.com/open-voice-interoperability/open-voice-sandbox/tree/main/Version_3/D3/AssistantServers/LLMPool/newLLMBot.md).
	* __NOTE:__ *Click* the __Settings__ button and paste your __OpenAI key__ in the field OpenAI. It is stored in the browser and will be use for all subsequent LLM activities.
* Also, if you have an __OpenAI key__ you will have access to several other assistants on the __Select an Assistant__ dropdown.
	* Cassandra - a Personal assistant who can transfer to:
		* Pat - If you want to buy some flowers (for you mom's birthday?)
		* Sukanya - To order from the Thai Palace (carryout lunch?)
		* Andrew - Your local postoffice (price to mail ???)
		* Charles - Your local hardware store (chainsaw repaired?)
		* Fred - Your local pharmacy 
	* Carlos - maitre d of the El Fish restraunt in Manhattan
	* Tennis - an expert on all things Tennis 
	* Sandy - can answer questions about the "SandBox" (But only trust the docs, Sandy gets creative.)

* Read the sections below and the other MD files in other directories for further information.

## ${\textsf{\color{#3AABFC}Version 2 Updates}}$
* Added concepts for certain assistants to understand conversation better and for discovery.
* Added floor events to handle delegations/transfers to different assistants.
* Updated Sequence Diagram page quite a bit for better analytics. 
* Added a place to put company/organization logos found [here](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/Media/img/yourLogo)

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
* In the Navigation bar enter: __http://localhost:6002__
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
		* PeteSimplePyAnywhere [Directory] This is a skeleton for a pythonanywhere.com assistant. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/AssistantServers/PeteSimplePyAnywhere/pyAnywhere.md)
		* localPyAssistant [Directory]
		This is a python server that will run on your machine (localhost) and makes it easier to debug your experiments with the __Envelope__. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/AssistantServers/localPyAssistant/localPyAssistant.md)
		* internalBasic [Directory]
		This is a simple JavaScript server that will run in the browser making it easy to experiment with the __Envelope__. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/AssistantServers/InternalBasic/InternalBasic.md)
		* internalServer [Directory]
		This is a JavaScript server that runs in the browser and supports OpenAI LLMs. [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/AssistantServers/InternalServer/internalServer.md)
		* feel free to explore the other assistant files, but it is okay to ignore them for now.
	* Browsers [Directory]
		* HTML pages for the browser [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/Browsers/sbBrowsers.md)
	* Scripts [Directory]
		* javascript, css, etc. to support the browser [more](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/Scripts/scripts.md)

## ${\textsf{\color{#3AABFC}Credits}}$
* Emmett Coin - _Architect & Senior Developer_
* Leah Barnes - _Junior Developer_

## ${\textsf{\color{#3AABFC}FAQs}}$
[Here](https://github.com/open-voice-interoperability/open-voice-sandbox/blob/main/Version_3/D3/FAQs/generalFAQs.md) are some of the FAQs we have come up with, feel free to submit any inquries/questions you may have to our [discussions](https://github.com/open-voice-interoperability/open-voice-sandbox/discussions) page or on our [discord](https://discord.gg/xt3ynbDE)