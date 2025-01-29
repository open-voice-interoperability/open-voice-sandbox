var sbOVON_CommObject = null; // used to send http messages 
var retOVONJSON; // the "returned OVON message from an assistant"
var textColor = "#ffffff";
var voiceIndex ;
var sbTimeout = 10000;
var remoteURL = "";
var contentType = "application/json";
var jsonLOG;
var conversationLOG = [];

function sbRawManifestRequest( assistantURL, OVONmsg ) { //send to their server
  assistType = assistantURL.split(':');

  //if( assistType[0] == "internal"  && assistType[1] == "discovery"){
  if( assistType[0] == "internal" ){
    callInternalAssistant( assistType[1], assistantObject, OVONmsg );
  }else if( assistType[0] == "internalLLM" ){
    callInternalLLM( assistType[1], assistantObject, OVONmsg );
  }else if( assistType[0] == "internal" && assistType[1] == "basic" ){
    callBasicAssistant( assistType[1], assistantObject, OVONmsg );
  }else if( assistType[0] == "internal" && assistType[1] == "cassandra" ){
    callCassandra( assistType[1], assistantObject, OVONmsg );
  }else{
    if( sbOVON_CommObject == null ){
      try{
        sbOVON_CommObject = new XMLHttpRequest();
      }catch(e){
        sbOVON_CommObject = null;
        alert( 'Failed to make sandbox communication object' );
        return false;
      }
      sbOVON_CommObject.onreadystatechange=sbOVONManReqstateChecker;
    }
    if( sbOVON_CommObject != null ){  
      sbOVON_CommObject.open( 'POST', assistantURL, true ); // false makes it async
      sbOVON_CommObject.setRequestHeader('Content-Type', 'application/json');
      var jStr = JSON.stringify( OVONmsg );
      sbOVON_CommObject.send( jStr ); // send to server
      //sbOVON_CommObject.send( JSON.stringify( OVONmsg ) ); // send to server
    }
  }
}

function sbOVONManReqstateChecker(){ // when POST response appears do this
  if( sbOVON_CommObject.readyState == 4 ){
    if( sbOVON_CommObject.status == 200 || sbOVON_CommObject.status == 201 ){
      sbData = sbOVON_CommObject.responseText;
      if( sbData.length ){
        retOVONJSON = JSON.parse(sbData);
        displayAssistantViaManifest( retOVONJSON );
      }
    }
  }
}

function sbPostToAssistant( assistantObject, OVONmsg ) { //send to their server
  remoteURL = assistantObject.assistant.serviceAddress;
  assistType = remoteURL.split(':');

  textColor = assistantObject.assistant.markerColor;
  voiceIndex = assistantObject.assistant.voiceIndex;

  contentType = assistantObject.assistant.contentType;
  setAssistantNameElement( assistantObject ); // this replaces following lines
  
  jsonSENT = JSON.stringify( OVONmsg, null, 2 );

  if( assistType[0] == "internal"  && assistType[1] == "discovery"){
    callInternalAssistant( assistType[1], assistantObject, OVONmsg );
  }else if( assistType[0] == "internalLLM" ){
    callInternalLLM( assistType[1], assistantObject, OVONmsg );
  }else if( assistType[0] == "internal" && assistType[1] == "basic" ){
    callBasicAssistant( assistType[1], assistantObject, OVONmsg );
  }else if( assistType[0] == "internal" && assistType[1] == "cassandra" ){
    //callCassandra( assistType[1], assistantObject, OVONmsg );
    callInternalAssistant( assistType[1], assistantObject, OVONmsg );
  }else{
    if( sbOVON_CommObject == null ){
      try{
        sbOVON_CommObject = new XMLHttpRequest();
      }catch(e){
        sbOVON_CommObject = null;
        alert( 'Failed to make sandbox communication object' );
        return false;
      }
      sbOVON_CommObject.onreadystatechange=sbOVONstateChecker;
    }
    if( sbOVON_CommObject != null ){  
      sbOVON_CommObject.open( 'POST', remoteURL, true ); // false makes it async
      sbOVON_CommObject.send( JSON.stringify( OVONmsg ) ); // send to server
    }
  }

  var targ = document.getElementById("msgSENT");
  targ.innerHTML = jsonSENT; 
  const sentMessage = {
    direction: 'sent',
    timestamp: new Date().toISOString(),
    content: jsonSENT,
  };
  conversationLOG.push(sentMessage);
  logs = localStorage.setItem('conversationLog', JSON.stringify(conversationLOG));
}

function sbOVONstateChecker(){ // when POST response appears do this
  if( sbOVON_CommObject.readyState == 4 ){
    if( sbOVON_CommObject.status == 200 || sbOVON_CommObject.status == 201 ){
      sbData = sbOVON_CommObject.responseText;
      if( sbData.length ){
        retOVONJSON = JSON.parse(sbData);
        handleReturnedOVON( retOVONJSON );
      }
    }
  }
}

function handleReturnedOVON( OVON_msg ){
  jsonRECEIVED = JSON.stringify( OVON_msg, null, 2 );
  const myArray = jsonRECEIVED.split("\n");

  var targ = document.getElementById("msgRECEIVED");
  targ.innerHTML = jsonRECEIVED;
  displayMsgRECEIVED(jsonRECEIVED, assistantObject.assistant.markerColor);
  requestAnimationFrame(function() {
    const receivedMessage = {
        direction: 'received',
        timestamp: new Date().toISOString(),
        content: jsonRECEIVED,
    };

  conversationLOG.push(receivedMessage);
  localStorage.setItem('conversationLog', JSON.stringify(conversationLOG));
  serviceEventsOVON( OVON_msg );
  });
}

function RenderResponseOVON( oneEvent, indx, arr ){
  // set some global values to process in different order if needed
  //   in the serviceEventsOVON calling function
  const type = oneEvent.eventType;
  if( type == "utterance" ){
    say = oneEvent.parameters.dialogEvent.features.text.tokens[0].value;
    displayResponseUtterance( say, textColor); // NOTE: This speaks too!
  }else if( type == "bye"){
  }
}

function serviceEventsOVON( OvonJson ){
  OvonJson.ovon.events.forEach(RenderResponseOVON);
}

async function fetchFileJSON( fullFileName ) {
  functionList.push('fetchFileJSON()');

  try {
    const response = await fetch(fullFileName );
    const data = await response.json();
    return data;
  }catch (error) {
    throw error;
  }
}

var transferFileData;
function readSBFile( pathFromRoot, callBackFunction ){
  var url = pathFromRoot;
  transferFileData = "sbWait";
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onreadystatechange = function() {
      if (request.readyState === 4) {  // document is ready to parse.
          if (request.status === 200) {  // file is found
            callBackFunction( request.responseText );
            //transferFileData = request.responseText;
          }
      }
  }
  request.send();
}

function writeSBFile( fileName, data, directory ){
  const fullPath = `../Report/${directory}/${fileName}`;

  fetch(fullPath, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  })
  .then(response => {
    if (response.ok) {
      console.log(`File written successfully in ${directory} directory:`, fileName);
    } else {
      console.error(`Failed to write file in ${directory} directory:`, fileName);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function getDirectoryList( pathFromRoot ){
  var url = pathFromRoot;
  var request = new XMLHttpRequest();
  readFileData = "";
  request.open("POST", url, true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
      if (request.readyState === 4) {  // document is ready to parse.
          if (request.status === 200) {  // file is was written???
            readFileData = request.responseText;
          }
      }
  }
  fType = "sbDirectory"
  request.send(fType);
}