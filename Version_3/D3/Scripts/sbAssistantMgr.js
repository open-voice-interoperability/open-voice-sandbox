var selectedAssistantIndex = 0;
var assistantObject ;

function sbGetAgentParams( someAgentName ){ //return object for this agent
  for (let i = 0; i < assistantTable.length; i++) {
    if( assistantTable[i].assistant && assistantTable[i].assistant.name === someAgentName ){
      return assistantTable[i];
    }
  }
}

function highlightSelectedAssistant(markerColor) {
  const hslColor = hexToHSL(markerColor);
  const assistantListDiv = document.getElementById('assistantList');
  if (assistantListDiv) {
      // Remove existing highlighting
      const highlightedElement = assistantListDiv.querySelector('.highlighted');
      if (highlightedElement) {
          highlightedElement.classList.remove('highlighted');
          highlightedElement.style.backgroundColor = '';
      }

      // Find the selected assistant and apply highlighting
      const selectedAssistantName = assistantObject.assistant.name;
      console.log('selectedAssistantName:', selectedAssistantName);
      let found = false;
      const assistantElements = assistantListDiv.getElementsByTagName('p');
      for (const element of assistantElements) {
          if (element.textContent === selectedAssistantName) {
            console.log('Highlighting element:', element);
            element.classList.add('highlighted');
              element.style.backgroundColor = `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
              found = true;
              break; // No need to continue iterating once highlighted
          }
      }
      if (!found) {
        console.log('Assistant not found in the list');
    }
  }
}

var assistantStack = [];
async function fetchAssistantData() {
  try {
    const response = await fetch("../Support/ActiveAssistantList.json");
    const manifest = await fetch("../Support/manifest.json");
    const manifestData = await manifest.json();
    const data = await response.json();
    const transformedData = data.map(item => ({ assistant: item }));
    const excludedData = transformedData.slice(2); // Exclude the first two items
    localStorage.setItem('assistantStack', JSON.stringify(excludedData));
    localStorage.setItem('fullAssistantList', JSON.stringify(transformedData));
    const assistantListDiv = document.getElementById('assistantList');
  if (assistantListDiv) {
      assistantListDiv.innerHTML = '<h3 style="margin-bottom: -6px; margin-top: -6px; text-align:center">Assistants To Transfer To:</h3>';
      excludedData.forEach(item => {
          const assistantName = item.assistant.assistant.name;
          const keywords = getKeywordsForAssistant(assistantName, manifestData);
          assistantListDiv.innerHTML += `<p style="margin-bottom: -10px; text-align:center; font-weight: bold;">${assistantName}</p>`;

          if (keywords.length > 0) {
            assistantListDiv.innerHTML += `<p style="margin-bottom: -10px; text-align:center">{${keywords.join(', ')}}</p>`;
          }
        });
  }

    return data;
  } catch (error) {
    throw error;
  }
}
function getKeywordsForAssistant(assistantName, manifestData) {
  const lowerCaseAssistantName = assistantName.toLowerCase(); // Convert assistant name to lowercase
  const assistant = manifestData.assistants.find(assistant => {
    // Convert both the name in the manifest and the provided name to lowercase for case-insensitive comparison
    const lowerCaseManifestName = assistant.identification.conversationalName.toLowerCase();
    return lowerCaseManifestName === lowerCaseAssistantName;
  });
  if (assistant) {
    // Return only the first three keywords, if available
    return assistant.capabilities.keyphrases.slice(0, 3);
  } else {
    return [];
  }
}

async function initializeAssistantData(callback) {
  try {
    const data = await fetchAssistantData();
    assistantTable = data;
    selectedAssistantIndex = localStorage.getItem("currentAssistantIndex");
    assistantObject = assistantTable[selectedAssistantIndex];
    loadAssistantSelect();

    if (typeof callback === 'function') {
      callback();
    }
  } catch (error) {
    console.error('Error fetching assistant data:', error);
  }
}

//build the Assistant <select> html innerHTML string
function loadAssistantSelect() {
  var assistantSelect = document.getElementById('assistantSelect');

  if (assistantSelect) {
    var selCntl = '<label style="font-size: 18px;" for="sbAssist">Choose an Assistant:</label>';
    selCntl += '<select name="startAssistant" id="sbAssist" onchange="saveAssistantIndex();">';
    selCntl += '<option value="" disabled selected>Select an Assistant</option>';

    for (var i = 2; i < assistantTable.length; i++) { // note avoid the first two
      selCntl += '<option value="';
      selCntl += i;
      selCntl += '">';
      selCntl += i + ": " + assistantTable[i].assistant.displayName;
      selCntl += '</option>';
    }
    selCntl += "</select>";

    assistantSelect.innerHTML = selCntl;
  } else {
      return;
      }
}

function saveAssistantIndex() {  
  selectedAssistantIndex = document.getElementById("sbAssist").selectedIndex;
  selectedAssistantIndex = selectedAssistantIndex >= 2 ? selectedAssistantIndex + 1 : 2; 
  localStorage.setItem( "currentAssistantIndex", selectedAssistantIndex );
  handleAssistantSelectionChange();
 }
    // Function to handle assistant selection change
function handleAssistantSelectionChange() {
      var selectedAssistantIndex = document.getElementById("sbAssist").value;
      selectedAssistantIndex = localStorage.getItem("currentAssistantIndex");
      if (selectedAssistantIndex !== "") {
        // Assistant is selected, show the settings
        document.getElementById("assistantSettings").style.display = "block";
    
        var selectedAssistant = assistantTable[selectedAssistantIndex].assistant;
        localStorage.setItem("assistantName", selectedAssistant.name);
    
        // assistantObject = sbGetAgentParams(selectedAssistant.name);
        displayAssistantSettings();
      } else {
        // No assistant selected, hide the settings
        document.getElementById("assistantSettings").style.display = "block";
      }
    }

function generateRandomID() {
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const getRandomChar = (characters) =>
        characters.charAt(Math.floor(Math.random() * characters.length));
    
      const randomID =
        getRandomChar(letters) +
        getRandomChar(letters) +
        getRandomChar(numbers) +
        getRandomChar(numbers);
    
      return randomID;
    }

function getAssistantID(assistantName) {
  // Retrieve the ID from localStorage, or generate a new one if it doesn't exist
  let assistantID = localStorage.getItem(`${assistantName}_assistantID`);
  if (!assistantID) {
    assistantID = `${assistantName}_${generateRandomID()}`;
    localStorage.setItem(`${assistantName}_assistantID`, assistantID);
  }
  return assistantID;
}

// Function to display assistant settings
function displayAssistantSettings() {
  var selectedAssistantIndex = document.getElementById("sbAssist").value;
  var selectedAssistant = assistantTable[selectedAssistantIndex];
  const uniqueID = getAssistantID(selectedAssistant.assistant.name);

  // Modify this part based on your settings structure
  var settingsHTML = `
  <div>

  <h2>${selectedAssistant.assistant.name}'s Settings</h2>
  <div>
    <label for="assistantName"><b>Display Name:</b></label>
    <input type="text" id="assistantName" value="${selectedAssistant.assistant.displayName}">
  </div>
  <div>
    <label for="spokenName"><b>Spoken Name:</b></label>
    <input type="text" id="spokenName" value="${selectedAssistant.assistant.name}">
  </div>
  <div>
            <label for="assistantID"><b>Assistant ID:</b></label>
            <input type="text" id="assistantID" value="${uniqueID}">
        </div>
  <div>
  <label for="voiceIndex"><b>Voice Index:</b></label>
  <input type="text" id="voiceIndex" value="${selectedAssistant.assistant.voice.index}">

  <button id="voiceSelect" class="load-voices" onclick="openWindow('sbVoices.html')">Load Voices</button>
  </div>
  <div>
      <label for="markerColor"><b>Marker Color:</b></label>
      <input type="color" id="markerColor" value="${selectedAssistant.assistant.markerColor}">
  </div>
  <div>
      <label for="serviceName"><b>Service Name:</b></label>
      <input type="text" id="serviceName" value="${selectedAssistant.assistant.serviceName}">
  </div>
  <div>
      <label for="serviceAddress"><b>Service Address:</b></label>
      <input type="text" id="serviceAddress" value="${selectedAssistant.assistant.serviceAddress}">
      </div>
  <div>
      <label for="authCode"><b>Auth Code:</b></label>
      <input type="text" id="authCode" value="${selectedAssistant.assistant.authCode}">
      </div>
  <div>
      <label for="contentType"><b>Content Type:</b></label>
      <input type="text" id="contentType" value="${selectedAssistant.assistant.contentType}">

      </div>
  <button id="updateSettingsButton" class="update-settings" onclick="updateAssistantSettings()"><b>Update Assistant Settings</b></button>
  </div>
  <div id="updateMessage" class="update-message"></div>
  `;

  // Display settings and input fields in a single box
  document.getElementById("assistantSettings").innerHTML = settingsHTML;
}

var updateClicked = false;
// Function to update the assistant settings based on user input
function updateAssistantSettings() {
  updateClicked = true;
  var selectedAssistantIndex = document.getElementById("sbAssist").value;
  var selectedAssistant = JSON.parse(
    JSON.stringify(assistantTable[selectedAssistantIndex].assistant)
  );
  
  selectedAssistant.displayName = document.getElementById("assistantName").value;
  selectedAssistant.name = document.getElementById("spokenName").value;
  
  // Update voice settings
  var selectedVoiceIndex = parseInt(document.getElementById("voiceIndex").value, 10);
  var voices = speechSynthesis.getVoices();

  if (voices.length > 0) {
    updateVoiceSettings(selectedAssistant, selectedVoiceIndex, voices);
  } else {
    // If voices are not available, wait for the onvoiceschanged event
    speechSynthesis.onvoiceschanged = function () {
      voices = speechSynthesis.getVoices();
      updateVoiceSettings(selectedAssistant, selectedVoiceIndex, voices);
    };
  }
}

function updateVoiceSettings(selectedAssistant, selectedVoiceIndex, voices) {
  if (selectedVoiceIndex >= 0 && selectedVoiceIndex < voices.length) {
    selectedAssistant.voice.index = selectedVoiceIndex;
    selectedAssistant.voice.name = voices[selectedVoiceIndex].name;
    selectedAssistant.voice.lang = voices[selectedVoiceIndex].lang;
  } else {
    console.error("Invalid voice index:", selectedVoiceIndex);
  }

  selectedAssistant.markerColor = document.getElementById("markerColor").value;
  selectedAssistant.serviceName = document.getElementById("serviceName").value;
  selectedAssistant.serviceAddress = document.getElementById("serviceAddress").value;
  selectedAssistant.authCode = document.getElementById("authCode").value;
  selectedAssistant.contentType = document.getElementById("contentType").value;

  // Save the updated assistant settings
  assistantTable[selectedAssistantIndex].assistant = selectedAssistant;
  localStorage.setItem("assistantTable", JSON.stringify(assistantTable));

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

  displayAssistantSettings();

  var updateMessage = document.getElementById("updateMessage");
  updateMessage.textContent = "Settings updated successfully!";
  updateMessage.style.display = "block";
  // Hide the message after a certain duration (e.g., 3 seconds)
  setTimeout(function () {
    updateMessage.style.display = "none";
  }, 1200);
}
