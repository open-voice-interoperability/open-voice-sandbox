var wc = "assistantBrowser";
// var aName = assistantObject.assistant.name;

function sbConversationStart() {
    msgLogDiv = document.getElementById("msgLOG");
    localStorage.setItem("currentConversationID", "");
    jsonLOG = "";
    localStorage.setItem( "uttCount", 0 );
    const baseEnvelope = baseEnvelopeOVON(assistantObject);
    document.getElementById("BrowserType").innerText = sbBrowserType;
    document.getElementById("OSType").innerText = sbOSType;
    if (!assistantObject) {
        return;
    }
    
    if (localStorage.getItem("bareInviteSelected") === "true") { // Bare Invite button selected
        setEvelopeConvoID(baseEnvelope);
        const OVONmsg = bareInviteOVON(baseEnvelope, assistantObject, delegate);
      
        setTimeout(() => {
            sbPostToAssistant(assistantObject, OVONmsg);
            clearValue(OVONmsg);
          }, 50);
    } else if(localStorage.getItem("InviteWithWhisper") === "true") { // Invite w/ Whisper selected
        const whisperMessage = localStorage.getItem("whisperMessage");
        setEvelopeConvoID(baseEnvelope);
        const OVONmsg = bareInviteOVON (baseEnvelope, assistantObject, delegate);
        OVONmsg.ovon.events.push(buildWhisperOVON(assistantObject.name, whisperMessage));

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
    const defaultSenderName = humanFirstName || "Human"; 
    const OVON_Base = {
        "ovon": {
            "conversation": {
                "id": "someUniqueIdCreatedByTheFirstParticipant",
                "startTime": "2023-06-14 02:06:07+00:00" ,
            },
            "schema": {
                "version": "0.9.0",
                "url": "not_published_yet"
            },
            //participants: (to and from)
            "sender": {
                "from": isReceived ? someAssistant.assistant.serviceAddress : defaultSenderName,
                "to": isReceived ? defaultSenderName : (someAssistant.assistant.serviceAddress || someAssistant.assistant.assistant.name)
            },
            "responseCode" : {
                "code": 200,
                "description": "OK"
              },
            "events": [],
        },
    };
    OVON_Base.ovon.conversation.startTime = cleanDateTimeString().slice(1,);
    conversationID = localStorage.getItem( "currentConversationID" );
    if( conversationID == "" ){
        conversationID = "convoID8403984"; // in reality build a unique one
        localStorage.setItem( "currentConversationID", conversationID );
    }
    OVON_Base.ovon.conversation.id = conversationID; // once set it is retained until SB restart
    return OVON_Base;
}
var invitedAssistantStack = [];
var prevAssistantList = [];
let delegate = false;
function bareInviteOVON(baseEnvelope, someAssistant, delegate ){
    const OVON_invite = {
        "eventType": "invite",
        }
    baseEnvelope.ovon.events.push(OVON_invite);
    
    invitedAssistantStack.unshift(assistantObject); // Use unshift() to add the assistantObject to the beginning of the stack
    localStorage.setItem('invitedAssistantStack', JSON.stringify(invitedAssistantStack));
    setAssistantNameElement( someAssistant );
    buildInviteSeqDiag(wc, someAssistant.assistant.name, delegate);
    return baseEnvelope;
}

function setAssistantNameElement( assObj ){
    var assistantNameElement = document.getElementById("AssistantName");
    var assistantName = assObj.assistant.name;
    var markerColor = assObj.assistant.markerColor;
    var llmElement = document.getElementById("llmRow");
    llmElement.style.display = "none";

    if (assistantNameElement) {
        assistantNameElement.innerText = assistantName;
        var dispName = assObj.assistant.displayName;
        if( dispName ){
            if( dispName != ""){
            assistantNameElement.innerText = dispName;
        }
        }
        assistantNameElement.style.color = markerColor;
    } else {
    return; 
    }
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

function buildUtteranceOVON( speaker, utteranceStr, isText, isDelegate){
    const OVON_Utterance = {
        "eventType": "utterance",
        "parameters": {
            "dialogEvent": {
                "speakerId": speaker ? speaker : "Human",
                "features": {
                    "text": {
                        "mimeType": "text/plain",
                        "tokens": [ { "value": "something to say to assistant"  } ]
                    }
                }
            }
        }
    }
    d = new Date();
    OVON_Utterance.parameters.dialogEvent.features.text.tokens[0].value = utteranceStr;
    var shortString = shortenString( utteranceStr, 55 )
    if (speaker === 'Human' || speaker === localStorage.getItem('humanFirstName' || speaker === 'unknown')) {
        buildUttSeqDiag(wc, assistantObject.assistant.name, shortString, utteranceStr, isText, isDelegate);
    }
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
    var shortString = shortenString( whisperStr, 55 )
    buildWhisperSeqDiag(wc, assistantObject.assistant.name, shortString, whisperStr);
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
    // resp += assistantObject.assistant.name;
    // resp += ': '
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

function checkEnterKey(event, isText, isWhisper) {
    if (event.key === "Enter") {
        var utteranceText = document.getElementById("utterance").value;
        var whisperText = document.getElementById("whisper").value;
        handleInput(utteranceText, whisperText, isText, isWhisper);
        // callback(utteranceText, false, true);
    }
}

//Present the Assistant msgLOG html innerHTML string
function sendReply(utteranceText, isWhisperButton, isText, prevAssistant, whisperText) {
    if (isText) {
        console.log("TEXT WAS USED");
    }
    if(!isText){
        console.log("ASR WAS USED");
    }
    
    browser = sbGetAgentParams( "assistantBrowser" );

    var concept = searchConcept( utteranceText );
    var isDelegate = false;
    let baseEnvelope;
    for (var i = 0; i< concept.length; i++) {
        if (concept[i].concept === 'delegate'){
            isDelegate = true;
            if(prevAssistant){
                baseEnvelope = baseEnvelopeOVON(prevAssistant);
                break;

        }else{
            baseEnvelope = baseEnvelopeOVON(assistantObject);
        }
        }
    }
    if (!baseEnvelope){
        baseEnvelope = baseEnvelopeOVON(assistantObject);   
    }

    const ovonUtt = buildUtteranceOVON(localStorage.getItem("humanFirstName"), utteranceText, isText, isDelegate);
    baseEnvelope.ovon.events.push(ovonUtt);
        
    if (isWhisperButton && whisperText.trim() === "") {
        // Alert if whisper button is clicked without providing whisper text
        alert("Please provide a whisper");
        return;
    }

    if (whisperText && whisperText.trim() !== "") {
        const ovonWhisper = buildWhisperOVON(localStorage.getItem("humanFirstName"), whisperText);
        baseEnvelope.ovon.events.push(ovonWhisper);
    }
    setEvelopeConvoID(baseEnvelope);
    sbPostToAssistant(assistantObject, baseEnvelope);

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
        const type = eventArray[i].eventType;
        const parameters = eventArray[i].parameters;

        if (type === "invite") {
            summaryJSON.invite = true;
        } else if (type === "bye") {
            summaryJSON.bye = true;
        } else if (type === "utterance") {
            summaryJSON.utterance = true;
            if (parameters.dialogEvent && parameters.dialogEvent.features && parameters.dialogEvent.features.text && parameters.dialogEvent.features.text.tokens) {
                summaryJSON.utteranceText = parameters.dialogEvent.features.text.tokens[0].value;
            }
        } else if (type === "whisper") {
            summaryJSON.whisper = true;
            if (parameters.dialogEvent && parameters.dialogEvent.features && parameters.dialogEvent.features.text && parameters.dialogEvent.features.text.tokens) {
                summaryJSON.whisperText = parameters.dialogEvent.features.text.tokens[0].value;
            }
        }
    }  
    return summaryJSON;
}
var assistantStack = JSON.parse(localStorage.getItem('fullAssistantList')) || [];
var assistantBrowser = assistantStack[1];
var assistantBrowserServiceAddress = assistantBrowser.assistant.assistant.name;

function sbFloorEvents( floorDirectives, message, whisper, isText, isWhisper ) {
    let prevAssistantServiceAddress = "";
    let prevAssistant;        
    if (invitedAssistantStack.length >= 0) {
        prevAssistant = invitedAssistantStack[0];
        prevAssistantList.unshift(invitedAssistantStack[0].assistant);
        prevAssistantServiceAddress = prevAssistantList[0].serviceAddress;
    }
    var someAssistant = null;
    if( floorDirectives.assistantName.length ){
        someAssistant = sbGetAgentParams( floorDirectives.assistantName );
    }
    if( !someAssistant ){
        // get name from the stack (the last assistant speaking)
        someAssistant = sbGetAgentParams( "leah" ); // just fake for testing now
    }
    if( someAssistant ){
        assistantObject = someAssistant;
        var ovonMSG = baseEnvelopeOVON( someAssistant, false );
        if( floorDirectives.redirect.length ){
            if( floorDirectives.redirect == "delegate"){
                ovonMSG.ovon.sender.from = assistantBrowserServiceAddress;
                sendReply(message, isWhisper, isText, assistantBrowser, whisper);
                delegate=true
                var thisInvite = bareInviteOVON( ovonMSG, someAssistant, delegate );
                sbPostToAssistant(someAssistant, thisInvite);
            }else if( floorDirectives.redirect == "return"){ // just do the delegate for now (later add a "return whisper")
                ovonMSG.ovon.sender.from = prevAssistantServiceAddress;
                sendReply(message, false, false);
                delegate = true;
                var thisInvite = bareInviteOVON( ovonMSG, someAssistant, delegate );
                sbPostToAssistant(someAssistant, thisInvite);
            }
        }
    }else{
        return false;
    }
}