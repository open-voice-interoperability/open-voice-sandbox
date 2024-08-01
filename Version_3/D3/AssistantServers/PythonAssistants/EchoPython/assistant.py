import json
from datetime import datetime
import openai
from local import SYSTEM_INSTRUCTION

openai.api_key = 'put-api-here'


descriptions = []
def search_intent(input_text):
    with open('../../../Support/intentConcepts.json', 'r') as f:
        concepts_data = json.load(f)
    
    matched_intents = []
    for concept in concepts_data["concepts"]:
        if concept["name"] == "assistantDescription":
            descriptions.extend(concept.get("examples", []))
        matched_words = [word for word in concept["examples"] if word in input_text.lower()]
        if matched_words:
            matched_intents.append({"intent": concept["name"], "matched_words": matched_words})
    return matched_intents if matched_intents else None

def searchManifest(input_text, ask_for_descriptions=False):
    with open('../../../Support/manifest.json', 'r') as f:
        manifestData = json.load(f)

    matched = []
    descriptions = {}
    for assistant in manifestData["assistants"]:
        name = assistant["identification"]["conversationalName"]
        description = assistant["capabilities"].get("descriptions") or "No description available"
        descriptions[name] = description 

        matched_words = [word for word in assistant["capabilities"]["keyphrases"] if word.lower() in input_text.lower()]        
        if matched_words:
            matched.append({
                "conversationalName": assistant["identification"]["conversationalName"],
                "assistantEndpoint": assistant["identification"]["serviceEndpoint"], 
                "keyphrases": matched_words})
    if ask_for_descriptions:
        return descriptions
    else:
        return matched if matched else None
    

server_info = ""

def generate_response(inputOVON, sender_from):
    global server_info
    global conversation_history
    server_info = ""
    response_text = "I'm not sure how to respond."
    detected_intents = []
    keywordDetection = []
    include_manifest_request = False 

    for event in inputOVON["ovon"]["events"]:
        event_type = event["eventType"]
        if event_type == "invite":
            # Check if there is a whisper event
            utt_event = next((e for e in inputOVON["ovon"]["events"] if e["eventType"] == "whisper"), None)

            if utt_event:
                # Handle the invite with whisper event
                whisper_text = utt_event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
                keywordDetection.extend(searchManifest(whisper_text) or [])
                detected_intents.extend(search_intent(whisper_text) or [])
                response_text = "Your response for whisper goes here."  # Replace with your response for whisper events
            else:
                response_text = "Thank you for the invite, I am ready to assist!."  # Replace with your response for bare invite events

        elif event_type == "requestManifest":
                to_url = event.get("sender", {}).get("to", "Unknown")
                server_info = f"Server: {to_url}"
                response_text = "Thanks for asking, here is my manifest."
                include_manifest_request = True 

        elif event_type == "utterance":
            user_input = event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
            keywordDetection.extend(searchManifest(user_input) or [])
            detected_intents.extend(search_intent(user_input) or [])
            response_text = openai.ChatCompletion.create(
                model="gpt-4o",  # or use your preferred OpenAI engine
                messages=[
                    {"role": "system", "content": SYSTEM_INSTRUCTION},
                    {"role": "user", "content": user_input},
                ],
                max_tokens=400,  # Adjust the max_tokens parameter as needed
                n=1,
                stop=None,
                temperature=1.0,
                top_p=1.0,
            )
            response_text = response_text.choices[0].message['content'].strip()

            if keywordDetection:
                for keywords in keywordDetection:
                    for keyword in keywords['keyphrases']:
                        if f"{keyword.lower()} assistant" in user_input.lower():
                            assistant_names = ", ".join(assistant["conversationalName"] for assistant in keywordDetection)
                            response_text = f"Here are the names of the {keyword} assistants: {assistant_names}"
                            break  # Exit the loop after finding the first matching keyword
                    else:
                        continue  # Continue to the next set of keywords if no match found
                    break 
            for description in descriptions:
                if description in user_input.lower():
                    assistant_descriptions = searchManifest(user_input, ask_for_descriptions=True)
                    if assistant_descriptions:
                        response_text = "Sure! Here are the descriptions of the available assistants:\n"
                        for assistant, description in assistant_descriptions.items():
                            response_text += f"- {assistant}: {description}\n"
                    else:
                        response_text = "No assistant descriptions available."
                    break  


    currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if "to" in inputOVON["ovon"]["sender"]:
        from_url = inputOVON["ovon"]["sender"]["to"]
        to_url = inputOVON["ovon"]["sender"]["from"]
        sender_to = to_url
        sender_from = from_url


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
    if include_manifest_request:
        manifestRequestEvent = {
            "eventType": "publishManifest",
            "parameters": {
                "manifest" : {
                    "identification":
                    {
                        "serviceEndpoint": "http://localhost:8222/",
                        "organization": "Sandbox_LFAI",
                        "conversationalName": "Echo",
                        "serviceName": "Python Discovery",
                        "role": "Reads manifest and detects keywords",
                        "synopsis" : "I am a dumb assistant that sends a reads dumb manifest."
                    },               
                    "capabilities": [
                        {
                            "keyphrases": [
                                "manifest",
                                "what do you do",
                                "can you help me"
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
            ],
            "keywordDetection": [
                {
                    "assistantName": keywords["conversationalName"],
                    "assistantEndpoint": keywords["assistantEndpoint"],
                    "matchedWords": keywords["keyphrases"]
                }
                for keywords in keywordDetection
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
