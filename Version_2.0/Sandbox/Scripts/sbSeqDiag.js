
var seqDiagJSON = new Object();
seqDiagJSON = [];
var selectedFile ='';
var lastSelectedFiles = [];

function stuffToPutInTheStart(){ // just a note of start stuff
    // loadVoiceSelect();
    ejSetCookie( "reListen", "false" );
    localStorage.setItem( "uttCount", 0 );
    localStorage.setItem( "sequenceLog", "" );
  
    localStorage.setItem( "thisExchPacket", "" );
    localStorage.setItem( "exchangePacket", "" );
    localStorage.setItem( "thisExchPacketJSON", "" );
    localStorage.setItem( "exchangePacketJSON", "log" );
  
    localStorage.setItem('sessionServerMsgLog', '');
}

function buildSeqDiagJSON( from, to, shortM, longM, changeColor, whisper ){
  const line = new Object();
  line.from = from;
  line.to = to;
  line.sMsg = shortM;
  line.lMsg = longM;
  line.whisper = whisper;
  line.noteColor = changeColor;
  seqDiagJSON.push( line );
}

function saveLocalSeqDiag(){
  var JSQ = JSON.stringify( seqDiagJSON );
  localStorage.setItem( "seqDiagJSON", JSQ );
}

function ejClearSeqDiag(){
  seqDiagJSON = [];
  localStorage.setItem( "seqDiagJSON", "" );
}

  
function sbSaveSequenceDiagram(  ) {
  const dateStr = cleanDateTimeString();
  var assistant = localStorage.getItem( "assistantName" );
  const fileName = `${assistant}${dateStr}.seq.json`;
  writeSBFile(fileName, JSON.stringify(data, null, 2),'Sequence');
  const successMessage = 'File written successfully to "/Report/Sequence"';
  alert(successMessage);
}

function fetchSequenceFiles() {
  fetch('..\\Report\\Sequence')
    .then(response => response.json())
    .then(data => {
      const dropdown = document.getElementById('SDFileDropdown');
      dropdown.innerHTML = '';

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.text = 'Select';
      dropdown.appendChild(defaultOption);

      data.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.text = file;
        dropdown.appendChild(option);
      });

      dropdown.addEventListener('change', function () {
        selectedFile = dropdown.value;
        updateSVG(selectedFile);
        if (selectedFile) {
          lastSelectedFiles.push(selectedFile);
          // Keep only the last 5 selected files in the array
          if (lastSelectedFiles.length > 5) {
            lastSelectedFiles.shift(); // Remove the oldest file name
          }
          // Display the last 5 selected files along with the current file
          const selectedFileInfoElement = document.getElementById('selectedFileInfo');
          selectedFileInfoElement.innerHTML = '<br><b>Last Selected Files: <br></b>' + lastSelectedFiles.join('</br>');
        }
      });
    })
    .catch(error => {
      console.error('Error fetching sequence files:', error);
    });
}

function updateSVG(selectedObject) {
  const selectedFile = selectedObject.trim();

  if (selectedFile) {
    fetch(`..\\Report\\Sequence\\${selectedFile}`)
      .then(response => response.json())
      .then(content => {
        d3.select('svg#sbSeqDiag').selectAll("*").remove();
        var JSQ = JSON.stringify( content, null, "\t" );
        localStorage.setItem( "seqDiagJSON", JSQ );
        sbLoadSeq();
      })
      .catch(error => {
        console.error(`Error fetching content of ${selectedFile}:`, error);
      });
  } else {
    // Handle the case when no file is selected
    console.warn('No file selected');
  }
}

var tooltip;
function createTooltip(svg, message) {
  const tooltip = d3.select(svg.node().parentNode).append("span") 
    .attr("class", "seqDiagTooltip")
    .style("position", "absolute")
    .style("width", "250px")
    .style("background-color", "lightgray")
    .style("border", "1px solid gray")
    .style("padding", "5px")
    .style("opacity", "0.85")
    .style("border-radius", "10px")
    .style("word-wrap", "break-word")
    .style("visibility", "hidden")
    
    .on("mouseover", function() {
      tooltip.style("visibility", "visible");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });

    if (message && typeof message === 'object') {
      const text = JSON.stringify(message, null, 2);
      const textLines = text.split('\n');
      tooltip.selectAll("p")
        .data(textLines)
        .enter()
        .append("p")
        .style("margin", "5px")
        .text(function (d) { return d; });
    } else {
      // Handle the case where there's no message object
      tooltip.append("p")
        .style("margin", "5px")
        .text(message || "No information available"); // Use the message directly
    }
  
    return tooltip;
}
var data;

