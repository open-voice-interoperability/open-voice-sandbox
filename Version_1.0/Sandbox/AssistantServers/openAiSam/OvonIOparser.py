import json
import logging
from datetime import datetime
import openai
import os
from dotenv import load_dotenv

def configure():
    load_dotenv()

# openai.api_key = os.getenv('api_key')

openai.api_key = 'YOUR KEY GOES HERE'

server_info = ""
greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
SYSTEM_INSTRUCTION = ("You are a helpful and knowledgeable assistant. "
    "Try and provide clear and concise responses to user queries less than 100 words. "
    "If uncertain, politely express that you may not have enough information. "
    "Always be respectful and maintain a positive tone. "
    "Assist with a wide range of topics and tasks. "
    "If the user greets you, respond warmly with an introduction and inquire about how you can help. "
    "Your name is Sam"
    "Ensure information accuracy and avoid making assumptions. "
    "Use inclusive and polite language. "
    "If the user provides specific instructions, follow them closely. "
    "If the conversation involves multiple turns, provide context for a better understanding. "
    "Adapt your responses based on the user's tone and preferences. "
    "If necessary, ask clarifying questions to gather more details. "
    "Remember to respect privacy and confidentiality. "
    "Stay attentive to the user's needs and adjust your responses accordingly."
    
)

def generate_response(inputOVON, sender_from):
    configure()
    global server_info
    server_info = ""
    response_text = ""

    for event in inputOVON["ovon"]["events"]:
        event_type = event["eventType"]
        logging.info(f"Processing event type: {event_type}")
        if event_type == "invite":
            # Check if there is a whisper event
            whisper_event = next((e for e in inputOVON["ovon"]["events"] if e["eventType"] == "whisper"), None)

            if whisper_event:
                # Handle the invite with whisper event
                whisper_text = whisper_event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
                response_text = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
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
                if "parameters" in event and "to" in event["parameters"]:
                    to_url = event["parameters"]["to"]["url"]
                    server_info = f"Server: {to_url}"
                    response_text = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
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
                  

        elif event_type == "utterance":
            user_input = event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
            response_text = openai.ChatCompletion.create(
                    model= "gpt-3.5-turbo",  # or use your preferred OpenAI engine
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
