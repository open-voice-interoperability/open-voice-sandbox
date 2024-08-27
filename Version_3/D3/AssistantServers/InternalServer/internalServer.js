// branch to a JavaScript based server in here

var humanName = "Human";
var currentLLMName = "";
var sbLLM_CommObject;
var LLMLog = [];
var sendInternalJSON;
var aiCallType = "https://api.openai.com/v1/chat/completions";
//var aiModel = "gpt-3.5-turbo-1106";
var aiModel = "gpt-4o";

var turnLLM = 0;
var aiAssistantPool = [];

function callInternalLLM( assistName, assistantObject, OVONmsg ){
    var aPoolMember = null;
    temp = parseFloat( localStorage.getItem( "AITemp" ) );
    retOVONJSON = baseEnvelopeOVON( assistantObject.assistant.serviceAddress, true );
    for (const x in aiAssistantPool) {
        if( x.asssistant.name === assistName ){ // find the assistant data
            aPoolMember = x;
        }
    }
    if( aPoolMember === null ){ // not found so build it
        aPoolMember = initialLLM( assistName, aiModel, startPrompt, 0.5 );
        aiAssistantPool.push( aPoolMember );
    }
    var eventsJSON = eventSummary( OVONmsg.ovon.events );
    if( !aPoolMember.invited && eventsJSON.invite ){
        aPoolMember.invited = true;
        if( eventsJSON.utterance ){
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", eventsJSON.utteranceText ) );
        }else{
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", "Hello" ) );
        }
    }else{
        if( eventsJSON.utterance ){
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", eventsJSON.utteranceText ) );
        }else if( eventsJSON.whisper ){
            aPoolMember.aiLLM.messages.push( sbAddMsg( "user", eventsJSON.whisperText ) );
        }else{
            console.log("You must send an utterance or a whisper.");
        }
    }
    sbLLMPost( aPoolMember.aiLLM );
    return;
}

