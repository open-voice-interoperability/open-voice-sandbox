import json
from datetime import datetime

def search_intent(input_text):
    with open('../../Support/intentConcepts.json', 'r') as f:
        concepts_data = json.load(f)
    
    matched_intents = []
    for concept in concepts_data["concepts"]:
        matched_words = [word for word in concept["examples"] if word in input_text.lower()]
        if matched_words:
            matched_intents.append({"intent": concept["name"], "matched_words": matched_words})
    return matched_intents if matched_intents else None

server_info = ""

def generate_response(inputOVON, sender_from):
    global server_info
    global conversation_history
    server_info = ""
    response_text = "I'm not sure how to respond."
    detected_intents = []

    for event in inputOVON["ovon"]["events"]:
        event_type = event["eventType"]
        if event_type == "invite":
            # Check if there is a whisper event
            utt_event = next((e for e in inputOVON["ovon"]["events"] if e["eventType"] == "whisper"), None)

            if utt_event:
                # Handle the invite with whisper event
                whisper_text = utt_event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
                detected_intents.extend(search_intent(whisper_text) or [])
                if detected_intents:
                    response_text = "Hello! How can I assist you today?"
                    
            else:
                # Handle the bare invite event
                print(event_type)
                if event_type == "invite":
                    to_url = event.get("sender", {}).get("to", "Unknown")
                    server_info = f"Server: {to_url}"
                    response_text = "Thanks for the invitation, I am ready to assist."

        elif event_type == "utterance":
            user_input = event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
            detected_intents.extend(search_intent(user_input) or [])
            response_text = "Hello! How can I assist you today?"

    currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if "to" in inputOVON["ovon"]["sender"]["to"]:
        to_url = inputOVON["ovon"]["sneder"]["url"]
        sender_from = to_url

    # /find the one with utterance, make if statement
    ovon_response = {
        "ovon": {
            "conversation": inputOVON["ovon"]["conversation"],
            "schema": {
                "version": "0.9.0",
                "url": "not_published_yet"
            },
            "sender": {"from": sender_from},
            "responseCode": {
                "code": 200,
                "description": "OK",
            },
            "events": []
        }
    }
    
    # Construct a single whisper event containing all intents
    whisper_event = {
        "eventType": "whisper",
        "parameters": {
            "concepts": [
                {
                    "concept": intent_info["intent"],
                    "matchedWords": intent_info["matched_words"]
                }
                for intent_info in detected_intents
            ]
        }
    }
    ovon_response["ovon"]["events"].append(whisper_event)

    utterance_event = {
        "eventType": "utterance",
        "parameters": {
            "dialogEvent": {
                "speakerId": "assistant",
                "span": {
                    "startTime": currentTime
                },
                "features": {
                    "text": {
                        "mimeType": "text/plain",
                        "tokens": [{"value": response_text}]
                    }
                }
            }
        }
    }
    ovon_response["ovon"]["events"].append(utterance_event)

    ovon_response_json = json.dumps(ovon_response)

    return ovon_response_json
