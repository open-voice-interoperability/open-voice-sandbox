async function createAssistant() {
    try {
        // Get form values
        var assistantName = document.getElementById("assistantName").value;
        var assistantID = document.getElementById("assistantID").value;
        var voiceIndex = document.getElementById("voiceIndex").value;
        var lightColor = document.getElementById("lightColor").value;
        var markerColor = document.getElementById("markerColor").value;
        var serviceName = document.getElementById("serviceName").value;
        var serviceAddress = document.getElementById("serviceAddress").value;
        var authCode = document.getElementById("authCode").value;
        var contentType = document.getElementById("contentType").value;
        var assistantType = document.getElementById("assistantType").value;
        // Fetch the existing assistant list
        const response = await fetch('../Support/ActiveAssistantList.json');
        const existingList = await response.json();
        // Check if the assistant name already exists
        if (assistantNameExists(existingList, assistantName)) {
            alert('Assistant name already exists. Please choose a different name.');
            return;
        }
        // Create assistant object
        var newAssistant = {
            "name": assistantName,
            "id": assistantID,
            "voiceIndex": voiceIndex,
            "lightColor": lightColor,
            "markerColor": markerColor,
            "serviceName": serviceName,
            "serviceAddress": serviceAddress,
            "authCode": authCode,
            "contentType": contentType
        };
        // Create assistant directory
        createAssistantDirectory(assistantName, assistantType);
        // Make the POST request only if the name doesn't exist
        const postResponse = await fetch('../Support/ActiveAssistantList.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newAssistant),
        });
        const postData = await postResponse.json();
        alert(postData.message);
    } catch (error) {
        console.error('Error creating assistant:', error);
        alert('Failed to create assistant. Please try again.');
    }
}
function assistantNameExists(assistantList, name) {
    return assistantList.some(item => item.assistant.name === name);
}
function toggleCreateAssistantForm() {
    var assistantType = document.getElementById("assistantType");
    var createAssistantForm = document.getElementById("createAssistantForm");
    var serviceAddressInput = document.getElementById("serviceAddress");
    var openaiKeyInput = document.getElementById("openaiKeyDiv"); // New line
    var openAIKey = document.getElementById("OpenAI"); // New line
    if (assistantType.value === "python") {
        createAssistantForm.style.display = "block";
        serviceAddressInput.value = "http://localhost:port/";
        openaiKeyInput.style.display = "none"; // Hide OpenAI Key field
    } else if (assistantType.value === "js") {
        createAssistantForm.style.display = "block";
        serviceAddressInput.value = "internal:basic";
        serviceAddressInput.placeholder = "";
        openaiKeyInput.style.display = "none"; // Hide OpenAI Key field
    } else if (assistantType.value === "llm") {
        createAssistantForm.style.display = "block";
        serviceAddressInput.value = "internalLLM:discovery";
        openaiKeyInput.style.display = "inline"; // Show OpenAI Key field
        openAIKey.value = localStorage.getItem("OpenAIKey");
    } else {
        createAssistantForm.style.display = "none";
        openaiKeyInput.style.display = "none"; // Hide OpenAI Key field
    }
}
function createAssistantDirectory(assistantName, assistantType) {
    var localContent = "";
    var assistantContent = "";
    if (assistantType === "python"){
        localContent = `
# The latest working min Server code 20231105# =================================================
# Note!!!! you will need to install flask_cors
#    open a bash console and do this
#    pip3.10 install --user flask_cors
  
from flask import Flask
from flask import request
from flask_cors import CORS
import json
import assistant
  
# ========= IMPORT your assistant code here
# from MyAssistantPackage import *
  
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
  
#################
port = 0000 # CHANGE THIS TO AN AVAILABLE PORT
#################
  
@app.route('/', methods=['POST'])
def home():
    inputOVON = json.loads( request.data )
  
    host = request.host.split(":")[0]
    port = request.host.split(":")[1] if ":" in request.host else 'None'
  
    sender_from = f"http://{host}:{port}/"
    ovon_response = assistant.generate_response(inputOVON, sender_from)
    return ovon_response
  
if __name__ == '__main__':
    app.run(host="localhost",port=port, debug=True)
# =================================================
`;
    
        // Create assistant.py file
        assistantContent = `
import json
import logging
from datetime import datetime
    
server_info = ""
greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    
def generate_response(inputOVON, sender_from):
    global server_info
    global conversation_history
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
    
            else:
                # Handle the bare invite event
                  if "parameters" in event and "to" in event["parameters"]:
                    to_url = event["parameters"]["to"]["url"]
                    server_info = f"Server: {to_url}"
                    response_text = "Thanks for the invitation, I am ready to assist."
    
        elif event_type == "utterance":
            user_input = event["parameters"]["dialogEvent"]["features"]["text"]["tokens"][0]["value"]
            if "hello" in user_input.lower():
                response_text = "Hello! How can I assist you today?"
    
    
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
  
`;
fetch(`../Sandbox/AssistantServers/${assistantName}Assistant`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    assistantType: assistantType,
    localContent: localContent,
    assistantContent: assistantContent,
    }),
})
.then(response => {
    if (!response.ok) {
        throw new Error(`Failed to create directory: ${response.statusText}`);
    }
    return response.json();
})
.then(data => {
    console.log(data.message);
})
.catch(error => {
    console.error('Error creating directory:', error);
    alert('Failed to create directory. Please try again.');
});
}else if (assistantType === "js"){
    localContent = `
var invite = false;
var bye = false;
var utterance = false;
var whisper = false;
var utteranceText = "";
var whisperText = "";
var humanName = "Human";
function callBasicAssistant( assistName, assistantObject, OVONmsg ){
    retOVONJSON = baseEnvelopeOVON( assistantObject );
        //findEvents( OVONmsg.ovon.events );
        var eventsJSON = eventSummary( OVONmsg.ovon.events );
        if( eventsJSON.invite ){
            if (eventsJSON.whisperText !== "") {
                // Hardcoded response for invite with whisper
                const responseText = "Hi there! Thanks for the invite with whisper.";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            } else {
                // Hardcoded response for invite without whisper
                const responseText = "Hello! Thanks for the invite! How can I assist you today?";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            }
            if( eventsJSON.utterance ){
                const responseText = "Hello! Thanks for the utterance";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            }
        }else{
            if( eventsJSON.utterance ){
                const responseText = "Hello! Thanks for the utterance.....";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            }else{
                ovonUtt = buildUtteranceOVON( assistName, "You must invite the assistant first." );
                retOVONJSON.ovon.events.push(ovonUtt);         
            }
        }
    return;
}
`;
    fetch(`../Sandbox/AssistantServers/${assistantName}Assistant`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            assistantType: assistantType,
            jsContent: localContent,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to create directory: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
    })
    .catch(error => {
        console.error('Error creating directory:', error);
        alert('Failed to create directory. Please try again.');
    });
}else if (assistantType === "llm"){
    localContent = `
// branch to a JavaScript based server in here
var invite = false;
var bye = false;
var utterance = false;
var whisper = false;
var utteranceText = "";
var whisperText = "";
var humanName = "Human";
var sbLLM_CommObject;
var LLMLog = [];
var sendInternalJSON;
var aiCallType = "https://api.openai.com/v1/chat/completions";
var aiModel = "gpt-3.5-turbo-1106";
var startPrompt = "You are an assistant that will help the human user discover the domain expertise required by the human to complete their task. You will accept a phrase or sentence as a starting point and ask questions that help focus on the general expertise that is needed to help the human. Your responses will be friendly and conversational. You will try to keep your responses to less than 40 words .Your questions for clarification can and should be leading and suggestive enough to prompt the user to give clearer answers. The result of this conversation will be a single word or short phrase that identifies the domain expertise for the assistant they require.  This conversation should be no longer than two or three turns. You will return the resulting domain in the form *Domain = [the domain that you discovered with this conversation]";
var turnLLM = 0;
var aiAssistantPool = [];
var veronicaPrompt = "You are a serious expert on the superman comic book and movie genre. You will limit your comments to 5o words or less.";

//localStorage.setItem( "internalLLM_veronica", veronicaPrompt);
    
function callInternalLLM( assistName, assistantObject, OVONmsg ){
    var aPoolMember = null;
    temp = parseFloat( localStorage.getItem( "AITemp" ) );
    retOVONJSON = baseEnvelopeOVON( assistantObject );
    for (const x in aiAssistantPool) {
        if( x.name === assistName ){ // find the assistant data
            aPoolMember = x;
        }
    }
    if( aPoolMember === null ){ // not found so build it
        aPoolMember = initialLLM( assistName, aiModel, veronicaPrompt, 0.5 );
        aiAssistantPool.push( aPoolMember );
    }
    findEvents( OVONmsg.ovon.events );
    if( !aPoolMember.invited && invite ){
        aPoolMember.invited = true;
        if( utterance ){
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", utteranceText ) );
        }else{
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", "Hello" ) );
        }
    }else{
        if( utterance ){
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", utteranceText ) );
        }else if( whisper ){
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", whisperText ) );
        }else{
            console.log("You must send an utterance or a whisper.");
        }
    }
    sbLLMPost( aPoolMember.aiLLM );
    /*
    tempName = "internalLLM_" + assistName ;
    contextLLMStr = localStorage.getItem( tempName );
    if ( contextLLMStr === "" ){
        assistDirFile = "../AssistantServers/InternalServer/" + assistantObject.name;
        readSBFile( assistDirFile, finishIntLLM );
*/
    return;
}

function callInternalAssistant( assistName, assistantObject, OVONmsg ){
    retOVONJSON = baseEnvelopeOVON( assistantObject );
    if( assistName == "discovery"){
        findEvents( OVONmsg.ovon.events );
        if( invite ){
            temp = parseFloat( localStorage.getItem( "AITemp" ) );
            sendInternalJSON = {
                "model": aiModel, // e.g. "model": "gpt-3.5-turbo",
                  "temperature": temp, //0.0 - 2.0
                  "messages": []
              }
            if( whisperText != ""){
                sendInternalJSON.messages.push( sbAddMsg( "assistant", whisperText ) );
            }else{
                sendInternalJSON.messages.push( sbAddMsg( "assistant", startPrompt ) );
            }
            if( utterance ){
                sendInternalJSON.messages.push( sbAddMsg( "user", utteranceText ) );
                sbLLMPost( sendInternalJSON );
            }
        }else{
            if( utterance ){
                sendInternalJSON.messages.push( sbAddMsg( "user", utteranceText ) );
                sbLLMPost( sendInternalJSON );
            }else{
                ovonUtt = buildUtteranceOVON( assistName, "You must invite the assistant first." );
                retOVONJSON.ovon.events.push(ovonUtt);        
            }
        }
    }else{
        ovonUtt = buildUtteranceOVON( assistName, "This assistant does not exist." );
        retOVONJSON.ovon.events.push(ovonUtt);
    }
    return;
}

function initialLLM( name, model, prompt, temp ) {
    theJSON = {"name": name,
        "invited": false,
        "aiLLM": {
            "model": model,  // e.g. "model": "gpt-3.5-turbo",
            "temperature": temp,  //0.0 - 2.0
            "messages": []
        }
    }
    discoverTurns = 0;
    theJSON.aiLLM.messages.push( sbAddMsg( "assistant", prompt ) );
    return theJSON;
}

function sbAddMsg( role, input ) {
    const roleContent = {"role": "", "content": ""};
    roleContent.role = role;
    roleContent.content = input;
    return roleContent;
}

function findEvents( eventArray ){
    invite = false;
    bye = false;
    utterance = false;
    whisper = false;
    utteranceText = "";
    whisperText = "";
    
    for (let i = 0; i < eventArray.length; i++) {
        type = eventArray[i].eventType;
        humanName = eventArray[i].eventType;
        if(type == "invite"){
            invite = true;
        }else if(type == "bye"){
            bye = true;
        }else if(type == "utterance"){
            utterance = true;
            utteranceText = eventArray[i].parameters.dialogEvent.features.text.tokens[0].value;
            humanName = eventArray[i].parameters.dialogEvent.speakerId;
        }else if(type == "whisper"){
            whisper = true;
            whisperText = eventArray[i].parameters.dialogEvent.features.text.tokens[0].value;
        }
    }           
}
    
function sbLLMPost( someJSON) { //send to LLM
    if( sbLLM_CommObject == null ){
      try{
        sbLLM_CommObject = new XMLHttpRequest();
      }catch(e){
        sbLLM_CommObject = null;
        alert( 'Failed to make LLM communication object' );
        return false;
      }
          //sbLLM_CommObject.onreadystatechange=sbLLMPostResp;
          sbLLM_CommObject.onreadystatechange= function(){
            sbLLMPostResp( someJSON );
      }
    }
  
    if( sbLLM_CommObject != null ){  
      sbLLM_CommObject.open( 'POST', aiCallType, true ); // false = async
  
      key = "Bearer " + localStorage.getItem( "OpenAIKey");
      sbLLM_CommObject.setRequestHeader('Authorization', key );
      sbLLM_CommObject.setRequestHeader('Content-Type', "application/json" );
  
      jsonSENTLLM = JSON.stringify( someJSON );
      sbLLM_CommObject.send( jsonSENTLLM ); // send to server (compressed string)

      jsonSENTLLM = JSON.stringify( someJSON, null, 2 ); //make it pretty for display
      var targ = document.getElementById("llmSENT");
      targ.innerHTML = jsonSENTLLM;

      const sentMessage = {
        direction: 'sent',
        timestamp: new Date().toISOString(),
        content: jsonSENTLLM,
      };
  
      LLMLog.push(sentMessage);
      localStorage.setItem('LLMLog', JSON.stringify(LLMLog, null, 2 ));
    }
}
  
function sbLLMPostResp( aiJSON ){ // should something come in do this
    if( sbLLM_CommObject.readyState == 4 ){
        if( sbLLM_CommObject.status == 200 ){
            sbData = sbLLM_CommObject.responseText;
            if( sbData.length ){
                retLLMJSON = JSON.parse(sbData);  
                var text = retLLMJSON.choices[0].message.content; // what LLM "says"
                aiJSON.messages.push( sbAddMsg( "assistant", text ) ); // keeping the convo context

                jsonRECEIVED = JSON.stringify( retLLMJSON, null, 2 );
                const receivedMessage = {
                    direction: 'received',
                    timestamp: new Date().toISOString(),
                    content: jsonRECEIVED,
                };
                LLMLog.push(receivedMessage);
                localStorage.setItem('LLMLog', JSON.stringify(LLMLog, null, 2 ));

                ovonUtt = buildUtteranceOVON( localStorage.getItem('assistantName'), text );
                retOVONJSON.ovon.events.push(ovonUtt);
                handleReturnedOVON( retOVONJSON );
            }
        }
    }
}
`;    
    fetch(`../Sandbox/AssistantServers/${assistantName}Assistant`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            assistantType: assistantType,
            LLMContent: localContent,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to create directory: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
    })
    .catch(error => {
        console.error('Error creating directory:', error);
        alert('Failed to create directory. Please try again.');
    });
}  
}