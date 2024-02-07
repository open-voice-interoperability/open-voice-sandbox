# General FAQs

## ${\textsf{\color{#3AABFC}What is the purpose of the open-voice-sandbox? }}$
* It is a browser/assistant system for experimentation with OVON Envelopes, which is text and speech based and provides a server to run as localhost to host the browser html/javascript, with a list of OVON Envelope based assistant servers to play with.

## ${\textsf{\color{#3AABFC}What is the purpose of the Open Voice Interoperability Initiative - LF AI and Data Foundation}}$ ${\textsf{\color{#3AABFC}Architecture Work Group and the specification it has developed? }}$
* The purpose of the Open Voice Interoperability Initiative - LF AI & Data Foundation Architecture Work Group is to define a standard format for conversation envelopes, allowing human or automatic agents to interoperate in a conversation. The specification provides a universal JSON structure for conversations, facilitating interoperability among dialog agents, users, and other conversants.

## ${\textsf{\color{#3AABFC}What are the main components of a conversation envelope? }}$
* The conversation envelope consists of five main sections: schema, conversation, sender, response code (optional), and events. The schema specifies the format of the message and validation against the JSON schema. The conversation section contains persistent information related to the current dialog, the sender section includes details of the sender, and the response code section contains a response code if the message is in response to another. The events section is a list of OVON 'events' (invite, utterance, whisper, bye).

## ${\textsf{\color{#3AABFC}What are the supported event types in the conversation envelope? }}$
* The supported event types in the conversation envelope are: utterance, whisper, invite, and bye. Utterance events represent spoken or written natural language interactions, while whisper events are used for inter-agent communication. Invite events are sent to invite another agent to join the conversation, and bye events indicate that an agent is leaving the conversation.

## ${\textsf{\color{#3AABFC}How do I start the sandbox server?}}$
* There are a few ways to start the sandbox server:
    1. On **windows** (double click **`windowsStartup.bat`**) and if on **Mac** (double click **`macStartup.command`**)
        #### OR
    2. Navigate Sandbox directory in a Terminal/Console window and then type this command: **`python sandboxServer.py`**
    #### Then
    1. Double click on **`sbStartup.html`** and it should open a new browser connected to the sandbox server
        #### OR
    2. Open a new browser and type in: **`http://localhost:6003/sbStartup.html`**

## ${\textsf{\color{#3AABFC}What are the prerequisites for building my own assistant server in the OVON Sandbox }}$ ${\textsf{\color{#3AABFC}environment?}}$
* Python 3.10+
* Type the following commands in the command line
    * Flask: `pip3 install flask`
    * Flask_cors: `pip3 install flask-cors`
    * Requests: `pip3 install requests`

## ${\textsf{\color{#3AABFC}Is it possible to use any web browser for text-based interactions with }}$ ${\textsf{\color{#3AABFC}the OVON Sandbox, or are there specific recommendations?}}$
* Text based communication works on Chrome and Edge on Windows and Mac OS, along with Safari.
* Voice based communication works on Chrome and Edge on Windows and Mac OS. We are still working on getting Safari listening for requests correctly.


## ${\textsf{\color{#3AABFC}What are the working assistant examples included in the OVON Sandbox?}}$
* wizard 
    * Says "Ready" when a successful connection is established.
    * Uses an underlying LLM and runs on the web somewhere (asteroute).
* library
    * Accepts an invite and utterance.
    * Mostly helps with topics related to published books
* discovery
    * Runs locally on server when startup happens.
    * When started with bare invite, there is no initial response but is ready to communicate with.
    * Its purpose is to discover the domain that you are interested in/asking about.
    * **NOTE:** It requires an OpenAI key to work (entered on settings page)
* betty/sam 
    * Local python assistants that have very basic functionality
    * These are good for building you own assistant from the code base that we provide. 
* OpenAISam
    * Python based assistant, found in `AssistantServers/openAiSam`
    * Can talk to OpenAISam as long as you want, still working on tracking the history of the conversation.
    * **NOTE:** need to put **OpenAI** key in the OvonIOparser.py found in the `openAiSam` directory.

## ${\textsf{\color{#3AABFC}What are the different directories and files present in the OVON Sandbox root directory?}}$
* Version_1.0/Sandbox [Root]
    * sandboxServer.py [File]
        * the localhost server that supports the browser components
* AssistantServers [Directory]
    * PeteSimplePyAnywhere [Directory] This is a skeleton for a pythonanywhere.com assistant. more
    * localPyAssistant [Directory] This is a python server that will run on your machine (localhost) and makes it easier to debug your experiments with the Envelope. more
    * internalBasic [Directory] This is a simple JavaScript server that will run in the browser making it easy to experiment with the Envelope. more
    * internalServer [Directory] This is a JavaScript server that runs in the browser and supports OpenAI LLMs. more
    * feel free to explore the other assistant files, but it is okay to ignore them for now.
* Browsers [Directory]
    * HTML pages for the browser more
* Scripts [Directory]
    * javascript, css, etc. to support the browser more

## ${\textsf{\color{#3AABFC}How do the conversation envelope and event-types facilitate interoperable participation in a conversation?}}$
* The OVON conversation envelope and event-types, along with the prescribed minimal behaviors for compliant agents and conversation floor managers, facilitate interoperable participation in a conversation by providing a standardized format for conversation representation, allowing for seamless interaction between human and autonomous agents, delegation of control, and support for simultaneous multi-party conversations.

## ${\textsf{\color{#3AABFC}How can I experiment with the OVON Envelope using the OVON Sandbox?}}$
* You can use the log and sequence diagram page to be able to see the OVON envelopes in depth and be able to trace the messages back and forth and the actions used (text, speech, etc)

## ${\textsf{\color{#3AABFC}Can the sandbox server run on different operating systems, or is it specifically designed for a certain OS? }}$
* Right now it is available on Windows and MacOS 