function sbConversationStart() {
    msgLogDiv = document.getElementById("msgLOG");
    localStorage.setItem("currentConversationID", "");
    jsonLOG = "";
    localStorage.setItem( "uttCount", 0 );
    var selectedColor = localStorage.getItem('markerColor');
    const baseEnvelope = baseEnvelopeOVON(assistantObject);
    var assistantNameElement = document.getElementById("AssistantName");

    if (assistantNameElement) {
        // The element exists, set its innerText
        assistantNameElement.innerText = localStorage.getItem('assistantName');
    }
    document.getElementById("BrowserType").innerText = sbBrowserType;
    document.getElementById("OSType").innerText = sbOSType;
    if (!assistantObject) {
        return;
    }

    var wc = "assistantBrowser";
    var aName = assistantObject.assistant.name;
    localStorage.setItem( 'assistantName', aName );
    //var aName = localStorage.getItem('assistantName');
    
    if (localStorage.getItem("bareInviteSelected") === "true") { // Bare Invite button selected
        setEvelopeConvoID(baseEnvelope);
        const OVONmsg = bareInviteOVON(baseEnvelope, assistantObject);

        buildSeqDiagJSON( "human", wc, "[[Start a dialog with "+aName+"]]", "Cold open a new conversation thread", "" );
        buildSeqDiagJSON( wc, aName, "invite "+aName, "Invite for initial connection", "" );
        buildSeqDiagJSON( aName, aName, "[[INITIALIZE]]", "Set up for first contact with the assistant", "" );
        saveLocalSeqDiag();
      
        setTimeout(() => {
            sbPostToAssistant(assistantObject, OVONmsg);
            clearValue(OVONmsg);
          }, 50);
    } else if(localStorage.getItem("InviteWithWhisper") === "true") { // Invite w/ Whisper selected
        const whisperMessage = localStorage.getItem("whisperMessage");
        setEvelopeConvoID(baseEnvelope);
        const OVONmsg = bareInviteOVON (baseEnvelope, assistantObject);
        OVONmsg.ovon.events.push(buildWhisperOVON(assistantObject.name, whisperMessage));

        buildSeqDiagJSON( "human", wc, "[[Start a dialog with "+aName+"]]", "Open a new conversation thread w/ Whisper context", "" );
        buildSeqDiagJSON( wc, aName, "invite/whisper "+aName, "Whisper: "+whisperMessage, "" );
        buildSeqDiagJSON( aName, aName, "[[INIT w/Whisper]]", "Initialize for first contact with additional context for the assistant", "" );
        buildSeqDiagJSON( aName, aName, "[[NLU/DIALOG]]", "Assistant processes the Whisper", "" );
        saveLocalSeqDiag();
      
        setTimeout(() => {
            sbPostToAssistant(assistantObject, OVONmsg);
        }, 50);
        
        localStorage.removeItem("InviteWithWhisper");
        localStorage.removeItem("whisperMessage");
    }
}

initializeAssistantData().then(sbConversationStart);

function baseEnvelopeOVON( someAssistant, isReceived = false ){
    const humanFirstName = localStorage.getItem("humanFirstName");
    const OVON_Base = {
        "ovon": {
            "conversation": {
                "id": "someUniqueIdCreatedByTheFirstParticipant",
            },
            "schema": {
                "version": "0.9.0",
                "url": "not_published_yet"
            },
            "sender": {
                "from": isReceived ? someAssistant.assistant.serviceAddress : "Human",
            },
            "responseCode" : {
                "code": 200,
                "description": "OK"
              },
            "events": [],
        },
    };
    conversationID = localStorage.getItem( "currentConversationID" );
    if( conversationID == "" ){
        conversationID = "convoID8403984"; // in reality build a unique one
        localStorage.setItem( "currentConversationID", conversationID );
    }
    OVON_Base.ovon.conversation.id = conversationID; // once set it is retained until SB restart
    // OVON_Base.ovon.sender.from = someAssistant.assistant.serviceAddress;
    // OVON_Base.ovon.sender.from = "browser"; // in reality it is extracted from any invite browser sees
    return OVON_Base;
}

