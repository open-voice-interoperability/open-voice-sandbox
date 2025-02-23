// File: sbSpeech.js
/*
This JavaScript code is integrates voice recognition and text to speech.

Variables and Constants

  voices: Array of available speech synthesis voices.
  recognition: The ASR interface, using browser's native SpeechRecognition or webkitSpeechRecognition object.
  assistantName: The active assistant.
  usingASR and usingTTS: Flags indicating Automatic Speech Recognition (ASR) and Text-to-Speech (TTS) are in use.

Functions

sbStartASR()
  -Sets usingASR to true and starts the speech recognition process.
  -Changes the microphone icon to indicate the system is listening.

speechSynthesis.onvoiceschanged
  -Updates the voices array when voices change.

recognition.onresult
  -Event fired when speech recognition has results.
  -Retrieves the spoken text, cleans, stores, and optionally posts it to an LLM or other handler.

sbSpeak(say, assistantObject)
  -Converts text to speech using the TTS engine.
  -Selects a voice based on the assistant's preferences.

processOtherEvents(eventArray, assistantObject, thisSay)
  -Manages additional events that may be part of the interaction.

sbTypeInput(inputHTMLID)
  =Processes typed text into the system's workflow.

Key Integration Points

Speech Recognition Start/End:
  -Managed via the sbStartASR function and recognition.onresult handler.

TTS Execution:
  -The sbSpeak function is where text is converted to speech. It sets TTS parameters (rate, volume, and pitch).
*/

var voices = [];
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
speechSynthesis.onvoiceschanged = function() {
  voices = speechSynthesis.getVoices();
};
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
  var conf = event.results[0][0].confidence.toFixed(3);
  
  var wc = "assistantBrowser";
  var shortASR = shortenString( finalAsrText, 55 );

//console.log("asrOnReco-finalAsrText", finalAsrText); // ejcDBG
  if( useLLM ){
    sbPostToLLM( finalAsrText );
  }else{ // do the floor redirect if needed
    handleInput( finalAsrText );
  }
}

function cleanOutPunctuation( str ){
  str = str.replace( "?", "" );
  str = str.replace( ".", "" );
  str = str.replace( ",", "" );
  str = str.replace( "!", "" );
  return str;
}

function getVoiceIndex( voiceURI ){
  voices = speechSynthesis.getVoices();
  voiceIndex = voices.findIndex(voice => voice.name === voiceURI );
}

var voiceIndex =0;
async function checkIndex(assistantObject){
  await new Promise(resolve => {
    if (voices.length > 0) {
        resolve();
    } else {
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            resolve();
        };
    }
});
  try {
    const response = await fetch('../Support/ActiveAssistantList.json');
    const data = await response.json();

    let assistantToUpdate = data.find(assistant => assistant.assistant.name === assistantObject.assistant.name);
    
    if (assistantToUpdate) {
      if (assistantToUpdate.assistant.voice && assistantToUpdate.assistant.voice.name) {
        voiceIndex = voices.findIndex(voice => voice.name === assistantToUpdate.assistant.voice.name);
        if (voiceIndex !== -1) {
          assistantToUpdate.assistant.voice.index = voiceIndex;
          await fetch('../Support/ActiveAssistantList.json', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data, null, 2),
          });
        } else {
          // Voice name not found in the voices list, update to default values
          console.log("Voice name not found in the voices list:", assistantToUpdate.assistant.voice.name);
          var defaultVoiceIndex = assistantToUpdate.assistant.voice.index;
          
          if (voices[defaultVoiceIndex]) {
            const defaultVoice = voices[defaultVoiceIndex];
            assistantToUpdate.assistant.voice.name = defaultVoice.name;
            assistantToUpdate.assistant.voice.lang = defaultVoice.lang;
            assistantToUpdate.assistant.voice.index = defaultVoiceIndex;
          }

          await fetch('../Support/ActiveAssistantList.json', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data, null, 2),
          });

          voiceIndex = defaultVoiceIndex;
        }
        
        return voiceIndex;
      } else {
        console.log("Voice name not found in the assistant data:", assistantToUpdate.assistant.voice);
        return null;
      }
    } else {
      console.log("Assistant not found in the JSON data.");
      return null;
    }
  } catch (error) {
    console.error('Error fetching/updating JSON data:', error);
    return null;
  }
}

