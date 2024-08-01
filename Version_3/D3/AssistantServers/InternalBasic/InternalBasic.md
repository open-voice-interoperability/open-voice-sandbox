# ${\textsf{\color{#3AABFC}Basic JavaScript Assistant}}$

The Basic JavaScript Assistant is a simple implementation designed to provide a foundational understanding of assistant functionality within the OVON framework.

# ${\textsf{\color{#3AABFC}Overview}}$
This javaScript assistant includes the following features:
* Handling invitation events
* Responding to whisper events
* Processing utterance events

# ${\textsf{\color{#3AABFC}Objects and Handling}}$
1. `assistantObject`
    * `assistantObject` contains comprehensive information about the assistant, including the assistants name, authCode, serviceAddress, markerColor, etc...

2. `OVONmsg`
    * `OVONmsg` is a JSON-structured envelope sent by the user to the assistant. It contains all the content of the envelope and primarily looks at the events in order to respond accordingly.
    
## Function `callBasicAssistant`
The `callBasicAssistant` function processes the assistant's response based  on the events received from user.

## Handling Events
The assistant responds differently depending on the events present in the OVON message.
- ### Invite Event
    * Reponds with hardcoded message for invitations with or without whisper.
    * If utterance event is present, responds with a separate utterance message.
- ### Utterance event
    * Response with a message acknowledging the utterance.

# ${\textsf{\color{#3AABFC}Notes}}$
* Ensure that the `assistantObject` and `OVONmsg` are correctly structured before calling the 'callBasicAssistant' function.
* This assistant provides a template for handling common OVON events but may require additional customization for specific use cases.
* No need to do anything to start assistant, if main server is running then this assistant will be available for use.