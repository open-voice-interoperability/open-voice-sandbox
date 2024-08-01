## Sandbox JavaScript File Functionality

## ${\textsf{\color{#3AABFC}sbHomepage.js}}$
The `sbHomepage.js` file contains essential functions for Sandbox application's homepage. 

#### Key Functions:
* `sbBrowserType`: Determines the type of browser being used and stores it in `localStorage`.
* `getOS()`: Helper function to identify the operating system.
* `sbStart()`: Initializes the homepage, setting browser and OS information.

#### Browser and OS Detection:
The script detects the browser and operating system types using the user agent string. It utilizes this information to display the browser and OS details on the homepage.

#### Initialization 
The `sbStart()` function sets up the initial state of the homepage, displaying the browser and OS information.

## ${\textsf{\color{#3AABFC}sbAssistantMgr.js}}$
The `sbAssistantMgr.js` file contains functions related to managing and interacting with the assistants in the Sandbox application. 

#### Key Functions: 
* `sbGetParams(someAgentName)`: Returns an object containing information about a specific assistant based on its name.
* `fetchAssistantData()`: Asynchronously fetches data about active assistants from the '../Support/ActiveAssistantList.json' file.


#### Usage:

The script interacts with the HTML page, updating the assistant selection dropdown, handling user input for settings, and updating the server-side data.


## ${\textsf{\color{#3AABFC}sbEnvelopeTools.js}}$
The `sbEnvelopTools.js` file includes functions related to starting a conversation and managing the envelope structure for communication with the assistant in the Sandbox application.
#### Key Functions:
#### `sbConversationStart()`:
* Initiates a conversation, sets up the initial envelope, and handles different scenarios based on user actions.
* Checks if the bare invite or invite with whisper is selected.
* Builds the conversation sequence diagram.
* Posts the initial message to the assistant.

`sendReply()` 
* Facilitates communication between the user and the assistant by sending replies to user inputs.
* Processes user messages, including utterances and whispers, and forwards them to the appropriate assistant based on the conversation context.
* Depending on the presence of whispers and specific directives, it delegates messages to designated assistants or responds directly to user queries.


`sbFloorEvents()` 
* Responsible for processing floor directives and managing the transition of control between different assistants.

Delegations
* Delegation occurs when an assistant delegates the handling of a particular task or message to another assistant.
* Involves redirecting the conversation flow to a designated assistant to handle specific requests or inquiries.
* Delegation directives are typically identified within the floor events and are executed accordingly to ensure seamless delegation of tasks.

#### Envelope Tools Functions:
* `baseEnvelopeOVON(someAssistant, isReceived = false)`: Builds the base OVON envelope with conversation ID, sender information, and response code.
* `bareInviteOVON(baseEnvelope, someAssistant)`: Adds an invite event to the OVON envelope for a bare invite.
* `bareByeOVON(someAssistant)`: Builds an OVON envelope with a bye event.
* `buildUtteranceOVON(speaker, utteranceStr)`: Builds an OVON envelope with an utterance event.
* `buildWhisperOVON(speaker, whisperStr)`: Builds an OVON envelope with a whisper event.

#### Usage:
The script handles the initiation of conversations, manages the envelope structure, and provides tools for interacting with the assistant. It also includes functions for handling user inputs, settings, and saving conversation logs.

## ${\textsf{\color{#3AABFC}sbHttpComm.js}}$
The `sbHttpComm.js` files contains functions related to HTTP communication, including sending resquests to an assistant's server and handling the responses.

#### Key Functions:

* `sbPostToAssistant(assistantObject, OVONmsg)`: Sends the OVON message to the assistant's server.
  * Handles different types of assistants (internal, internalLLM, internal basic).
  * Uses XMLHttpRequest to send POST requests.
  * Logs sent messages in the UI and conversation log.


#### Usage:

The script is responsible for handling HTTP communication with the assistant's server. It send requests, processes responses, and logs the conversation in the UI. Additionally, it provides functions for reading and writing files in the Sandbox directory.

# ${\textsf{\color{#3AABFC}sbFloor.js}}$
The `sbFloor.js` file manages the conversational floor for an assistant application. It is responsible for handling user inputs, processing directives related to assistant delegation and floor transitions, and ensuring seamless interaction between different assistants. The script determines the appropriate action based on detected concepts and intents, and either processes the input directly or delegates it to another assistant.

#### Key Functions:

* `handleInput(message, whisper, isText, isWhisper)`

    * **Description**: Processes user input and decides whether to handle it on the floor or delegate it.
    * **Parameters**:
      - `message` (string): User's message.
      - `whisper` (string): Whisper message, if any.
      - `isText` (boolean): Indicates if the input is text.
      - `isWhisper` (boolean): Indicates if the input is a whisper.

* `processFloorEvents(conceptJSON)`

  - **Description**: Processes detected concepts and sets floor directives.
  - **Parameters**:
    - `conceptJSON` (object): JSON object with detected concepts and intents.

