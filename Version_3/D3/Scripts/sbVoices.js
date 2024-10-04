var lastSelectedVoices = []; //used in updateSelectedVoiceInfo()

// build the TTS Voice <select> html innerHTML string
function loadVoiceSelect() {
  var voices = speechSynthesis.getVoices();

  // Check if voices are available
  if (voices.length > 0) {
    updateVoiceSelectOptions(voices);
  } else {
    // If voices are not available, wait for the onvoiceschanged event
    speechSynthesis.onvoiceschanged = function () {
      voices = speechSynthesis.getVoices();
      updateVoiceSelectOptions(voices);
    };
  }
}

function updateVoiceSelectOptions(voices) {
  var selCntl = '<br><label for="TTSVoices">Choose a TTS Voice:</label>';
  selCntl += '<select name="TTSVoices" id="sbTTS" onchange="saveTTSVoiceIndex();">';

  for (var i = 0; i < voices.length; i++) {
      selCntl += '<option value="' + i + '">' + i + ": " + voices[i].name + '</option>';
  }
  selCntl += "</select>";
  document.getElementById('information').innerHTML = selCntl;
  var savedVoiceIndex = localStorage.getItem('voiceSelection');
  if (savedVoiceIndex !== null) {
    document.getElementById('sbTTS').value = savedVoiceIndex;
  }

  updateSelectedVoiceInfo();
}


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
    assistantObject.assistant.voice.index = vInd;
    localStorage.setItem('voiceSelection', vInd); // Save the selected voice index
    updateSelectedVoiceInfo();
  
  say = document.getElementById("sbTTS_Text").value;
 
  console.log("Selected voice:", selectedVoice);
  updateSpeechParams('volume'); // This will use the current volume, rate, and pitch to speak the text
  }else {
    console.error("Invalid voice index:", vInd);
  }
}
