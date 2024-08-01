import json
from datetime import datetime
import openai

openai.api_key = 'put-api-key'

greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]

def search_intent(input_text):
    with open('../../../Support/intentConcepts.json', 'r') as f:
        concepts_data = json.load(f)
    
    matched_intents = []
    for concept in concepts_data["concepts"]:
        matched_words = [word for word in concept["examples"] if word in input_text.lower()]
        if matched_words:
            matched_intents.append({"intent": concept["name"], "matched_words": matched_words})
    return matched_intents if matched_intents else None


server_info = ""

def generate_response(inputOVON, sender_from, SYSTEM_INSTRUCTION):
    print(inputOVON)
    global server_info
    server_info = ""
    response_text = ""
    detected_intents = []
    include_manifest_request = False

    for event in inputOVON["ovon"]["events"]:
        event_type = event["eventType"]
        if event_type == "invite":
            # Check if there is a whisper event
            whisper_event = next((e for e in inputOVON["ovon"]["events"] if e["eventType"] == "whisper"), None)
            if whisper_event:
                # Handle the invite with whisper event
                whisper_text = whisper_event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
                detected_intents.extend(search_intent(whisper_text) or [])
                response_text = openai.ChatCompletion.create(
                        model="gpt-4-turbo",
                        messages=[
                            {
                                "role": "system",
                                "content": SYSTEM_INSTRUCTION,
                            },
                            {
                                "role": "assistant",
                                "content": "hello",
                            },
                        ],
                        max_tokens=400,  # Adjust the max_tokens parameter as needed
                        n=1,
                        stop=None,
                        temperature=1.0,
                        top_p=1.0,
                    )
                response_text = response_text.choices[0].message['content'].strip()

            else:
                # Handle the bare invite event
                if event_type == "invite":
                    to_url = event.get('sender', {}).get('to', 'Unknown')
                    server_info = f"Server: {to_url}"
                    response_text = openai.ChatCompletion.create(
                        model="gpt-4-turbo",
                        messages=[
                            {
                                "role": "system",
                                "content": SYSTEM_INSTRUCTION,
                            },
                            {
                                "role": "assistant",
                                "content": "Thanks for the invitation, I am ready to assist.",
                            },
                            
                        ],
                        max_tokens=400,  # Adjust the max_tokens parameter as needed
                        n=1,
                        stop=None,
                        temperature=1.0,
                        top_p=1.0,
                    )
                    response_text = response_text.choices[0].message['content'].strip()
                  
        elif event_type == "requestManifest":
                to_url = event.get("sender", {}).get("to", "Unknown")
                server_info = f"Server: {to_url}"
                response_text = "Thanks for asking, here is my manifest."
                include_manifest_request = True

        elif event_type == "utterance":
            user_input = event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
            detected_intents.extend(search_intent(user_input) or [])
            response_text = openai.ChatCompletion.create(
                    model= "gpt-4-turbo",  # or use your preferred OpenAI engine
                   messages=[
                       {
                           "role": "system",
                           "content": SYSTEM_INSTRUCTION,
                       },
                       {
                           "role": "user",
                           "content": user_input,
                       },
                       
                   ],
                    max_tokens=400,  # Adjust the max_tokens parameter as needed
                    n=1,
                    stop=None,
                    temperature=1.0,
                    top_p=1.0,
                )
        
            answer = response_text.choices[0].message['content'].strip()
            response_text =  answer

    currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sender_to = ""
    to_url = "Human"

    if "to" in inputOVON["ovon"]["sender"]:
        from_url = inputOVON["ovon"]["sender"]["to"]
        to_url = inputOVON["ovon"]["sender"]["from"]
        sender_to = to_url
        sender_from = from_url

    ovon_response = {
        "ovon": {
            "conversation": inputOVON["ovon"]["conversation"],
            "schema": {
                "version": "0.9.0",
                "url": "not_published_yet"
            },
            "sender": {"from": sender_from
                      
                       },
            "events": []
        }
    }

    if include_manifest_request:
        manifestRequestEvent = {
            "eventType": "publishManifest",
            "parameters": {
                "manifest" : {
                    "identification":
                    {
                        "serviceEndpoint": "http://localhost:8243/",
                        "organization": "Sandbox_LFAI",
                        "conversationalName": "Ben",
                        "serviceName": "Python OpenAI",
                        "role": "OpenAI assistant",
                        "synopsis" : "I know a little about a lot but cant help with personal life ."
                    },               
                    "capabilities": [
                        {
                            "keyphrases": [
                                "openAI",
                                "semi-smart"
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
