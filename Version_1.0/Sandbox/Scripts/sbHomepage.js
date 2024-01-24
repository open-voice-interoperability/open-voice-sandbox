// Core-Basic functions for the Sandbox
var assistantTable; 
var conversationID;
var msgLogDiv;
var assistantObject;
var selectedAssistantIndex;

// var assistantObject = assistantTable[selectedAssistantIndex];
var bareInviteSelected = false;
var InviteWithWhisper = false;


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
  var dateStr = addFixZero( d.getFullYear() );
  dateStr += addFixZero( d.getMonth() + 1 );
  dateStr += addFixZero( d.getDate() );
  dateStr += addFixZero( d.getHours() );
  dateStr += addFixZero( d.getMinutes() );
  dateStr += addFixZero( d.getSeconds() + 1 );
  return dateStr;
  }

  function addFixZero(number) {  
    if( number < 10){ 
        number='0' + number;
    };
    return ('_' + number);
    }
    