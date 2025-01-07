import json
from datetime import datetime
import os
import weather_api # importing weather_api.py file -- GET API key and put on line 90 --> https://openweathermap.org/api
import re

conversation_state = {}

def extract_location(input_text):
    location_match = re.search(r"(in|for|at) (.+)", input_text, re.IGNORECASE)
    if location_match:
        return location_match.group(2)
    else:
        return None
    
def search_intent(input_text):
    my_dir = os.path.dirname(__file__)
    json_file_path = os.path.join(my_dir, 'intentConcepts.json')
    with open(json_file_path, 'r') as f:
        concepts_data = json.load(f)

    matched_intents = []
    input_text_lower = input_text.lower()

    if "weather" in input_text_lower or "forecast" in input_text_lower:
        location = extract_location(input_text_lower)
        if location:
            matched_intents.append({"intent": "weather", "location": location})
        else:
            matched_intents.append({"intent": "weather", "location": "unknown"})
    for concept in concepts_data["concepts"]:
        matched_words = [word for word in concept["examples"] if word in input_text.lower()]
        if matched_words:
            matched_intents.append({"intent": concept["name"], "matched_words": matched_words})
    return matched_intents if matched_intents else None

def celsius_to_fahrenheit(celsius):
    return (celsius * 9/5) + 32

server_info = ""

def generate_response(inputOVON, sender_from):
    global server_info
    global conversation_history
    server_info = ""
    response_text = "I'm not sure how to respond."
    detected_intents = []
    include_manifest_request = False

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
        elif event_type == "requestManifest":
                to_url = event.get("sender", {}).get("to", "Unknown")
                server_info = f"Server: {to_url}"
                response_text = "Thanks for asking, here is my manifest."
                include_manifest_request = True

        elif event_type == "utterance":
            user_input = event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
            detected_intents.extend(search_intent(user_input) or [])
            print(f"Detected intents: {detected_intents}")
            conversation_id = inputOVON["ovon"]["conversation"]["id"]

            if conversation_id not in conversation_state:
                conversation_state[conversation_id] = {}

            for intent in detected_intents:
                if intent["intent"] == "weather":
                    location = extract_location(user_input)
                    if location:
                        print(f"Extracted location: {location}")
                        api_key = "PUT YOUR API KEY HERE" # GET API key here --> https://openweathermap.org/api
                        weather_data = weather_api.get_weather(api_key, location)
                        temp, humidity, weather_report = weather_api.parse_weather_data(weather_data)
                        conversation_state[conversation_id]["temp_in_celsius"] = temp
                        response_text = f"Weather in {location}: {weather_report}, Temperature: {temp}°C, Humidity: {humidity}%"
                        print(f"Generated weather response: {response_text}")
                    else:
                        response_text = "Could you please specify a location?"
                elif intent["intent"] == "convertTemperature":
                    if "temp_in_celsius" in conversation_state[conversation_id]:
                        temp_in_fahrenheit = celsius_to_fahrenheit(conversation_state[conversation_id]["temp_in_celsius"])
                        response_text = f"The temperature in Fahrenheit is {temp_in_fahrenheit}°F."
                    else:
                        response_text = "I don't have a temperature to convert. Please ask for the weather first."
                else:
                    response_text = "Hello! How can I assist you today?"

    currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # /find the one with utterance, make if statement
    ovon_response = {
        "ovon": {
            "conversation": inputOVON["ovon"]["conversation"],
            "schema": {
                "version": "0.9.0",
                "url": "not_published_yet"
            },
            "sender": {"from": sender_from},
            "events": []
        }
    }

    # Construct a single whisper event containing all intents
    if detected_intents:
        whisper_event = {
            "eventType": "whisper",
            "parameters": {
                "concepts": [
                    {
                        "concept": intent_info["intent"],
                        "matchedWords": intent_info["matched_words"]
                    }
                    for intent_info in detected_intents if "matched_words" in intent_info
                ]
            }
        }
        ovon_response["ovon"]["events"].append(whisper_event)

    if include_manifest_request:
        manifestRequestEvent = {
            "eventType": "publishManifest",
            "parameters": {
                "manifest" : {
                    "identification":
                    {
                        "serviceEndpoint": "http://lrb24.pythonanywhere.com",
                        "organization": "Sandbox_LFAI",
                        "conversationalName": "Pete",
                        "serviceName": "Python Anywhere",
                        "role": "Basic assistant",
                        "synopsis" : "I am a pretty dumb assistant."
                    },
                    "capabilities": [
                        {
                            "keyphrases": [
                                "dumb",
                                "basic",
                                "lazy"
                            ],
                            "languages": [
                                "en-us"
                            ],
                            "descriptions": [
                                "just some test code to test manifest messages",
                                "simple minded unit test code"
                            ],
                            "supportedLayers": [
                                "text"
                            ]
                        }
                    ]
                }
            }
        }
        ovon_response["ovon"]["events"].append(manifestRequestEvent)

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