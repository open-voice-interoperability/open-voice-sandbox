// branch to a JavaScript based server in here

var humanName = "Human";
var sbLLM_CommObject;
var LLMLog = [];
var sendInternalJSON;
var aiCallType = "https://api.openai.com/v1/chat/completions";
var aiModel = "gpt-3.5-turbo-1106";

var startPrompt = "You are an assistant that will help the human user discover the domain expertise required by the human to complete their task. You will accept a phrase or sentence as a starting point and ask questions that help focus on the general expertise that is needed to help the human. Your responses will be friendly and conversational. You will try to keep your responses to less than 40 words. Your questions for clarification can and should be leading and suggestive enough to prompt the user to give clearer answers. The result of this conversation will be a single word or short phrase that identifies the domain expertise for the assistant they require (we will call this the DOMAIN value and it will be something like \"boating\" or \"culinary\" or \"composing\"). Also, if possible you will provide a SUBDOMAIN value to refine the focus of the larger DOMAIN. For example \"sailing\" is a SUBDOMAIN of \"boating\" (as \"poetry\" might be for \"composing\"). This conversation should be no longer than two or three turns. Once you are confident about identifying the DOMAIN and SUBDOMAIN You will return a parting utterance. You will also append the DOMAIN and SUBDOMAIN (but without mentioning it) as a JSON structure of the form: <<<WHISPER{\"discovery\":\"JSON\",\"data\":{\"domain\":\"the_DOMAIN_value\",\"subDomain\":\"the_SUBDOMAIN_value\"}}>>>";

var turnLLM = 0;
var aiAssistantPool = [];

function callInternalLLM( assistName, assistantObject, OVONmsg ){
    var aPoolMember = null;
    temp = parseFloat( localStorage.getItem( "AITemp" ) );
    retOVONJSON = baseEnvelopeOVON( assistantObject, true );
    for (const x in aiAssistantPool) {
        if( x.name === assistName ){ // find the assistant data
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

async function callInternalAssistant( assistName, assistantObject, OVONmsg ){
    retOVONJSON = baseEnvelopeOVON( assistantObject, true );
    if( assistName == "discovery"){
        var eventsJSON = eventSummary( OVONmsg.ovon.events );
        if( eventsJSON.invite ){
            temp = parseFloat( localStorage.getItem( "AITemp" ) );
            sendInternalJSON = {
                "model": aiModel, // e.g. "model": "gpt-3.5-turbo",
                  "temperature": temp, //0.0 - 2.0
                  "messages": []
              }
            if( eventsJSON.whisperText != ""){
                sendInternalJSON.messages.push( sbAddMsg( "assistant", eventsJSON.whisperText ) );
            }else{
                sendInternalJSON.messages.push( sbAddMsg( "assistant", startPrompt ) );
            }
            if( eventsJSON.utterance ){
                sendInternalJSON.messages.push( sbAddMsg( "user", eventsJSON.utteranceText ) );
                sbLLMPost( sendInternalJSON );
            }
        }else{
            if( eventsJSON.utterance && sendInternalJSON ){
                sendInternalJSON.messages.push(sbAddMsg("user", eventsJSON.utteranceText));
                sbLLMPost(sendInternalJSON);
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

function sbLLMPost( someJSON) { //send to LLM
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
  
function sbLLMPostResp( aiJSON ){ // should something come in do this
    if( sbLLM_CommObject.readyState == 4 ){
        if( sbLLM_CommObject.status == 200 ){
            sbData = sbLLM_CommObject.responseText;
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
                        var whisperObj = JSON.parse( whisper );
                        ovonUtt = buildWhisperOVON( localStorage.getItem('assistantName'), whisperObj );
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
                handleReturnedOVON( retOVONJSON );
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