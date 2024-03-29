import json
from datetime import datetime
import re

# Set your assistant's unique speakerID and service address
conversationID = ""
mySpeakerID = "Madison_1763IRQ"
myServiceAddress = "localhost:7002"

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

    return modeResponse( utteranceInput, whisperInput, eventSet["invite"] )

def modeResponse( inputUtterance, inputWhisper, isInvite ):
    if isInvite:
        if len(inputWhisper)>0:
            responseObj = converse( "", inputWhisper )
            response_text = responseObj.converse.say
        else:
            response_text = "Welcome to my world. How can I help."
    else:
        responseObj = converse( inputUtterance, inputWhisper )
        response_text = responseObj.converse.say

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
            "responseCode": 200,
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
        "converse": {
            "say": say,
            "whisper": "textToWhisper",  # maybe set on an invite or utt
            "delegate": action   # "invite|bye|utt"  this may be set by the assistant
        }
    }
    return conRespObject