function sbLoadSeq(){
  //assistantTable = await fetchAssistantData();

  document.getElementById("BrowserType").innerText = sbBrowserType;
  document.getElementById("OSType").innerText = sbOSType;

  var JSQ = localStorage.getItem( "seqDiagJSON" );
  data = JSON.parse( JSQ );
  // set the seqDiagram directory???
  //var reportPath = "AT_ROOT:reports/seqDiagram/";

  var svg = d3.select('svg#sbSeqDiag'),
    margin = { top: 30, right: 50, bottom: 100, left: 80 },
    width = +svg.attr('width') - margin.left - margin.right,
    height = +svg.attr('height') - margin.top - margin.bottom,
    g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  if(data)
{
  var froms = d3.set(data.map(function(d){ return d.from; })).values();
  var tos = d3.set(data.map(function(d){ return d.to; })).values();
  
}
    var classes = _.union(froms, tos);

  sbMoveToHead( classes, "NLU_Service");
  sbMoveToHead( classes, "assistantBrowser");
  sbMoveToHead( classes, "human");

var XPAD = 175;
var YPAD = 30;
var VERT_SPACE = parseInt(width/classes.length);
var VERT_PAD = 20;

var MESSAGE_SPACE = 30;
svg.attr("height", (data.length+2)*MESSAGE_SPACE);

var MESSAGE_LABEL_X_OFFSET = -40;
var MESSAGE_LABEL_Y_OFFSET = 75;
var MESSAGE_ARROW_Y_OFFSET = 80;    

var CLASS_WIDTH = VERT_SPACE-10;
var CLASS_LABEL_X_OFFSET = -30;
var CLASS_LABEL_Y_OFFSET = 25;

// Draw vertical (Assistant) bars
classes.forEach(function(c, i) {
  var draw = true;
  var color = getClassColor( c );
  if( draw ){
    var line = svg.append("line")
    .style("stroke", color)
    .style("stroke-width", "110")
    .attr("x1", XPAD + i * VERT_SPACE)
    .attr("y1", YPAD)
    .attr("x2", XPAD + i * VERT_SPACE)
    .attr("y2", YPAD + VERT_PAD + data.length * (MESSAGE_SPACE+5));
  }
});

// Draw classes
classes.forEach(function(c, i) {
  if( c!="" ){
    var x = XPAD + i * VERT_SPACE;
    var g1 = svg.append("g")
      .attr("transform", "translate(" + x + "," + YPAD + ")")
      .attr("class", "class-rect")
      .append("rect")
      .attr({x: -CLASS_WIDTH/2, y:0, width: CLASS_WIDTH, height: "24px"});
  }
});

var tooltip = createTooltip(svg, "", 0, 0);

// Draw class labels
classes.forEach(function(c, i) {
  if( c!="" ){
    var x = XPAD + i * VERT_SPACE;
    var yPos = YPAD;

    var g1 = svg.append("g")
      .attr("transform", "translate(" + x + "," + YPAD + ")")
      .append("text")
      .attr("class", "class-label")
      .attr("text-anchor", "middle")
      .text(function (d) { return c; })
      .attr("dy", "16px")
      .on("mouseover", function () {
        var xPos = event.pageX;
        yPos = event.pageY; // Update yPos
        var tooltipContent = sbGetAgentParams(c);
        tooltip.selectAll("p").remove(); // Remove existing paragraphs

        if (tooltipContent && typeof tooltipContent === 'object') {
          const text = JSON.stringify(tooltipContent, null, 2);
          const textLines = text.split('\n');

          tooltip.selectAll("p")
            .data(textLines)
            .enter()
            .append("p")
            .style("margin", "5px")
            .text(function (d) { return d; });
        } else {
          tooltip.append("p")
            .style("margin", "5px")
            .text(tooltipContent || "No information available");
        }

        tooltip.style("left", (xPos + 10) + "px")
          .style("top", (yPos - 10) + "px");
        tooltip.style("visibility", "visible");
      })
      .on("mouseout", function () {
        // Hide tooltip on mouseout
        tooltip.style("visibility", "hidden");
      })
      .on("mousemove", function () {
        // Update tooltip position on mousemove
        var xPos = event.pageX;
        yPos = event.pageY; // Update yPos
        tooltip.style("left", (xPos + 10) + "px")
          .style("top", (yPos - 10) + "px");
      });
  }
});

// Draw sMsg arrows
data.forEach(function(m, i) {
  var draw = true;
  var y = MESSAGE_ARROW_Y_OFFSET + (i) * MESSAGE_SPACE;
  if( m.from != m.to ){
    var color=getArrowColor( m );
    var line = svg.append("line")
      .style("stroke", color )
      .style("stroke-width", "2")
      .attr("x1", XPAD + classes.indexOf(m.from) * VERT_SPACE)
      .attr("y1", y)
      .attr("x2", XPAD + classes.indexOf(m.to) * VERT_SPACE)
      .attr("y2", y)
      .attr("marker-end", "url(#end)")
      .attr("stroke", color )
      .append("text")
      .text(function (d) { return m.sourcetype; });
 }else{
    var line = svg.append("line")
      .attr("x1", classes.indexOf(m.from) * VERT_SPACE)
      .attr("y1", y )
      .attr("x2", classes.indexOf(m.to) * VERT_SPACE)
      .attr("y2", y)
      .append("text")
      .attr("text-anchor", "middle")
      .text(function (d) { return m.sourcetype; });
  }
  });

// Draw sMsg indices
data.forEach(function(m, i) {
  var xPos = 20;
  var yPos = MESSAGE_LABEL_Y_OFFSET + i * MESSAGE_SPACE;

  var g1 = svg.append("g")
    .attr("transform", "translate(" + xPos + "," + yPos + ")")
    .attr("class", "first")
    .attr("text-anchor", "middle")
    .append("text")
    .style("font-size", "16px")
    .text(function (d) { return i+1; });
});

// Draw sMsg labels
data.forEach(function(m, i) {
  var xPos = XPAD + MESSAGE_LABEL_X_OFFSET + (((classes.indexOf(m.to) - classes.indexOf(m.from)) * VERT_SPACE) / 2) + (classes.indexOf(m.from)  * VERT_SPACE);
  var xPos = xPos - 15;
  var yPos = MESSAGE_LABEL_Y_OFFSET + i * MESSAGE_SPACE;
  var msgBox = "classArrowMsg";
  var fontWT = 400; // note only 400/700 (normal/bold) work with d3
  if( m.from == m.to ){
    fontWT = 700;
    msgBox = "classInnerAgentMsg";
  }
  var tooltip = createTooltip(svg, m, xPos, yPos);

  var g1 = svg.append("g")
    .attr("transform", "translate(" + xPos + "," + yPos + ")")
    .append("text")
    .attr("dx", "5px")
    .attr("dy", "-2px")
    .attr("text-anchor", "begin")
    .style("font-size", "14px")
    .attr("font-weight", "bold" )
    .attr("fill", function(d,i) {return getArrowColor( m );})
    .text(function (d) { return m.sMsg; })
    
    .on("mouseover", function() {
      tooltip.style("visibility", "visible");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    })
    .on("mousemove", function () {
      const offsetX = -3; // Adjust the offset from x
      const offsetY = -3; // Adjust the offset from y
  
      const mouseX = event.pageX;
      const mouseY = event.pageY;
    
      // Update tooltip position
      tooltip.style("left", (mouseX + offsetX) + "px")
             .style("top", (mouseY + offsetY) + "px");
    });
    
});

// Arrow style
svg.append("svg:defs").selectAll("marker")
  .data(["end"])      
  .enter().append("svg:marker")
  .attr("id", String)
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 10)
  .attr("refY", 0)
  .attr("markerWidth", 10)
  .attr("markerHeight", 7)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5");

}

