import json
from datetime import datetime
import re
import os
import openai

# Set your assistant's unique speakerID and service address
conversationID = ""
mySpeakerID = ""
myServiceAddress = ""
f = open( "C:/ejDev/3rdParty/OAIK/amphibian.txt")
amphibCode = f.read()
print( "theKey: ", amphibCode )
openai.api_key = amphibCode
initialPrompt = "You are an inquisitive child. Whenever the user mentions something you are curious. You ask logical questions that an eight year old child would."

def promptLLM( inputStr):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-1106",
        messages=[
            {"role": "system", "content": initialPrompt},
            {"role": "user", "content": inputStr}
        ],
        temperature=0.3,
            max_tokens=400,  # Adjust the max_tokens parameter as needed
            n=1,
            stop=None,
            top_p=1.0

    )
    print("Raw LLM response: ", response )
    response_text = response_text.choices[0].message['content'].strip()
    return response_text
    #print("whisper: ",conversation_history)

def setServAddressAndSpeakerID( srvAdd, speakerID ):
    myServiceAddress = srvAdd
    mySpeakerID = speakerID

def exchange(inputOVON):
    i = 0
    eventSet = {"invite":False,"utterance":False,"whisper":False,"bye":False,"unKnown":False}
    utteranceInput = ""
    whisperInput = ""
    conversationID = inputOVON["ovon"]["conversation"]["id"]
    while i < len(inputOVON["ovon"]["events"]):
        oneEvent = inputOVON["ovon"]["events"][i]
        eventType = oneEvent["eventType"]
        eventSet[eventType] = True
        if eventType == "invite":
            inviteEvent = oneEvent
            utteranceInput = "Welcome to my world. How can I help."
        elif eventType == "whisper":
            whisperInput = oneEvent["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
        elif eventType == "utterance":
            utteranceInput = oneEvent["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
        elif eventType == "bye":
            utteranceInput = oneEvent["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
        else:
            eventSet["unKnown"] = True

        i = i+1

    if (eventSet["bye"] and utteranceInput.len==0):
        # set this to your goodbye for a "naked bye"
        utteranceInput = "Nice talking to you. Goodbye."

    return modeResponse( utteranceInput, whisperInput, eventSet["invite"], eventSet["bye"] )

def modeResponse( inputUtterance, inputWhisper, isInvite, isBye ):
    print(promptLLM("describe how to drive a car using 20 words or less."))
    if isInvite:
        if len(inputWhisper)>0:
            responseObj = converse( "", inputWhisper )
            response_text = responseObj["data"]["say"]
        else:
            response_text = "Welcome to my world. How can I help."
    else:
        responseObj = converse( inputUtterance, inputWhisper )
        response_text = responseObj["data"]["say"]

    currentTime = datetime.now().isoformat()
    ovon_response = {
        "ovon": {
            "conversation": {
                "id": conversationID
            },
            "schema": {
                "version": "0.9.0",
                "url": "not_published_yet"
            },            
            "sender": {
                "from": myServiceAddress
            },
            "responseCode" : {
                "code": 200,
                "description": "OK"
              },
            "events": [
                {
                    "eventType": "utterance",
                    "parameters": {
                        "dialogEvent": {
                            "speakerId": mySpeakerID,
                            "span": {
                                "startTime": currentTime
                            },
                            "features": {
                                "text": {
                                    "mimeType": "text/plain",
                                    "tokens": [ { "value": response_text } ]
                                }
                            }
                        }
                    }
                }
            ]
        }
    }
    return json.dumps(ovon_response)

def converse( utt, whisp ):
    say = "I am sorry I don't understand."
    action = "none"
    if len(whisp)>0:
        say = "I got your whisper."
        # Do something with the whisper
        w = whisp

    if len(utt)>0:
        # Do something with the utterance
        greetings=['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
        for greeting in greetings:
            if re.search(rf'\b{greeting}\b', utt, re.IGNORECASE):
                say = "Hello, what do you need?"
                action = "utterance"
        goodbye=['goodbye', 'bye now', 'so long for now', 'i am done', 'i\'m done']
        for bye in goodbye:
            if re.search(rf'\b{bye}\b', utt, re.IGNORECASE):
                say = "Goodbye for now."
                action = "bye"
        goback=['go back to', 'return to']
        for back in goback:
            if re.search(rf'\b{back}\b', utt, re.IGNORECASE):
                say = "Okay, I will send you back."
                action = "return"

    conRespObject = {
        "data": {
            "say": say,
            "whisper": "textToWhisper",  # maybe set on an invite or utt
            "delegate": action   # "invite|bye|utt"  this may be set by the assistant
        }
    }
    return conRespObject