function bareInviteOVON(baseEnvelope, someAssistant ){
    const OVON_invite = {
        "eventType": "invite",
        "parameters": {
            "to": {
                "url": "https://someBotThatIsBeingInvited.com"
            }
        }
    }
    OVON_invite.parameters.to.url = someAssistant.assistant.serviceAddress;
    baseEnvelope.ovon.events.push(OVON_invite);
    return baseEnvelope;
}

function bareByeOVON( someAssistant ){
    const OVON_invite = {
        "eventType": "bye",
        "parameters": {
            "to": {
                "url": "https://someBotThatIsBeingSaidGoodbytTo.com"
            }
        }
    }
    OVON_invite.parameters.to.url = someAssistant.assistant.serviceAddress;
    return OVON_invite;
}

function buildUtteranceOVON( speaker, utteranceStr ){
    const OVON_Utterance = {
        "eventType": "utterance",
        "parameters": {
            "dialogEvent": {
                "speakerId": "someSpeakerID",
                "span": { "startTime": "2023-06-14 02:06:07+00:00" },
                "features": {
                    "text": {
                        "mimeType": "text/plain",
                        "tokens": [ { "value": "something to say to assistant"  } ]
                    }
                }
            }
        }
    }
    OVON_Utterance.parameters.dialogEvent.speakerId = speaker;
    d = new Date();
    OVON_Utterance.parameters.dialogEvent.span.startTime = d.toISOString();
    OVON_Utterance.parameters.dialogEvent.features.text.tokens[0].value = utteranceStr;
    
    return OVON_Utterance;
}

function buildWhisperOVON( speaker, whisperStr ){
    const name = speaker;
    const OVON_Whisper = {
        "eventType": "whisper",
        "parameters": {
            "dialogEvent": {
                "speakerId": name,
                "span": { "startTime": "2023-06-14 02:06:07+00:00" },
                "features": {
                    "text": {
                        "mimeType": "text/plain",
                        "tokens": [ { "value": whisperStr  } ]
                    }
                }
            }
        }
    }
    d = new Date();
    OVON_Whisper.parameters.dialogEvent.span.startTime = d.toISOString();
    OVON_Whisper.parameters.dialogEvent.features.text.tokens[0].value = whisperStr;
    return OVON_Whisper;
}
var converseWindow = null;
function inviteWithUtterance() {
    const whisperMessage = document.getElementById("whisperMessage").value;
    if (whisperMessage.trim() !== "") {
        localStorage.setItem("InviteWithWhisper", "true");
        localStorage.setItem("whisperMessage", whisperMessage);
        if (!converseWindow || converseWindow.closed) {
            converseWindow = window.open('sbConverse.html', '_blank');
        } else {
            converseWindow.location.href = 'sbConverse.html';
            converseWindow.focus();
        }
    } else {
        alert("Please enter a Whisper message before inviting.");
    }
}

function bareInviteWindow() {
    localStorage.setItem("bareInviteSelected", "true");
    if (!converseWindow || converseWindow.closed) {
        converseWindow = window.open('sbConverse.html', '_blank');
    } else {
        converseWindow.location.href = 'sbConverse.html';
        converseWindow.focus();
    }
}


function clearValue(OVONmsg) {
    const isInviteWithWhisper = localStorage.getItem("InviteWithWhisper") === "true";
    
    if (isInviteWithWhisper) {
        const whisperMessage = localStorage.getItem("whisperMessage");
        const ovonWhisper = buildWhisperOVON(localStorage.getItem( "humanFirstName" ), whisperMessage);
        OVONmsg.ovon.events.push(ovonWhisper);
        
        localStorage.removeItem("InviteWithWhisper");
        localStorage.removeItem("whisperMessage");
    } else {
        // For Bare Invite, clear the value
        localStorage.removeItem("bareInviteSelected");
    }
}

