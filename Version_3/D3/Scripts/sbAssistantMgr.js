var selectedAssistantIndex = 0;
//var assistantObject = assistantTable.find(agent => assistant.name === "cassandra");
var assistantObject ;

function sbGetAgentParams( someAgentName ){ //return object for this agent
  functionList.push('sbGetAgentParams()');

  for (let i = 0; i < assistantTable.length; i++) {
    if( assistantTable[i].assistant && assistantTable[i].assistant.name === someAgentName ){
      return assistantTable[i];
    }
  }
}

function highlightSelectedAssistant(markerColor) {
  functionList.push('highlightSelectedAssistant()');
  const hslColor = hexToHSL(markerColor);
  const assistantListDiv = document.getElementById('assistantList');
  const selectedAssistantName = assistantObject.assistant.name;

  if (assistantListDiv) {
    const highlightedElement = assistantListDiv.querySelector('.highlighted');
    if (highlightedElement) {
      highlightedElement.classList.remove('highlighted');
      highlightedElement.style.backgroundColor = '';
    }
    const assistantElements = assistantListDiv.getElementsByTagName('p');
    Array.from(assistantElements).forEach(element => {
      if (element.textContent === selectedAssistantName) {
        element.classList.add('highlighted');
        element.style.backgroundColor = `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
      }
    });
  }
}

var assistantStack = [];
async function fetchAssistantData() {
  functionList.push('fetchAssistantData()');

  try {
    const [response, manifest] = await Promise.all([
      fetch("../Support/ActiveAssistantList.json"),
      fetch("../Support/manifest.json")
    ]);
    const manifestData = await manifest.json();
    const data = await response.json();
    const transformedData = data.map(item => ({ assistant: item }));
    const excludedData = transformedData.slice(2);

    localStorage.setItem('assistantStack', JSON.stringify(excludedData));
    localStorage.setItem('fullAssistantList', JSON.stringify(transformedData));

    populateAssistantList(excludedData, manifestData);
    return data;
  } catch (error) {
    console.error('Error fetching assistant data:', error);
  }
}

function populateAssistantList(excludedData, manifestData) {
  const assistantListDiv = document.getElementById('assistantList');
  if (assistantListDiv) {
    assistantListDiv.innerHTML = '<h3 style="margin-bottom: -6px; margin-top: -6px; text-align:center; text-decoration: underline; text-decoration-thickness:1.5px;">Assistants To Transfer To:</h3>';
    excludedData.forEach(item => {
      const assistantName = item.assistant.assistant.name;
      const keywords = getKeywordsForAssistant(assistantName, manifestData);
      assistantListDiv.innerHTML += `<p style="margin-bottom: -10px; text-align:center; font-weight: bold;">${assistantName}</p>`;
      if (keywords.length > 0) {
        assistantListDiv.innerHTML += `<p style="margin-bottom: -10px; text-align:center">{${keywords.join(', ')}}</p>`;
      }
    });
  }
}
function getKeywordsForAssistant(assistantName, manifestData) {
  const assistant = manifestData.assistants.find(
    assistant => assistant.identification.conversationalName.toLowerCase() === assistantName.toLowerCase()
  );
  return assistant ? assistant.capabilities.keyphrases.slice(0, 3) : [];
}

async function initializeAssistantData(callback) {
  functionList.push('initializeAssistantData()');

  try {
    const data = await fetchAssistantData();
    assistantTable = data;
    selectedAssistantIndex = localStorage.getItem("currentAssistantIndex");
    assistantObject = assistantTable[selectedAssistantIndex];
    loadAssistantSelect();

    if ( callback) callback();
  } catch (error) {
    console.error('Error fetching assistant data:', error);
  }
}

//build the Assistant <select> html innerHTML string
function loadAssistantSelect() {
  functionList.push('loadAssistantSelect()');

  var assistantSelect = document.getElementById('assistantSelect');

  if (assistantSelect) {
    var selCntl = '<class="text" id="text" label style="font-size: 18px;" for="sbAssist">Choose an Assistant:</label>';
    selCntl += '<select name="startAssistant" id="sbAssist" style="font-size: 16px; width: 200px; height: 35px; padding: 2.5px;" onchange="saveAssistantIndex();">';
    selCntl += '<option style="font-family=\'Exo\',sans-serif;" value="" disabled selected>Select an Assistant</option>';

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
  functionList.push('saveAssistantIndex()');
 
  selectedAssistantIndex = parseInt(document.getElementById("sbAssist").value, 10);
  localStorage.setItem("currentAssistantIndex", selectedAssistantIndex);
  handleAssistantSelectionChange();
 }

// Function to handle assistant selection change
function handleAssistantSelectionChange() {
  functionList.push('handleAssistantSelectionChange()');

  selectedAssistantIndex = localStorage.getItem("currentAssistantIndex");
  const selectedAssistant = assistantTable[selectedAssistantIndex].assistant;
  localStorage.setItem("assistantName", selectedAssistant.name);
  displayAssistantSettings();
}
// Delete selected assistant from list
function deleteSelectedAssistant() {
  selIndex = localStorage.getItem("currentAssistantIndex");
  var cName = assistantTable[selIndex].assistant.displayName;
  assistantTable.splice( selIndex, 1 );

  document.getElementById("isRemoved").innerHTML = "External Assistant: " + cName + " is removed from your Assistant List.";

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

  initializeAssistantData().then(displayAssistantSettings());
  
  displayAssistantSettings();
}
        
function generateRandomID() {
  functionList.push('generateRandomID()');

      const letters = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      return `${letters.charAt(Math.random() * letters.length)}${letters.charAt(Math.random() * letters.length)}${numbers.charAt(Math.random() * numbers.length)}${numbers.charAt(Math.random() * numbers.length)}`;

    }

function getAssistantID(assistantName) {
  functionList.push('getAssistantID()');

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
  functionList.push('displayAssistantSettings()');

  const selectedAssistant = assistantTable[selectedAssistantIndex];
  const uniqueID = getAssistantID(selectedAssistant.assistant.name);
  const assistantSettingsDiv = document.getElementById("assistantSettings");
  assistantSettingsDiv.style.display = "block";
  document.getElementById("assistantSettings").innerHTML = `
    <div style="font-family: 'Exo', sans-serif; ">
      <h2>${selectedAssistant.assistant.name}'s Settings</h2>
      <label for="assistantName">Display Name:</label>
      <input type="text" id="assistantName" value="${selectedAssistant.assistant.displayName}">
      <label for="spokenName">Spoken Name:</label>
      <input type="text" id="spokenName" value="${selectedAssistant.assistant.name}">
      <label for="assistantID">Assistant ID:</label>
      <input type="text" id="assistantID" value="${uniqueID}">
      <label for="voiceIndex">Voice Index:</label>
      <input type="text" id="voiceIndex" value="${selectedAssistant.assistant.voice.index}">
      <div><button id="voiceSelect" class="load-voices" onclick="openWindow('sbVoices.html')">Load Voices</button></div>

      <label for="markerColor">Marker Color:</label>
      <input type="color" id="markerColor" value="${selectedAssistant.assistant.markerColor}">
      <label for="serviceName">Service Name:</label>
      <input type="text" id="serviceName" value="${selectedAssistant.assistant.serviceName}">
      <label for="serviceAddress">Service Address:</label>
      <input type="text" id="serviceAddress" value="${selectedAssistant.assistant.serviceAddress}">
      <button id="updateSettingsButton" class="update-settings" onclick="updateAssistantSettings()">Update Assistant Settings</button>
    </div>
  `;
}

var updateClicked = false;
// Function to update the assistant settings based on user input
function updateAssistantSettings() {
  functionList.push('updateAssistantSettings()');

  updateClicked = true;
  const selectedAssistant = assistantTable[selectedAssistantIndex].assistant;
  
  selectedAssistant.displayName = document.getElementById("assistantName").value;
  selectedAssistant.name = document.getElementById("spokenName").value;
  
  const selectedVoiceIndex = parseInt(document.getElementById("voiceIndex").value, 10);
  const voices = speechSynthesis.getVoices();

  if (voices.length > 0) {
    updateVoiceSettings(selectedAssistant, selectedVoiceIndex, voices);
  } else {
    speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = speechSynthesis.getVoices();
      updateVoiceSettings(selectedAssistant, selectedVoiceIndex, updatedVoices);
    };
  }
}

function updateVoiceSettings(selectedAssistant, selectedVoiceIndex, voices) {
  functionList.push('updateVoiceSettings()');

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

function createNewEntryInAssistantList(selectedAssistant, selectedVoiceIndex, voices) {
  //functionList.push('updateVoiceSettings()');

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

function loadFromManifest() {
  assistantURL = document.getElementById("serviceURL").value;
  const OVONmsg = bareManifestRequestOVON( assistantURL );
  sbRawManifestRequest( assistantURL, OVONmsg);
}

var newAssistant = null; // Global for now

function handleReturnedManifestOVON( OVON ){
  //var someAssistant = {
  newAssistant = {
      "assistant": {
      "name": "lowerCaseName",
      "displayName": "prettyDisplayableName",
      "voice": {
        "index": 115,
        "name": "Microsoft Ryan Online (Natural) - English (United Kingdom)"
      },
      "markerColor": "#3cb44b",
      "serviceName": "Your Expert",
      "serviceAddress": "someURL",
      "contentType": "application/json",
    }
  };

  manEvent = OVON.ovon.events.find(event => event.eventType === "publishManifest");
  if( !manEvent ){
    alert( "INVALID ASSISTANT MANIFEST" );
    return;
  }else if(manEvent.parameters.manifest === null ){
    alert( "NO MANIFEST IN THE OVON");
  }else{
    var manifest = manEvent.parameters.manifest;

    ///*
    urlToAdd = manifest.identification.serviceEndpoint;
    var existing = assistantTable.find(assistant => assistant.serviceAddress === urlToAdd);
    /*
    if( existing ){
      newAssistant = existing; // this will OVERWRITE the existing assistant info
    }else{
      newAssistant = someAssistant;
    }
    */

    newAssistant.assistant.displayName = manifest.identification.conversationalName;
    document.getElementById("convoName").innerHTML = manifest.identification.conversationalName;
  
    newAssistant.assistant.name = manifest.identification.conversationalName.toLowerCase();
  
    newAssistant.assistant.organization = manifest.identification.organization;
    document.getElementById("organization").innerHTML = manifest.identification.organization;
  
    newAssistant.assistant.serviceAddress = manifest.identification.serviceEndpoint;
    //document.getElementById("serviceURL").value = manifest.identification.serviceEndpoint;
    // do test here to be sure the url in the manifest is the same as was contacted
  
    newAssistant.assistant.serviceName = manifest.identification.serviceName;
    document.getElementById("serviceName").innerHTML = manifest.identification.serviceName;
  
    newAssistant.assistant.role = manifest.identification.role;
    document.getElementById("role").innerHTML = manifest.identification.role;
  
    newAssistant.assistant.synopsis = manifest.identification.synopsis;
    document.getElementById("synopsis").innerHTML = manifest.identification.synopsis;
  }
}

function findNewAssistant() {
  loadFromManifest( document.getElementById("serviceURL").value );

  // just defaults if no voice is selected
  theLastVoiceIndexPicked = 115;
  theLastVoicePicked = "Microsoft Ryan Online (Natural) - English (United Kingdom)"
}

function addExistingAssistantToList() { // adds color and voice if desired
  if( !newAssistant ){
    alert( "YOU MUST FIND AN ASSISTANT FIRST");
    return;
  }else{
    newAssistant.assistant.voice.name = theLastVoicePicked;
    newAssistant.assistant.voice.index = theLastVoiceIndexPicked;
    // Save the updated assistant settings
    assistantTable.push( newAssistant );
    localStorage.setItem("assistantTable", JSON.stringify(assistantTable));
    //document.getElementById("isAdded").innerHTML = "Added External Assistant: " + document.getElementById("convoName").innerHTML;

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

    document.getElementById("isAdded").innerHTML = "Added External Assistant: " + document.getElementById("convoName").innerHTML;
    initializeAssistantData().then(displayAssistantSettings());
    //document.getElementById("isAdded").innerHTML = "Added External Assistant: " + document.getElementById("convoName").innerHTML;
  }
}