* `sbFloorEvents(floorDirectives, message, whisper, isText, isWhisper)`

  - **Description**: Executes floor directives and manages the transition between different assistants.
  - **Parameters**:
    - `floorDirectives` (object): Directives to be executed.
    - `message` (string): User's message.
    - `whisper` (string): Whisper message, if any.
    - `isText` (boolean): Indicates if the input is text.
    - `isWhisper` (boolean): Indicates if the input is a whisper.

#### Usage:

The `sbFloor.js` script is used to manage interactions within the assistant application. It processes user inputs, detects concepts, and determines whether to handle the input on the floor or delegate it to another assistant. By managing floor events and handling directives like redirects and manifests, it ensures a smooth conversational experience and effective assistant delegation. This script integrates with the broader assistant framework to facilitate seamless communication and task management.

## ${\textsf{\color{#3AABFC}sbCreateAssistant.js}}$
The functions in this file are part of an assistant creation system. They handle the creation of new assistants, directory creation, and content generation based on the assistant type based on the type of assistant the user select.

#### `createAssistant()`:
This asynchronous function creates a new assistant based on the values entered in a form. It performs the following steps:

1. Fetches the existing assistant list from '../Support/ActiveAssistantList.json'.
2. Checks if the entered assistant name already exists.
3. Creates an assistant object with the entered values.
4. Creates an assistant directory using `createAssistantDirectory()`.
5. Sends a POST request to update the assistant list with the new assistant.
6. Displays an alert with the response message.

#### Usage: 
Whether dealing with Python, JavaScript, or Language Model (LLM) assistants, the file offers a cohesive and efficient environment for managing diverse assistant types. It serves as a cornerstone, providing a comprehensive solution for the dynamic creation and integration of assistants within the system.


## ${\textsf{\color{#3AABFC}sbSpeech.js}}$
The `sbSpeech.js` file manages speech-related functionalities, including Automatic Speech Recognition (ASR) and Text-to-Speech (TTS) for assistant interactions.

#### `sbStartASR()`:
* Initiates ASR (Automatic Speech Recognition) by capturing user speech input.
* Triggers the browser's speech recognition and processes the recognized speech.
* Invokes `sendReply()` or `sbPostToLLM()` based on system configuration.

`handleInput(message, whisper, isText, isWhisper)`:
* Responsible for managing the user input received through ASR or other input methods.
* It first identifies any concepts or keywords within the input message that may trigger specific actions or directives.
* Based on the identified concepts, it determines whether the input requires further processing, such as delegation or direct response.

#### `sbSpeak(say, assistantObject)`:

* Utilizes the browser's Text-to-Speech engine to convert text (`say`) into spoken words.
* Takes an `assistantObject` parameter to customize voice properties such as pitch and volume.
* Manages the sequence of events after TTS completion.

#### **ASR Handling**

* ASR (Automatic Speech Recognition) is handled by `recognition.onresult` event.
* Detected speech is processed, cleaned, and sent for further actions.

#### **TTS Handling**

* TTS (Text-to-Speech) is managed through the `sbSpeak()` function.
* Voice properties and post-TTS events are configured using `assistantObject`.

#### Processing Floor Events:
* Floor events, encapsulated within the `processFloorEvents()` function, are pivotal in determining the course of action based on detected concepts.
* These events define redirections, such as returning to a previous assistant or delegating tasks to another assistant.
* Floor events serve as directives for the assistant to either handle the input directly or delegate it to another assistant.
#### Processing Other Events:
* Additional events beyond floor events are processed using the processOtherEvents() function.
* These events encompass various actions or tasks triggered by the user input or system requirements.
* The processing involves analyzing the nature of the events, such as invitations or farewells, and preparing appropriate responses or actions.

#### Hand-in-Hand with Floor Events and Delegations:
* When user input is received, handleInput() evaluates concepts to identify any floor events or specific directives.
* If floor events are detected, such as delegation requests, handleInput() collaborates with processFloorEvents() to determine the appropriate action.
* Based on the outcome of floor event processing, handleInput() decides whether to directly handle the input or delegate it to another assistant.
* Delegations are seamlessly integrated into the flow, allowing for smooth handoffs between assistants based on predefined criteria or user requests.

## ${\textsf{\color{#3AABFC}humanProxyOVON.js}}$
The `sbTable.js` file defines several classes used for managing communication and data structures in the assistant framework. It includes classes for handling participants and managing message queues. These classes facilitate sending OVON messages, handling responses, and maintaining the state of message queues.

#### Key Classes:
* `participant`

  - **Description**: Represents a participant in the assistant system. It manages sending OVON messages to different types of assistants and handling responses.

  - **Key Methods**:
    - `sendOVON(OVONmsg)`: Sends an OVON message to the designated assistant. Depending on the assistant type, it either calls internal functions or sends the message via an HTTP request.
    - `callbackOVON()`: Handles the response from an OVON message, processes the returned data, and invokes the `handleReturnedOVON` function.

