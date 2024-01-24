import json
from datetime import datetime

server_info=""

def generate_response(inputOVON):
    global server_info
    server_info = ""
    event_type = inputOVON["ovon"]["events"][0]["eventType"]
    response_text = "I'm not sure how to respond."

    if event_type == "invite":
        # Handle the invite event
        response_text = "Thanks for the invitation, I am ready to assist!"
        if "parameters" in inputOVON["ovon"]["events"][0] and "to" in inputOVON["ovon"]["events"][0]["parameters"]:
            to_url = inputOVON["ovon"]["events"][0]["parameters"]["to"]["url"]
            server_info = f"Server: {to_url}"
    elif event_type == "utterance":
        # Handle the utterance event
        user_input = inputOVON["ovon"]["events"][0]["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
        if "hello" in user_input.lower():
            response_text = "Hello! How can I assist you today?"

    # elif event_type == "whisper":
    #     # Handle the whisper event
    #     whisper_text = inputOVON["ovon"]["events"][0]["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]

    currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    sender_from = "server"
    if "to" in inputOVON["ovon"]["events"][0]["parameters"]:
        to_url = inputOVON["ovon"]["events"][0]["parameters"]["to"]["url"]
        sender_from = to_url

# /find the one with utterance, make if statemnet
    ovon_response = {
    "ovon": {
            "conversation": inputOVON["ovon"]["conversation"],
            "sender": {"from": sender_from},
            "responseCode": 200,
            "events": [
                {
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
            ]
        }
    }

    ovon_response_json = json.dumps(ovon_response)

    return ovon_response_json