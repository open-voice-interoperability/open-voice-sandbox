# ${\textsf{\color{#3AABFC}Overview}}$

This module provides a comprehensive implementation of an assistant using OpenAI's API, with functionality for intent detection, manifest searching, and response generation. The assistant can handle various events such as invitations, user utterances, and manifest requests, utilizing both internal logic and external LLMs.

## Requirements
- `json` 
- `datetime`
- `openai`
- `local.SYSTEM_INSTRUCTION`

## Setup

The OpenAI API key must be set for the assistant to function properly. The key is stored in the variable `openai.api_key`.

```python
openai.api_key = 'your_openai_api_key'
```
# ${\textsf{\color{#3AABFC}Functions}}$

`search_intent(input_text)`

Searches for intents in the provided input text by matching against predefined concepts.

1. Load Concepts:
    * Reads `intentConcepts.json` to load predefined concepts.
2. Match Intents: 
    * Iterates through concepts and matches words in the input text with examples in the concepts.
3. Return Matched Intents:
    * Returns a list of matched intents if found, otherwise returns `None`.

`searchManifest(input_text, ask_for_descriptions=False)`

Searches for matching assistants in the manifest based on the provided input text.

1. Load Manifest:
    * Reads `manifest.json` to load assistant information.
2. Match Assistants: 
    * Iterates through assistants and matches keyphrases in the assistants' capabilities.
3. Return Matched Assistants and/or Descriptions:
    * Returns a list of matched assistants or a dictionary of descriptions based on the `ask_for_descriptions` flag. 

`generate_response(inputOVON, sender_from)`
Generates a response based on the provided OVON input and sender information. Handles different event types such as invite, requestManifest, and utterance.


1. Initialize Variables:
    * Initializes response text, detected intents, keyword detection, and flag for manifest requests.

2. Process Events:
    * Iterates through events in the input OVON and handles different event types (invite, requestManifest, utterance, whisper).

3. Handle Invite Event:
   * Searches for intents and keywords in the whisper text if available, and prepares a response.

4. Handle Request Manifest Event:
    * Prepares a manifest response and sets the flag to include manifest request.

5. Handle Utterance Event:
    * Searches for intents and keywords in the user input, generates a response using OpenAI, and includes assistant names and descriptions if requested.

6. Generate OVON Response:
    * Constructs the OVON response with conversation details, sender information, response code, and events.

7. Return Response:
    * Returns the generated OVON response in JSON format.