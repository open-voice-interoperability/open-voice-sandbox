// Core-Basic functions for the Sandbox
var assistantTable; 
var conversationID;
var msgLogDiv;
var selectedAssistantIndex;
var bareInviteSelected = false;
var InviteWithWhisper = false;
var functionList=[];


function openWindow(url) {
  var windowName = 'window_' + url;
  var existingWindow = window.open('', windowName);
  if (existingWindow) {
      existingWindow.location.href = url;
      existingWindow.focus();
  } else {
      var newWindow = window.open(url, windowName, '_blank');
      newWindow.focus();
  }
}

var sbBrowserType;
const agent = window.navigator.userAgent.toLowerCase();
sbBrowserType =
  agent.indexOf('edge') > -1 ? 'edge'
    : agent.indexOf('edg') > -1 ? 'chromium based edge'
    : agent.indexOf('opr') > -1 && window.opr ? 'opera'
    : agent.indexOf('chrome') > -1 && window.chrome ? 'chrome'
    : agent.indexOf('trident') > -1 ? 'ie'
    : agent.indexOf('firefox') > -1 ? 'firefox'
    : agent.indexOf('safari') > -1 ? 'safari'
    : 'other';
localStorage.setItem( "sbBrowserType", sbBrowserType );

var sbOSType;
sbOSType = getOS();

function getOS() {
  const userAgent = window.navigator.userAgent,
      platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
      macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/Linux/.test(platform)) {
    os = 'Linux';
  }
  return os;
}

function sbStart(){      
  document.getElementById("BrowserType").innerText = sbBrowserType;
  document.getElementById("OSType").innerText = sbOSType;
  localStorage.setItem( "currentConversationID", "" );
}


function cleanDateTimeString() {  
  var d=new Date();
  var dateStr = "_" + addFixZero(d.getMonth() + 1)+ "-";
  dateStr += addFixZero(d.getDate())+ "-";
  dateStr += addFixZero(d.getFullYear());
  dateStr += '_' + addFixZero(d.getHours());
  dateStr += addFixZero(d.getMinutes());
  dateStr += addFixZero(d.getSeconds() + 1);
  return dateStr;
}

function addFixZero(number) {  
  if (number < 10) { 
    return '0' + number; // Returning the zero-padded number without '-'
  } else {
    return number.toString(); // Returning the number as a string
  }
}

let concepts ;
async function loadConcepts() {
  try {
      const response = await fetch('../../Support/intentConcepts.json');
      concepts = await response.json();
      return concepts;
  } catch (error) {
      console.error('Error loading concepts:', error);
      return null;
  }
}
loadConcepts();
// Function to search for the intent based on the message
function searchConcept(message) {
  try {
    if (!concepts || !concepts.concepts) {
      console.error('Intents data is not available or malformed.');
      return [];
  }
      const matchedConcepts = [];
      concepts.concepts.forEach((concept) => {
          const matchedWords = concept.examples.filter((word) => message.toLowerCase().includes(word.toLowerCase()));
          if (matchedWords.length > 0) {
              matchedConcepts.push({ concept: concept.name, matchedWords });
          }
      });

      return matchedConcepts;
  } catch (error) {
      console.error('Error searching concept:', error);
      return [];
  }
}
    

function hexToHSL(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min){
      h = s = 0; // achromatic
  } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
  }

  h = Math.round(h*360) ;
  s = Math.round(s*100) - 30;
  l = Math.round(l*100)+25;
  return { h, s, l };
}

document.addEventListener("DOMContentLoaded", function() {
  // Your JavaScript code here
  const folderPath = '/listImageFiles'; // Endpoint for listing image files
  const imageContainer = document.getElementById('imageContainer');

  function listFilesInFolder(folderPath) {
      fetch(folderPath)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to list files in folder');
              }
              return response.json();
          })
          .then(data => {
              data.forEach(fileName => {
                  const imageUrl = '../Media/img/yourLogo/' + fileName;
                  displayImage(imageUrl);
              });
          })
          .catch(error => {
              console.error('Error:', error);
          });
  }

  function displayImage(imageUrl) {
    const imageDiv = document.createElement('div');
    imageDiv.classList.add('image-container');

      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imgElement.alt = 'Image';
      imgElement.width = 100;
      imgElement.height = 200;
      imageContainer.appendChild(imgElement);
  }

  listFilesInFolder(folderPath);
});