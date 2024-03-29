var selectedAssistantIndex = 0;
var assistantObject ;

function sbGetAgentParams( someAgentName ){ //return object for this agent
  for (let i = 0; i < assistantTable.length; i++) {
    if( assistantTable[i].assistant && assistantTable[i].assistant.name === someAgentName ){
      return assistantTable[i];
    }
  }
}
var assistantStack = [];
async function fetchAssistantData() {
  try {
    const response = await fetch("../Support/ActiveAssistantList.json");
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
          assistantListDiv.innerHTML += `<p style="margin-bottom: -10px; text-align:center">${assistantName}</p>`;
      });
  }

    return data;
  } catch (error) {
    throw error;
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
  <input type="text" id="voiceIndex" value="${selectedAssistant.assistant.voiceIndex}">

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
  selectedAssistant.name = document.getElementById("assistantName").value;

  selectedAssistant.voiceIndex = document.getElementById("voiceIndex").value;
  selectedAssistant.markerColor = document.getElementById("markerColor").value;
  selectedAssistant.serviceName = document.getElementById("serviceName").value;
  selectedAssistant.serviceAddress = document.getElementById("serviceAddress").value;
  selectedAssistant.authCode = document.getElementById("authCode").value;
  selectedAssistant.contentType = document.getElementById("contentType").value;
  localStorage.setItem("assistantTable", JSON.stringify(assistantTable));
  assistantTable[selectedAssistantIndex].assistant = selectedAssistant;
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
