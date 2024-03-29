# ${\textsf{\color{#3AABFC}internalServer.js}}$

# ${\textsf{\color{#3AABFC}Overview}}$

__A JavaScript implementation of an assistant using the OVON Envlopes:__
* Text and Speech based interactions.

* All the logic for assistant behavior is JavaScript running in the browser environment.

* In the code it has examples of parsing and building __Envelopes__.

* Beyond this it permits the use of your personal OpenAI key to make an LLM based assistant. _Note: You must provide your own key to an OpenAI account. It is only sent to the openAI API and remains in your personal browser localstorage. You can set this keyValue on the "settings" page_.

* The pre-built "Discovery" assistant uses this functionality

# ${\textsf{\color{#3AABFC}Functionality}}$
`callInternalLLM`
* Initiates a call to an interal LLM (Large Language Model) based on provided parameters.
* Handles various events such as invitations, user utterances, and whispers.
* Posts the data to the LLM and processes the response accordingly.

`callThisLLM`
* Initiates a call to a specific LLM instance with the provided message and context.
* Handles events similarly to callInternalLLM, but with a predefined LLM instance.

`callInternalAssistant`
* Invokes a call to an internal assistant, such as the "discovery" assistant.
* Processes different events including invitations and user utterances.
* Utilizes the OVON format for communication.

`initialLLM`
* Initializes an LLM instance with the provided parameters, such as name, model, and temperature.

`sbAddMsg`
* Adds a message to the conversation context, specifying the role (e.g., "assistant" or "user") and the content of the message.

`sbLLMPost`
* Sends data to the LLM via a POST request.
* Handles response data and logs the interaction.

`sbLLMPostResp`
* Handles the response from the LLM POST request.
* Processes the received data and updates the conversation context accordingly.

# ${\textsf{\color{#3AABFC}Important Objects}}$
* `sbLLM_CommObject`: Represents the communication object for interacting with the LLM.
* `aiAssistantPool`: An array containing instances of LLM assistants.
* `retOVONJSON`: Represents the OVON envelope JSON object for communication.
* `LLMLog`: Logs messages exchanged with the LLM for debugging and analysis.
* `matched_concepts`: Contains information about concepts extracted from user utterances.

# ${\textsf{\color{#3AABFC}Usage}}$
* This discovery assistant handles communication with both internal LLMs and external assistants, facilitating smooth interactions between users and the assistant system.
* The functions provided here can be utilized to create custom assistant behaviors and enable a wide range of conversational experiences within web applications.