pendingSpeech = null;
nonPendingOvon = null;
async function sbSpeak( say, assistantObject ) {
  if(speechSynthesis.speaking){ // say it after ongoing tts finishes
    pendingSpeech = {
      "assistant": assistantObject,
      "retOvon" : retOVONJSON,
      "say": say
    }
  }else{
    nonPendingOvon = retOVONJSON;
  // var vOG = 2; // Default to index=2
    var aColor = "#555555";
    var voices = speechSynthesis.getVoices();
    if (assistantObject) {
      const updatedVoiceIndex = await checkIndex(assistantObject);
      if (updatedVoiceIndex !== null) {
        assistantObject.assistant.voice.index = updatedVoiceIndex;
      }

      // vOG = assistantObject.assistant.voice.index;

      if (sbBrowserType === "chromium based edge" || sbBrowserType === "safari" || sbBrowserType === "chrome") {
          vOG = assistantObject.assistant.voice.index;
      } else {
          console.error("Browser not supported"); // Message on the html page too?
          return;
      }

      aColor = assistantObject.assistant.markerColor;
      vOG = Math.min(Math.max(0, vOG), voices.length - 1); // v within bounds
      
      //TESTING 
      var assistantVoice = voices[vOG];
      var name = voices[vOG].name;
      var lang = voices[vOG].lang;
      // console.log(`Using voice - Name: ${name}, Lang: ${lang}`);
      // console.log(`Assistant details - Name: ${assistantObject.assistant.name}, Voice Index: ${vOG}`);
      
      const delim = say.indexOf("<<<EMBED_");
      if (delim !== -1) {
        say = say.substring(0, delim);
      }
    
      var msg = new SpeechSynthesisUtterance(say);
      msg.voice = voices[vOG];
      
      // Set rate, volume, and pitch from the assistantObject
      msg.rate = parseFloat(assistantObject.assistant.rate) || 1;
      msg.volume = parseFloat(assistantObject.assistant.volume) || 1;
      msg.pitch = parseFloat(assistantObject.assistant.pitch) || 1;

      msg.onend = function (event) {
        startTime = new Date().getTime();
        if (!isOnVoicesPage()) {
          /*if (retOVONJSON && retOVONJSON.ovon) {
            ovonToSend = processOtherEvents(retOVONJSON.ovon.events, assistantObject, say);
            // spPost the OVON
          } else {
              console.error("Invalid OVON JSON structure");
          }*/
          if (nonPendingOvon && nonPendingOvon.ovon) {
              ovonToSend = processOtherEvents(nonPendingOvon.ovon.events, assistantObject, say);
              // spPost the OVON
          } else {
              console.error("Invalid OVON JSON structure");
          }
          if( pendingSpeech ){
            retOVONJSON = pendingSpeech.retOvon; // not sure if this has an asysc issue too
            sbSpeak( pendingSpeech.say, pendingSpeech.assistant );
            pendingSpeech = null;
          }
        }
      };
      // console.log('Assistant Object:', assistantObject);
      // console.log('SpeechSynthesisUtterance Properties:', msg);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    } else {
        console.error("Invalid Assistant");
    }
  }
}
  
// Function to check if the current page is sbVoices.html
function isOnVoicesPage() {
  return window.location.pathname.includes("sbVoices.html");
}
  
function processOtherEvents( eventArray, assistantObject, thisSay ){
  if (!Array.isArray(eventArray) || eventArray.length === 0) {
    console.error("eventArray is not an array or is empty.");
    return;
  }

  var shortMessage;
  var whispIndex = eventArray.findIndex(event => event && event.eventType === "whisper");
  var eventWithoutType;

  if (whispIndex !== -1) {
    for (let i = whispIndex; i < eventArray.length; i++) {
      const event = eventArray[i];
      if (event && event.eventType === "whisper") {
        var { eventType, ...eventWithoutType } = event;
      }
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
    shortACtion = "[New CONN]";
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
    shortACtion = "[New CONN]";
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
