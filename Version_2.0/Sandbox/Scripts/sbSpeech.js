// File: sbSpeech.js
var voices = speechSynthesis.getVoices();
var recognition = window.SpeechRecognition || window.webkitSpeechRecognition ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() : null;
var assistantName = localStorage.getItem('assistantName');
//var using_ejTalkCM = true;
var retASR = "";
var startTime = "";
var endTime = "";

//var uttOVON_XML = "";
var uttOVON_JSON = "";
var usingASR = false;
var usingTTS = true;
var useLLM = false;

function sbStartASR(){
  usingASR = true;
  startTime = new Date().getTime();
  var img = document.getElementById('microphoneIcon');
  img.src = "../Media/img/micListening.jpg";
  recognition.start();
}

recognition.onresult = function(event) {
  var nbestCnt = 0; //nBests in the future?
  var finalAsrText="";
  var conf = 1.0;

  var exdate=new Date();
  endTime = exdate.getTime();

  var img = document.getElementById('microphoneIcon');
  img.src = "../Media/img/Interoperability_Logo_icon_color.jpg";

  usingASR = false; // so you can type for the next turn
  // Builds JSON object for utterance
  // Pass it to ejTalk Conversation Manager

  var uttCount = localStorage.getItem( "uttCount" );
  localStorage.setItem( "uttCount", ++uttCount );
  var finalAsrText = event.results[0][0].transcript;
  finalAsrText = cleanOutPunctuation( finalAsrText);
  localStorage.setItem( "sbLastInputUTT", finalAsrText );
  document.getElementById("utterance").value = finalAsrText;
  var conf = event.results[0][0].confidence;
  conf += .01; // So "0" doesn't lead to disregarding it
  conf = conf.toFixed(3);
  
  var wc = "assistantBrowser";
  var shortASR = shortenString( finalAsrText, 55 );

  if( useLLM ){
    sbPostToLLM( finalAsrText );
  }else{ // do the floor redirect if needed
    handleInput( finalAsrText );
  }
}

function handleInput(message, whisper, isText, isWhisper){
  var concepts = searchConcept(message);
  if( concepts ){
      //if( concepts && false ){
    floor = processFloorEvents( concepts );
    if( floor ){
      sbFloorEvents( floor , message, whisper, isText, isWhisper); // do the return or delegate
    }else{
      sendReply(message, isWhisper, isText, false, whisper); // just do what we always did before
    }
  }else{
    sendReply(message, isWhisper, isText, false, whisper);
  }
}

function cleanOutPunctuation( str ){
  str = str.replace( "?", "" );
  str = str.replace( ".", "" );
  str = str.replace( ",", "" );
  str = str.replace( "!", "" );
  return str;
}

function sbSpeak( say, assistantObject ) {
  var v = 2; // Default to index=2
  var aColor = "#555555";
  var voices = speechSynthesis.getVoices();
  if (assistantObject) {
    v = assistantObject.assistant.voiceIndex;

    if (sbBrowserType === "chromium based edge" || sbBrowserType === "safari" || sbBrowserType === "chrome") {
        v = assistantObject.assistant.voiceIndex;
    } else {
        console.error("Browser not supported"); // Message on the html page too?
        return;
    }

    aColor = assistantObject.assistant.markerColor;
    v = Math.min(Math.max(0, v), voices.length - 1); // v within bounds

    var msg = new SpeechSynthesisUtterance(say);
    msg.voice = voices[v];
    
    // Set rate, volume, and pitch from the assistantObject
    msg.rate = parseFloat(assistantObject.assistant.rate) || 1;
    msg.volume = parseFloat(assistantObject.assistant.volume) || 1;
    msg.pitch = parseFloat(assistantObject.assistant.pitch) || 1;

    // msg.onend = function (event) {
        startTime = new Date().getTime();
        if (!isOnVoicesPage()) {
            if (retOVONJSON && retOVONJSON.ovon) {
                ovonToSend = processOtherEvents(retOVONJSON.ovon.events, assistantObject, say);
                // spPost the OVON
            } else {
                console.error("Invalid OVON JSON structure");
            }
        }
    // };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  } else {
      console.error("Invalid Assistant");
  }
}
  
  // Function to check if the current page is sbVoices.html
  function isOnVoicesPage() {
    return window.location.pathname.includes("sbVoices.html");
  }
  function processFloorEvents( conceptJSON ){
    var redirect = "";
    var concept = "";
    var floorDirectives = {
      "redirect": "",
      "assistantName": ""
    };
    let delegate = false;
    if (conceptJSON ) {
      for( i=0; i<conceptJSON.length;i++){
        concept = conceptJSON[i].concept;
        if( concept == "return"){
          redirect = concept;
          floorDirectives.redirect = concept;
        }else if( concept == "delegate" && redirect == ""){
          redirect = concept;
          floorDirectives.redirect = concept;
        }else if( concept == "assistantName"){
          floorDirectives.assistantName = conceptJSON[i].matchedWords[0];
        }
      };
    }
    if( redirect.length ){
      return floorDirectives;
    }else{
      return null;
    }
  }
  
function processOtherEvents( eventArray, assistantObject, thisSay ){
  var shortMessage;
  var whispIndex = ( eventArray.findIndex(event =>event.eventType === "whisper"));
  var eventWithoutType;
  for (let i = whispIndex; i < eventArray.length; i++) {
    const event = eventArray[i];
    if( event && event.eventType === "whisper"){
          var { eventType, ...eventWithoutType } = event
    }
  }
  if(eventArray[0].eventType === "whisper"){
    shortMessage = "utterance[TTS] w/ whisper";
  }else{
    shortMessage = "utterance[TTS]";
  }
  
  var longMessage = "Send text to be spoken on the Client";
  var shortACtion = "";
  var longAction = "";
  var agentName = assistantObject.assistant.name;
  var cmdSummary = eventSummary( eventArray );
  var referCmd = false;

  if( cmdSummary.invite){
    referCmd = true;
    // build OVON for the invite
    shortMessage +="/bare-invite"
    if( cmdSummary.whisperText.length > 0){
      // add whisper for the adorned-invite
      shortMessage +="/adorned-invite"
    }
    longMessage += "/Send info for client to connect to the next Assistant"
    shortACtion = "[[New CONN]]";
    longAction = "Initiate the new connection to the delegated Assistant";
  }else if( cmdSummary.bye){
    referCmd = true;
    // build OVON for return to the previous Assistant
    shortMessage +="/bare-bye"
    if( cmdSummary.whisperText.length > 0){
      // add whisper for the adorned-bye
      shortMessage +="/adorned-bye"
    }
    longMessage += "/Setup reconnection to the previous Assistant"
    shortACtion = "[[New CONN]]";
    longAction = "Delegate to previous Assistant";
  }

  var wc = "assistantBrowser";
  var shortSay = shortenString( thisSay, 55 );
  returnSeqDiag(wc, agentName, shortMessage, longMessage, shortSay, thisSay, eventWithoutType);
}

function shortenString( someString, finalLen ){
  var short = "";
  if( someString.length > finalLen ){
    short = someString.substr( 0, finalLen );
  }else{
    short = someString;
  }
  return short;
}

function sbTypeInput( inputHTMLID ) {
  var typedText = document.getElementById( inputHTMLID ).value;
  localStorage.setItem( "sbLastInputUTT", typedText );

  if ( typedText != null && typedText != "" ){
  }
}