function sbMoveToHead( arrayName, valueToMove ){
  if (Array.isArray(arrayName)) {
    var index = arrayName.indexOf(valueToMove);
    if (index > -1) {
      arrayName.splice(index, 1);
      arrayName.unshift(valueToMove);
    }
  } else {
    console.error('arrayName is not an array:', arrayName);
  }
}

function getClass( className ){
  var c = sbGetAgentParams( className );
  if( c ){
    return c;
  }else{
    return null;
  }
}

function getClassColor( className ){
  var c = sbGetAgentParams( className );
  if (c && c.assistant) {
    var hexColor = c.assistant.markerColor;
    var hsl = hexToHSL(hexColor);
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  } else {
    return "#b3b3cc";
  }
  
}

function getArrowColor( lineItem ){
  var className = lineItem.noteColor;
  if( className.length == 0){
    className = lineItem.from;
  }
  var c = sbGetAgentParams( className );
  if (c && c.assistant) {
    return c.assistant.markerColor;
  } else {
    return "#5c5c8a";
  }
}

function buildInviteSeqDiag(wc, aName, delegate) {
  if(!delegate){
    buildSeqDiagJSON( "human", wc, "[[Start a dialog with "+aName+"]]", "Cold open a new conversation thread", "" );
    buildSeqDiagJSON( wc, wc, "[[New CONN]]", "Initiate the new connection", "" );
    buildSeqDiagJSON( wc, aName, "invite "+aName, "Invite for initial connection", "" );
    buildSeqDiagJSON( aName, aName, "[[INITIALIZE]]", "Set up for first contact with the assistant", "" );
    saveLocalSeqDiag();
  }else{
    buildSeqDiagJSON( wc, wc, "[New CONN by DELEGATION]]", "Delegate the new connection", "" );
    buildSeqDiagJSON( wc, aName, "invite "+aName, "Invite for initial connection", "" );
    buildSeqDiagJSON( aName, aName, "[[DELEGATE]]", "Set up for first contact with the new assistant", "" );
    saveLocalSeqDiag();
  }
  
}

