import json
import logging
from datetime import datetime

server_info = ""
greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
weather_terms = ["weather", "forecast", "temperature", "rain", "sun", "clouds", "wind"]


def generate_response(inputOVON):
    global server_info
    server_info = ""
    response_text = "I'm not sure how to respond."

    for event in inputOVON["ovon"]["events"]:
        event_type = event["eventType"]
        logging.info(f"Processing event type: {event_type}")
        if event_type == "invite":
            # Check if there is a whisper event
            whisper_event = next((e for e in inputOVON["ovon"]["events"] if e["eventType"] == "whisper"), None)

            if whisper_event:
                # Handle the invite with whisper event
                whisper_text = whisper_event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
                if any(greeting in whisper_text.lower() for greeting in greetings):
                    response_text = "Hello! How can I assist you today?"
                elif any(weather in whisper_text.lower() for weather in weather_terms):
                    # Set the target URL to the assistant you want to send the message to
                    response_text = "Sure, let me check the weather for you."
            else:
                # Handle the bare invite event
                if "parameters" in event and "to" in event["parameters"]:
                    to_url = event["parameters"]["to"]["url"]
                    server_info = f"Server: {to_url}"
                    response_text = "Thanks for the invitation, I am ready to assist."

        elif event_type == "utterance":
            user_input = event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
            if any(greeting in user_input.lower() for greeting in greetings):
                response_text = "Hello! How can I assist you today?"
            elif any(weather in user_input.lower() for weather in weather_terms):
                response_text = "Sure, let me check the weather for you."

    currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    sender_from = "https://lrb24.pythonanywhere.com"
    if "to" in inputOVON["ovon"]["events"][0]["parameters"]:
        to_url = inputOVON["ovon"]["events"][0]["parameters"]["to"]["url"]
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