/*
function callThisLLM( aPoolMember, OVONmsg ){
    retOVONJSON = baseEnvelopeOVON( assistantObject, true );
    var eventsJSON = eventSummary( OVONmsg.ovon.events );
    if( eventsJSON.invite ){
        aPoolMember.invited = true;

        sendInternalJSON = {
            "model": aPoolMember.llmModel, // e.g. "model": "gpt-3.5-turbo",
            "temperature": aPoolMember.temperature, //0.0 - 2.0
            "messages": aPoolMember.context
        }
        sendInternalJSON.messages.push( sbAddMsg( "assistant", aPoolMember.startPrompt ) );

        if( eventsJSON.utterance ){
            aPoolMember.context.push( sbAddMsg( "user", eventsJSON.utteranceText ) );
        }else{
            aPoolMember.context.push( sbAddMsg( "user", "Hello" ) );
        }
    }else{
        if( eventsJSON.utterance ){
            aPoolMember.context.push( sbAddMsg( "user", eventsJSON.utteranceText ) );
        }else if( eventsJSON.whisper ){
            aPoolMember.context.push( sbAddMsg( "user", eventsJSON.whisperText ) );
        }else{
            console.log("You must send an utterance or a whisper.");
        }
    }
    sbLLMPost( aPoolMember.context );
    return;
}
*/
async function callInternalAssistant( assistName, assistantObject, OVONmsg, handleMsg ){
    currentLLMName = assistName;
    retOVONJSON = baseEnvelopeOVON( assistantObject.assistant.serviceAddress, true );
    var fName = "../AssistantServers/LLMPool/" + assistName + ".json";
    var eventsJSON = eventSummary( OVONmsg.ovon.events );
    assistantObject.assistant.name = assistName;

// console.log("callIntASS-eventsJSON", eventsJSON); // ejcDBG
    if( eventsJSON.invite ){            
        temp = parseFloat( localStorage.getItem( "AITemp" ) );
        savedCtx = aiAssistantPool[assistName]; // get saved context
        if( savedCtx && false ){ // ejcDBG force this to fail for now
            sendInternalJSON = savedCtx;
            //sendInternalJSON.messages.push( sbAddMsg( "user", "hello" ));
            //sendInternalJSON.messages.push( sbAddMsg( "user", "okay let's continue" ));
        }else{
            //fName = "../AssistantServers/LLMPool/" + assistName + ".json";
            fileJSON = await fetchFileJSON( fName);
            if( fileJSON ){
                startPrompt = fileJSON["prePrompt"];
                startPrompt += fileJSON["transferList"];
                startPrompt += fileJSON["prompt"];
                startPrompt += "The human's name is: " + OVONmsg.ovon.sender.from; + ". ";
                //startPrompt += ". Only on the first turn speaking to the human you will say: ";
                //startPrompt += fileJSON["openingGreeting"] + " ";
                //startPrompt += OVONmsg.ovon.sender.from;
                //startPrompt += ", my name is ";
                startPrompt += "Your name is " + fileJSON["assistantName"] + ". ";
                startPrompt += "Your title is " + fileJSON["assistantTitle"] + ". ";
                //startPrompt += fileJSON["assistantName"] + " your ";
                //startPrompt += fileJSON["assistantTitle"];
                //startPrompt += ". On further turns you must not say your name or title unless specifically asked to do so. You are succinct and friendly.";
                startPrompt += "You are succinct and friendly. ";
                if( eventsJSON.whisper){
                    startPrompt += " You heard the human say the following: " + eventsJSON.whisperText + "."
                }
                sendInternalJSON = {
                    "model": aiModel, // e.g. "model": "gpt-3.5-turbo",
                    "temperature": temp, //0.0 - 2.0
                    "messages": []
                };
            }else{
                startPrompt = "Something has gone wrong. This assistant does not exist. Explain this to the human.";
            }
            sendInternalJSON.messages.push( sbAddMsg( "user", startPrompt ));
            aiAssistantPool[assistName] = sendInternalJSON;
        }
        await sbLLMPost( sendInternalJSON );
        //if( eventsJSON.utterance ){ // Maybe service an utt too??? or append it to the startprompt???
        //    sendInternalJSON.messages.push( sbAddMsg( "user", eventsJSON.utteranceText ) );
        //    sbLLMPost( sendInternalJSON );
        //}
    }else{
        if( eventsJSON.utterance && sendInternalJSON ){
            savedCtx = aiAssistantPool[assistName]; // get saved context
            if( savedCtx ){
                sendInternalJSON = savedCtx;
                sendInternalJSON.messages.push(sbAddMsg("user", eventsJSON.utteranceText));
                aiAssistantPool[assistName] = sendInternalJSON;
            }
            await sbLLMPost(sendInternalJSON);
            try {
                const matchedConcepts = await searchConcept(eventsJSON.utteranceText);
                if (matchedConcepts.length > 0) {
                    const conceptsPayload = matchedConcepts.map((conceptInfo) => ({
                        concept: conceptInfo.concept,
                        matchedWords: conceptInfo.matchedWords
                    }));
                    const whisperEvent = {
                        eventType: "whisper",
                        parameters: { concepts: conceptsPayload }
                    };
                    retOVONJSON.ovon.events.push(whisperEvent);
                }
            } catch (error) {
                console.error('Error searching concept:', error);
            }
        }else if(eventsJSON.requestManifest) {
            // console.log('Requested');
            const responseText = "Here is my manifest";
            ovonUtt = buildUtteranceOVON(assistName, responseText);
            fileJSON = await fetchFileJSON( fName);
            manifest = {
                "eventType": "publishManifest",
                "parameters": { 
                    "manifest" : fileJSON["manifest"]
                }
            }
            retOVONJSON.ovon.sender.from = assistName; // Set sender name
            retOVONJSON.ovon.events.push(manifest); // Insert
            retOVONJSON.ovon.events.push(ovonUtt);
            // console.log(retOVONJSON)
        }else{
            ovonUtt = buildUtteranceOVON( assistName, "You must invite the assistant first." );
            retOVONJSON.ovon.events.push(ovonUtt);        
        }
    }
    if(handleMsg){
        setAssistantNameElement(assistantObject);
        await handleReturnedOVON(retOVONJSON); //ejcDBG added await

    }else{
        return retOVONJSON;
    }

    return retOVONJSON;
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

function sbLLMPost( someJSON) { //send to LLM
// console.log("sbLLMPost-someJSON", someJSON); // ejcDBG
// console.log("sbLLMPost-assistantObject", assistantObject); // ejcDBG

    if( sbLLM_CommObject == null ){
      try{
        sbLLM_CommObject = new XMLHttpRequest();
      }catch(e){
        sbLLM_CommObject = null;
        alert( 'Failed to make LLM communication object' );
        return false;
      }
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
      targ.style.display = "table-row";
      document.getElementById("llmRow").style.display = "table-row";
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
  
async function sbLLMPostResp( aiJSON ){ // should something come in do this
    var newInviteOVON = null;
    var invitedAssistant = null;
    if( sbLLM_CommObject.readyState == 4 ){
        if( sbLLM_CommObject.status == 200 ){
            sbData = sbLLM_CommObject.responseText;
// console.log("llmPostResp-sbData", sbData); // ejcDBG
            if( sbData.length ){
                retLLMJSON = JSON.parse(sbData);  
                var text = retLLMJSON.choices[0].message.content; // what LLM "says"
                // look inside text for some JSON
                // e.g. {"discovery":{"domain":"Sports","subDomain":"Volleyball"}}
                // if there then remove it from utt and put it in the whisper
                // note: the first label "discovery" is the name of the assistant
                startPosJSON = text.indexOf( "<<<WHISPER" );
                if( startPosJSON > -1 ){
                    endPosJSON = text.indexOf( ">>>" );
                    if( endPosJSON > startPosJSON ){ // maybe some good JSON from LLM
                        whisper = text.substring( startPosJSON+10, endPosJSON );
                        control = whisper.split('=');
                        if( control[0] == "action" ){
                          msg = control[1].split(':');
                          if( msg[0] == "invite"){
                            invitedAssistant = sbGetAgentParams( msg[1] );
                            newInviteOVON = baseEnvelopeOVON( invitedAssistant );
                            bareInviteOVON(newInviteOVON, invitedAssistant, true);
                            //if( invitedAssistant.assistant.name != "cassandra"){
                            //    whispStr = localStorage.getItem( "sbLastInputUTT" );
                            //    newInviteOVON.ovon.events.push( buildWhisperOVON( "table", whispStr ) );
                            //}
 
                            buildWhisperInviteReqSeqDiag(invitedAssistant.assistant.name, "assistantBrowser", whisper);     
                            // now what???
                          }
                        }else if( control[0] == "discovery" ){
                          domain = control[1].split(':'); // domain[0]=domain, domain[1]=subDomain
                          // now look up the domain and find the assistant a submit as a candidate
                        }
                  

                        ovonUtt = buildWhisperOVON( localStorage.getItem('assistantName'), whisper );
                        retOVONJSON.ovon.events.push(ovonUtt);
                    }
                    text = text.substring( 0, startPosJSON-1);
                }
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
                await handleReturnedOVON( retOVONJSON );
                if( newInviteOVON && invitedAssistant){
                    //assistantObject = invitedAssistant;
                    await sbPostToAssistant( invitedAssistant, newInviteOVON ); //ejcDBG added await
                    assistantObject = invitedAssistant;
                    //buildWhisperInviteReqSeqDiag("assistantBrowser", invitedAssistant.assistant.name, whisper);     
                }
            }
        }
    }
}

function saveAssistantLLMContext(){
    // Send a PUT request to update the server-side JSON file
    fetch('../Support/ActiveAssistantList.json', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(assistantTable, null, 2), // Save updated data
    })
    .then(response => response.json())
    .catch(error => {
    console.error('Error updating assistant on the server:', error);
    });

}