//Present the Assistant response html innerHTML string
function displayResponseUtterance( text, col ) {
    var resp = "<b style='color:";
    resp += ' style="color:';
    resp += assistantObject.assistant.markerColor;
    resp += "';>";
    resp += assistantObject.assistant.name;
    resp += ': '
    resp += text;
    resp += '</b>';
    var responseDiv = document.getElementById("response");
    responseDiv.innerHTML = resp;

    if( usingTTS){
        sbSpeak( text, assistantObject );
    }
    return;
  }

  function displayMsgRECEIVED(text, col) {
    var resp = `<span style='color:${col};'>${text}</span>`;
    var msgRECEIVEDDiv = document.getElementById("msgRECEIVED");
    msgRECEIVEDDiv.innerHTML = resp;
    return;
}

//Present the Assistant msgLOG html innerHTML string
function displayMsgLOG( text, col ) {
    var resp = "<b>";
    resp += text;
    resp += '</b>'
    var msgLogDiv = document.getElementById("msgLOG");
    msgLogDiv.innerHTML = resp;
    return;
}

function checkEnterKey(event, callback) {
    if (event.key === "Enter") {
        callback();
    }
}

//Present the Assistant msgLOG html innerHTML string
function sendReply(isWhisperButton) {
    const utteranceText = document.getElementById("utterance").value;
    const whisperText = document.getElementById("whisper").value;

    browser = sbGetAgentParams( "assistantBrowser" );
    const baseEnvelope = baseEnvelopeOVON(browser);

        const ovonUtt = buildUtteranceOVON(localStorage.getItem("humanFirstName"), utteranceText);
        baseEnvelope.ovon.events.push(ovonUtt);


    if (isWhisperButton && whisperText.trim() === "") {
        // Alert if whisper button is clicked without providing whisper text
        alert("Please provide a whisper");
        return;
    }

    if (whisperText.trim() !== "") {
        const ovonWhisper = buildWhisperOVON(localStorage.getItem("humanFirstName"), whisperText);
        baseEnvelope.ovon.events.push(ovonWhisper);
    }

    // Set conversation ID and send to the assistant
    setEvelopeConvoID(baseEnvelope);
    const aIndex = localStorage.getItem("currentAssistantIndex");
    sbPostToAssistant(assistantTable[aIndex], baseEnvelope);

    // Clear input fields
    document.getElementById("utterance").value = "";
    document.getElementById("whisper").value = "";
}



// settings stuff here
function loadSettingsValues(){
    document.getElementById("firstName").value = localStorage.getItem( "humanFirstName" );
    document.getElementById("OpenAI").value = localStorage.getItem( "OpenAIKey" );
    document.getElementById("AITemp").value = localStorage.getItem( "AITemp" );
}

function setFirstName(){
    localStorage.setItem( "humanFirstName", document.getElementById("firstName").value );
}

function setOpenAIKey(){
    localStorage.setItem( "OpenAIKey", document.getElementById("OpenAI").value );
}

function setAITemp(){
    localStorage.setItem( "AITemp", document.getElementById("AITemp").value );
}

function setEvelopeConvoID( OVONmsg ){
    conversationID = localStorage.getItem( "currentConversationID" );
    if( conversationID == "" ){
        conversationID = "convoID_";
        conversationID += cleanDateTimeString();
        localStorage.setItem( "currentConversationID", conversationID );
    }
    OVONmsg.ovon.conversation.id = conversationID; //once set is retained until SB restart
}

function saveTimeStampedLogFile(){
    var fileName = "OVON";
    fileName += cleanDateTimeString();
    fileName += ".log.txt";
    writeSBFile( fileName, JSON.stringify(conversationLOG, null, 2 ) );
}

function eventSummary( eventArray ) {
    summaryJSON = {"invite": false,
    "bye": false,
    "utterance": false,
    "whisper": false,
    "utteranceText": "",
    "whisperText": ""
    }

    for (let i = 0; i < eventArray.length; i++) {
        type = eventArray[i].eventType;
        if(type == "invite"){
            summaryJSON.invite = true;
        }else if(type == "bye"){
            summaryJSON.bye = true;
        }else if(type == "utterance"){
            summaryJSON.utterance = true;
            summaryJSON.utteranceText = eventArray[i].parameters.dialogEvent.features.text.tokens[0].value;
        }else if(type == "whisper"){
            summaryJSON.whisper = true;
            summaryJSON.whisperText = eventArray[i].parameters.dialogEvent.features.text.tokens[0].value;
        }
    }           
    return summaryJSON;
}
