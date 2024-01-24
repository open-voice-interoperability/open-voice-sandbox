var sbLLM_CommObject = null; // used to send http messages 
var retLLMJSON;
var sendLLMJSON;
var assObj;
var convoTurnCount = 0;
var aiCallType = "https://api.openai.com/v1/chat/completions";
var aiModel = "gpt-3.5-turbo";
var logLLMJSON;


function sbLLMStartASR(){
  useLLM = true;
  sbStartASR();
}

function sbInitialLLMPrompt( input ) {
    sendLLMJSON = {
      "model": aiModel,
      //"model": "gpt-3.5-turbo",
      //        "model": "gpt-4-1106-preview",
        "temperature": 0.3,
        "messages": []
    }
    convoTurnCount = 0;
    assObj = assistantTable[localStorage.getItem( "currentAssistantIndex" )];
    sendLLMJSON.messages.push( sbBuildRoleContent( "user", input ) );
}

function sbBuildRoleContent( role, input ) {
    const roleContent = {
        "role": "user",
        "content": "some input"
    }
    roleContent.role = role;
    roleContent.content = input;
    return roleContent;
}

function sbPostToLLM( input ) { //send to LLM
  if( sbLLM_CommObject == null ){
    try{
      sbLLM_CommObject = new XMLHttpRequest();
    }catch(e){
      sbLLM_CommObject = null;
      alert( 'Failed to make sandbox communication object' );
      return false;
    }
    sbLLM_CommObject.onreadystatechange=sbLLMstateChecker;
  }

  if( sbLLM_CommObject != null ){  
    //sbLLM_CommObject.open( 'POST', "https://api.openai.com/v1/chat/completions", true ); // false = async
    sbLLM_CommObject.open( 'POST', aiCallType, true ); // false = async

    key = "Bearer " + localStorage.getItem( "OpenAIKey");
    sbLLM_CommObject.setRequestHeader('Authorization', key );
    sbLLM_CommObject.setRequestHeader('Content-Type', "application/json" );

    sendLLMJSON.messages.push( sbBuildRoleContent( "user", input ) );
    jsonSENT = JSON.stringify( sendLLMJSON );

    sbLLM_CommObject.send( jsonSENT ); // send to server
    jsonSENT = JSON.stringify( sendLLMJSON, null, 2 ); //make it pretty for display
    var targ = document.getElementById("msgSENT");
    targ.innerHTML = jsonSENT;

    jsonLOG += jsonSENT;
    localStorage.setItem( "jsonLOG", jsonLOG );
    const sentMessage = {
      direction: 'sent',
      timestamp: new Date().toISOString(),
      content: jsonSENT,
    };

    conversationLOG.push(sentMessage);
    localStorage.setItem('conversationLog', JSON.stringify(conversationLOG));
  }
  useLLM = false;
}

function sbLLMstateChecker(){ // should something come in do this
  if( sbLLM_CommObject.readyState == 4 ){
    if( sbLLM_CommObject.status == 200 ){
      sbData = sbLLM_CommObject.responseText;
      if( sbData.length ){
        var textColor = localStorage.getItem('markerColor');
        retLLMJSON = JSON.parse(sbData);

        var text = retLLMJSON.choices[0].message.content;
        sendLLMJSON.messages.push( sbBuildRoleContent( "assistant", text ) );
        sbSpeak( text, assObj );
        var resp = `<span style='color:green;'>${text}</span>`;
        var responseDiv = document.getElementById("response");
        responseDiv.innerHTML = resp;

        jsonRECEIVED = JSON.stringify( retLLMJSON, null, 2 );
        var targ = document.getElementById("msgRECEIVED");
        targ.innerHTML = jsonRECEIVED;
        console.log(jsonRECEIVED);
        displayMsgRECEIVED(jsonRECEIVED, textColor); 
        var llmSENT = document.getElementById("llmSENT");
        var llmContent = JSON.stringify(retLLMJSON, null, 2);
        llmSENT.innerHTML = llmContent;
        jsonLOG += jsonRECEIVED;
        localStorage.setItem( "jsonLOG", jsonLOG );
        const receivedMessage = {
          direction: 'received',
          timestamp: new Date().toISOString(),
          content: jsonRECEIVED,
        };
        conversationLOG.push(receivedMessage);
        localStorage.setItem('conversationLog', JSON.stringify(conversationLOG));
      }
    }
  }
}
