
// build the TTS Voice <select> html innerHTML string
function loadVoiceSelect() {
  var voices = speechSynthesis.getVoices();
  console.log(voices);
    var selCntl = '<br><label for="TTSVoices">Choose a TTS Voice:</label>';
    selCntl += '<select name="TTSVoices" id="sbTTS" onchange="saveTTSVoiceIndex();">';
    
    for (var i = 0; i < voices.length; i++) {
      if (i !== 115) {
        //var voiceName = voices[i].name;
        selCntl += '<option value="' + i + '">' + i + ": " + voices[i].name + '</option>';
      }
    }
    
    selCntl += "</select>";
    document.getElementById('information').innerHTML = selCntl;
    // var firstOptionValue = document.getElementById('sbTTS').options[0].value; // Set default index
    // localStorage.setItem('voiceSelection', firstOptionValue);
}

var lastSelectedVoices = [];
function updateSelectedVoiceInfo() {
  var ttsEngs = speechSynthesis.getVoices();
  var selectedIndex = document.getElementById('sbTTS').value;
  var selectedVoiceName;
  
  for (var j = 0; j < ttsEngs.length; j++) {
    if (j == selectedIndex && j !== 115) {
      var voiceName = ttsEngs[j].name;
        selectedVoiceName = j + ': ' + voiceName;
        break; // No need to continue the loop once the voice is found
    }
  }
  var selectedVoiceInfoElement = document.getElementById('selectedVoiceInfo');
  if (selectedVoiceName) {
    // Push the selected voice name into the array
    lastSelectedVoices.push(selectedVoiceName);
    // Keep only the last two selected voices in the array
    if (lastSelectedVoices.length > 10) {
      lastSelectedVoices.shift(); // Remove the oldest voice name
    }
    // Display the last 2 selected voices along with the current voice
    selectedVoiceInfoElement.innerHTML =
    '<br><b>Last Selected Voices: <br></b>' + lastSelectedVoices.join('</br>') + '\n';
  } else {
    selectedVoiceInfoElement.innerHTML = 'No voice selected.';
  }
}

function updateSpeechParams(param) {
    var value = parseFloat(document.getElementById(param).value);
    document.getElementById(param + 'Value').textContent = value.toFixed(1);

  var volume = parseFloat(document.getElementById("volume").value);
  var rate = parseFloat(document.getElementById("rate").value);
  var pitch = parseFloat(document.getElementById("pitch").value);
  console.log("Volume:", volume, "Rate:", rate, "Pitch:", pitch);
  var msg = new SpeechSynthesisUtterance();
  msg.volume = volume;  // 0 to 1
  msg.rate = rate;      // 0.1 to 10
  msg.pitch = pitch;    // 0 to 2

  // Get the selected voice index
  var selectedIndex = document.getElementById('sbTTS').value;

  // Ensure voices are available
  var voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Ensure the selected voice index is within bounds
    selectedIndex = Math.min(Math.max(0, selectedIndex), voices.length - 1);

    // Set the selected voice for the utterance
    msg.voice = voices[selectedIndex];
  } else {
    console.error("No voices available.");
  }

  // Test the updated voice settings
  msg.text = document.getElementById('sbTTS_Text').value;

  // Cancel any ongoing speech synthesis
  window.speechSynthesis.cancel();

  // Speak the new utterance with updated parameters
  window.speechSynthesis.speak(msg);
}


function saveTTSVoiceIndex() {  
  var vInd = parseInt(document.getElementById("sbTTS").value, 10);
  var voices = speechSynthesis.getVoices().filter(function(voice) {
    return voice.name;
  });

  if (voices.length>0 && vInd >= 0 && vInd < voices.length) {
    var selectedVoice = voices[vInd];
    assistantObject.assistant.voiceIndex = vInd;
  } else {
    console.error("Invalid voice index:", vInd);
  }
  say = document.getElementById("sbTTS_Text").value;
 
  console.log("Selected voice:", selectedVoice);
  updateSelectedVoiceInfo();
  sbSpeak(say ,assistantObject);
}

function saveTTS_TestText() { // allow setting a "test phrase" to be set
  var test =  document.getElementById("sbTTS_Text").value;
  test += " ";
  localStorage.setItem( "sbTTSTestPhrase", test );
  updateSelectedVoiceInfo();
  sbSpeak(test, assistantObject);
}

function updateVoiceSettings() {
    var selectedAssistant = assistantObject.assistant;
  
    var selectedAssistantIndex = assistantTable.findIndex(assistant => assistant.assistant.name === selectedAssistant.name);
  
    // Update the voiceIndex property with the selected voice index
    selectedAssistant.voiceIndex = assistantObject.assistant.voiceIndex;
  
    selectedAssistant.pitch = parseFloat(document.getElementById("pitch").value);
    selectedAssistant.volume = parseFloat(document.getElementById("volume").value);
    selectedAssistant.rate = parseFloat(document.getElementById("rate").value);
  

    localStorage.setItem('assistantTable', JSON.stringify(assistantTable));
  
    // Update the selected assistant in the assistantTable
    if (selectedAssistantIndex !== -1) {
        assistantTable[selectedAssistantIndex].assistant = selectedAssistant;
  
        // Save the updated assistantTable to localStorage
        localStorage.setItem('assistantTable', JSON.stringify(assistantTable));
  
        // Send a PUT request to update the server-side JSON file
        fetch('../Support/ActiveAssistantList.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assistantTable, null, 2), // Send the updated assistant data
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Error updating assistant on the server:', error);
        });
    } else {
        console.error('Selected assistant not found in the assistantTable.');
    }
    bareInviteWindow();
}