* `ejQueue2`

  - **Description**: A simple queue implementation that uses an object to store items. It supports enqueueing, dequeueing, peeking at the front item, and printing the current queue.

  - **Key Methods**:
    - `enqueue(item)`: Adds an item to the end of the queue.
    - `dequeue()`: Removes and returns the item at the front of the queue.
    - `peek()`: Returns the item at the front of the queue without removing it.
    - `printQueue`: Returns the current state of the queue.

* `ejQueue`

  - **Description**: A standard queue implementation using an array. It supports basic queue operations such as enqueueing, dequeueing, peeking, and checking if the queue is empty.

  - **Key Methods**:
    - `enqueue(element)`: Adds an element to the end of the queue.
    - `dequeue()`: Removes and returns the element at the front of the queue. Returns `null` if the queue is empty.
    - `peek()`: Returns the element at the front of the queue without removing it. Returns `null` if the queue is empty.
    - `isEmpty()`: Checks if the queue is empty. Returns `true` if the queue is empty.

#### Usage:

The `sbTable.js` script is used to handle communication and message management within the assistant system. The `participant` class facilitates sending and receiving OVON messages, while `ejQueue` and `ejQueue2` provide different implementations for managing message queues. These classes are integral for maintaining the flow of conversation and managing interactions between different assistants and the user.

- **`participant`** is used for managing interactions with various assistants, handling different types of requests, and processing responses.
- **`ejQueue2`** and **`ejQueue`** are utilized for managing message queues, ensuring that messages are processed in a first-in, first-out manner.

These components help ensure effective communication and data management within the assistant framework.

## ${\textsf{\color{#3AABFC}sbLogs.js}}$
The `sbLogs.js` file is responsible for managing and displaying conversation logs in the browser. 

#### Filtering Logs
* Retrieves available log files from the server and populates the dropdown.
* Saves the entire conversation as a text file.
* Manages the last selected log files.

#### Usage: 
* `sbLogs.js` is central to Sandbox's log management, initializing and displaying conversation logs. 
* It enables users to interact with a dropdown for log file selection, apply filters for 'all', 'sent', or 'received' logs, and dynamically displays log content. 
* Additionally, it facilitates file handling, including saving conversation logs, tracking last selected files, and fetching OVON logs for a comprehensive log viewing experience.

## ${\textsf{\color{#3AABFC}sbLLM.js}}$
#### Overview:
`sbLLM.js` manages interactions with the OpenAI language model (LLM) in the Sandbox application.

#### Key Functions:
* **`sbLLMStartASR()`**: Initiates Automatic Speech Recognition (ASR) for LLM.
* **`sbInitialLLMPrompt(input)`**: Initializes the LLM conversation with user input.
* **`sbPostToLLM(input)`**: Sends user input to LLM, handles communication, and updates conversation logs.

### Core Components:
* **HTTP Communication**: Utilizes XMLHttpRequest to interact with the OpenAI API.
* **Conversation Handling**: Manages conversation turns, builds role-specific content, and updates logs.
* **Response Processing**: Parses LLM responses, updates UI, and logs received messages.


### Integration:
- Coordinates with other Sandbox modules for a seamless assistant interaction experience.
- Supports dynamic conversation flow and real-time updates.

## ${\textsf{\color{#3AABFC}sbSeqDiag.js}}$

`sbSeqDiag.js` manages the creation, visualization, and interaction with sequence diagrams in the Sandbox application.

#### Key Functions:
* **`buildSeqDiagJSON(from, to, shortM, longM, changeColor)`**: Constructs the sequence diagram JSON object.

* **`sbLoadSeq()`**: Loads and renders the sequence diagram based on the stored JSON data.

#### Key Components:
* **Sequence Diagram Structure**: Utilizes D3.js for rendering SVG elements representing agents, messages, and interactions.
* **Tooltip Interaction**: Implements tooltips for providing additional information on diagram elements.
* **File Handling**: Supports saving, fetching, and displaying sequence diagrams from/to local storage and files.

#### Integration:
- Integrates with other Sandbox modules to provide a comprehensive environment for managing and visualizing conversation sequences.
- Supports dynamic updates and real-time interaction with sequence diagrams.

## ${\textsf{\color{#3AABFC}sbVoices.js}}$
`sbVoice.js` manages the Text-to-Speech (TTS) voice selection and settings in the Sandbox application.

#### Core Components:
* Voice Selection Dropdown: Dynamically populates and updates a `<select>` HTML element for TTS voice selection.
* Speech Parameters: Allows adjustment of volume, rate, and pitch parameters for TTS.
*Voice Info Display: Displays information about the selected TTS voice, including last selected voices.
#### Usage:
* Load TTS voices using loadVoiceSelect() during initialization.
* Adjust TTS voice settings using the dropdown and parameter sliders.
* Save TTS voice index and test text with `saveTTSVoiceIndex()` and `saveTTS_TestText()`.
* Update voice settings for the selected assistant using updateVoiceSettings().
#### Integration:
* Integrates with other Sandbox modules to provide a unified interface for TTS voice control.
* Utilizes the Web Speech API for TTS functionality.
* Supports real-time updates and interactions with TTS voices and settings.