function buildUttSeqDiag(wc, assistantName, shortASR, finalAsrText, isText, isDelegate) {
  if(isDelegate){
    if (isText) {
      buildSeqDiagJSON( "human", wc, shortASR, finalAsrText, "" );
      saveLocalSeqDiag();
    } else {
      buildSeqDiagJSON( "human", wc, shortASR, finalAsrText, "" );
      saveLocalSeqDiag();
    }
  }else{
     if (isText) {
      buildSeqDiagJSON( "human", wc, shortASR, finalAsrText, "" );
      buildSeqDiagJSON( wc, wc, "[[Client TEXT]]", "Speech recognition via browser webKit", "" );
      buildSeqDiagJSON( wc, assistantName, "utterance[TEXT]", "OVON Event string sent to Assistant", "" );
      buildSeqDiagJSON( assistantName, assistantName, "[[NLU/DIALOG]]", "Understand the words and do dialog management and biz logic", "" );
      saveLocalSeqDiag();
    } else {
      buildSeqDiagJSON( "human", wc, shortASR, finalAsrText, "" );
      buildSeqDiagJSON( wc, wc, "[[Client ASR]]", "Speech recognition via browser webKit", "" );
      buildSeqDiagJSON( wc, assistantName, "utterance[ASR]", "OVON Event string sent to Assistant", "" );
      buildSeqDiagJSON( assistantName, assistantName, "[[NLU/DIALOG]]", "Understand the words and do dialog management and biz logic", "" );
      saveLocalSeqDiag();
    }
  }
}

function buildWhisperSeqDiag(wc, assistantName, shortASR, finalAsrText) {
  buildSeqDiagJSON( "human", wc, shortASR, finalAsrText, "" );
  buildSeqDiagJSON( wc, wc, "[[Client TEXT]]", "Speech recognition via browser webKit", "" );
  buildSeqDiagJSON( wc, assistantName, "whisper[TEXT]", "OVON Event string sent to Assistant", "" );
  buildSeqDiagJSON( assistantName, assistantName, "[[NLU/DIALOG]]", "Understand the words and do dialog management and biz logic", "" );
  saveLocalSeqDiag();
}

function returnSeqDiag(wc, agentName, shortMessage, longMessage, shortSay, thisSay, whisper){
  var whispText;
  if(whisper && whisper.parameters && whisper.parameters.dialogEvent) {
    var event = whisper.parameters.dialogEvent;
    // Check if the event object has features and text tokens
    if(event.features && event.features.text && event.features.text.tokens && event.features.text.tokens[0]) {
      whispText = event.features.text.tokens[0].value;
    }
  }
  if(!whisper){
    buildSeqDiagJSON( agentName, wc, shortMessage, longMessage, "" );
    buildSeqDiagJSON( wc, wc, "[[Client TTS]]", "Speech synthesis in browser", agentName );
    buildSeqDiagJSON( wc, "human", shortSay, thisSay, agentName );
    saveLocalSeqDiag();
  }else if(whispText){
    buildSeqDiagJSON( agentName, wc, shortMessage, longMessage, "" );
    buildSeqDiagJSON( wc, wc, "[[Client TTS]]", "Speech synthesis in browser", agentName );
    buildSeqDiagJSON( wc, "human", shortSay, thisSay, agentName, whispText );
    saveLocalSeqDiag();
  }
  else if(whisper){
    buildSeqDiagJSON( agentName, wc, shortMessage, longMessage, "" );
    buildSeqDiagJSON( wc, wc, "[[Client TTS]]", "Speech synthesis in browser", agentName );
    buildSeqDiagJSON( wc, "human", shortSay, thisSay, agentName, whisper );
    saveLocalSeqDiag();
  }
  
}
