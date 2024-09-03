var sbOVON_CommObject = null; // used to send http messages 
var retOVONJSON; // the "returned OVON message from an assistant"
var textColor = "#ffffff";
var voiceIndex ;
var sbTimeout = 10000;
var remoteURL = "";
var contentType = "application/json";
var jsonLOG;
var conversationLOG = [];
var isAssistantActive = false; // Flag to indicate if an assistant is currently speaking

//function sbPostToAssistant( assistantObject, OVONmsg ) { //send to their server
async function sbPostToAssistant( assistantObject, OVONmsg ) { //send to their server
  while (isAssistantActive) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
  }
  isAssistantActive = true;
  try {
    remoteURL = assistantObject.assistant.serviceAddress;
    assistType = remoteURL.split(':');
    textColor = assistantObject.assistant.markerColor;
    voiceIndex = assistantObject.assistant.voice.index;
    contentType = assistantObject.assistant.contentType;
    setAssistantNameElement(assistantObject);

    jsonSENT = JSON.stringify(OVONmsg, null, 2);
    if (assistType[0] == "internal") {
      callInternalAssistant(assistType[1], assistantObject, OVONmsg, true);
    } else if (assistType[0] == "internalLLM") {
      callInternalLLM(assistType[1], assistantObject, OVONmsg);
    } else if (assistType[0] == "internal" && assistType[1] == "basic") {
      callBasicAssistant(assistType[1], assistantObject, OVONmsg);
    } else {
      if (sbOVON_CommObject == null) {
        try {
          sbOVON_CommObject = new XMLHttpRequest();
        } catch (e) {
          sbOVON_CommObject = null;
          alert('Failed to make sandbox communication object');
          return false;
        }
        sbOVON_CommObject.onreadystatechange = sbOVONstateChecker;
      }
      if (sbOVON_CommObject != null) {
        sbOVON_CommObject.open('POST', remoteURL, true);
        if (contentType != "none") {
          sbOVON_CommObject.setRequestHeader('Content-Type', contentType);
        }
        sbOVON_CommObject.send(JSON.stringify(OVONmsg));
      }
    }
    displayMsgSent(jsonSENT);
  } finally {
    // Mark the assistant as inactive
    isAssistantActive = false;
  }
}

function displayMsgSent(jsonSENT){
  var targ = document.getElementById("msgSENT");
  if(targ){
    targ.innerHTML = jsonSENT; 
    const sentMessage = {
      direction: 'sent',
      timestamp: new Date().toISOString(),
      content: jsonSENT,
    };
    conversationLOG.push(sentMessage);
    logs = localStorage.setItem('conversationLog', JSON.stringify(conversationLOG));
    document.getElementById("utterance").value = "";    
    document.getElementById("whisper").value = "";
  }
}

function sbOVONstateChecker(){ // when POST response appears do this
  if( sbOVON_CommObject.readyState == 4 ){
    if( sbOVON_CommObject.status == 200 || sbOVON_CommObject.status == 201 ){
      sbData = sbOVON_CommObject.responseText;
      if( sbData.length ){
        var start = sbData.indexOf("{");
        var stop = sbData.lastIndexOf("}");
        var result;
        if( stop > start ){
          result = sbData.substring(start, stop+1);          
        }
        retOVONJSON = JSON.parse(result);
        //retOVONJSON = JSON.parse(sbData);
        handleReturnedOVON( retOVONJSON );
      }
    }
  }
}

function handleReturnedOVON( OVON_msg ){
  try {
    const jsonRECEIVED = JSON.stringify(OVON_msg, null, 2);
    localStorage.setItem('lastReceived', jsonRECEIVED);

    var targ = document.getElementById("msgRECEIVED");
    if (targ) {
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
      });

      // Wait for the display and logging operations to complete
      new Promise(resolve => requestAnimationFrame(resolve));
      serviceEventsOVON(OVON_msg);
    }
  } catch (error) {
    console.error('Error handling returned OVON:', error);
  }
}

function RenderResponseOVON( oneEvent, indx, arr ){
  // set some global values to process in different order if needed
  //   in the serviceEventsOVON calling function
  const type = oneEvent.eventType;
  if( type == "utterance" ){
    say = oneEvent.parameters.dialogEvent.features.text.tokens[0].value;
    displayResponseUtterance( say, textColor); // NOTE: This speaks too!
  }else if( type == "whisper"){
    hasKey = 'dialogEvent' in oneEvent.parameters;
    if(hasKey) {
      whisp = oneEvent.parameters.dialogEvent.features.text.tokens[0].value;
    }
    hasKey = 'concepts' in oneEvent.parameters;
    // do something with this???
  }else if( type == "proposeAssistant"){
  }else if( type == "findAssistant"){
  }else if( type == "publishManifest "){
  }else if( type == "requestManifest "){
  }
}

function serviceEventsOVON(OvonJson) {
  try {
    for (const event of OvonJson.ovon.events) {
      RenderResponseOVON(event);
    }
  } catch (error) {
    console.error('Error processing OVON events:', error);
  }
}

async function fetchFileJSON( fullFileName ) {
  try {
    const response = await fetch(fullFileName );
    const data = await response.json();
    return data;
  }catch (error) {
    throw error;
  }
}

async function fetchFileText( fullFileName ) {
  try {
    const response = await fetch(fullFileName );
    return response;
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