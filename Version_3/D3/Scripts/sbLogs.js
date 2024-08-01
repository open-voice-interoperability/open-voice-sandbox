document.addEventListener('DOMContentLoaded', function () {
    displayLogs(logs);
    var lastSelectedFiles = [];
    fetchLogsAndPopulateDropdown();
    const logDropdown = document.getElementById('logFileDropdown');
    const showAllButton = document.getElementById('showAllButton');
    logDropdown.addEventListener('change', function () {
        const selectedFileName = logDropdown.value;
        if (selectedFileName && selectedFileName.endsWith('.txt')) {
            fetchOvonLogs(selectedFileName, 'all');
        }else{
            showFullDialog();
        }
    });
    showAllButton.addEventListener('click', function () {
        location.reload();
    });
    ovonSentButton.addEventListener('click', function () {
        const selectedFileName = logDropdown.value;
        if (selectedFileName && selectedFileName.endsWith('.txt')) {
            fetchOvonLogs(selectedFileName, 'sent');
        }
        else{
            applyFilter('sent')
        }
    });
    ovonReceivedButton.addEventListener('click', function () {
        const selectedFileName = logDropdown.value;
        if (selectedFileName && selectedFileName.endsWith('.txt')) {
            fetchOvonLogs(selectedFileName, 'received');
        }else{
            applyFilter('received')
        }
    });
    ovonFullDialogButton.addEventListener('click', function () {
        const selectedFileName = logDropdown.value;
        if (selectedFileName && selectedFileName.endsWith('.txt')) {
            fetchOvonLogs(selectedFileName, 'all');
        } else {
            showFullDialog();
        }
    });
    logDropdown.addEventListener('change', function () {
        selectedFile = logDropdown.value;
        if (selectedFile) {
          lastSelectedFiles.push(selectedFile);
          // Keep only the last 5 selected files in the array
          if (lastSelectedFiles.length > 5) {
            lastSelectedFiles.shift(); // Remove the oldest file name
          }
          // Display the last 5 selected files along with the current file
          const selectedFileInfoElement = document.getElementById('selectedLogFileInfo');
          selectedFileInfoElement.innerHTML = '<br><b>Last Selected Files: <br></b>' + lastSelectedFiles.join('</br>');
        }
      });
});

let logs = JSON.parse(localStorage.getItem('conversationLog')) || [];
const logContainer = document.getElementById('logContainer');
var invitedAssistantStack = JSON.parse(localStorage.getItem('invitedAssistantStack')) || [];
var assistantStack = JSON.parse(localStorage.getItem('assistantStack')) || [];

// Function to display logs based on the selected filter
function applyFilter(filter) {
    const logDropdown = document.getElementById('logFileDropdown');
    const selectedFileName = logDropdown.value;
    // Check if a log file is selected and it has a .txt extension
    if (!selectedFileName && !selectedFileName.endsWith('.txt')) {
        let filteredLogs = [];
        if (filter === 'sent') {
            filteredLogs = logs.filter(log => log.direction === 'sent');
        } else if (filter === 'received') {
            filteredLogs = logs.filter(log => log.direction === 'received');
        } else {
            filteredLogs = logs;
        }
        displayLogs(filteredLogs);
    } else {
        console.log('No valid log file selected');
    }
}


function showFullDialog() {
    const dialogContainer = document.getElementById('logContainer');
    dialogContainer.innerHTML = ''; // Clear previous logs
    logs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = `log ${log.direction ? log.direction.toLowerCase() : ''}`;

        if (!log.content) {
            // Handle the case where log.content is undefined or null
            logElement.textContent = 'Invalid log content';
            dialogContainer.appendChild(logElement);
            return;
        }
        let contentObject;
        try {
            contentObject = JSON.parse(log.content);
        } catch (error) {
            // If parsing as JSON fails, treat the content as plain text
            contentObject = { textContent: log.content };
        }
        const ovon = contentObject?.ovon || {};
        const user = ovon.sender?.from;
        const assistantName = localStorage.getItem('assistantName');
        const events = ovon.events || [];
    
        // Check if there's an "invite" event
        const inviteEvent = events.find(event => event.eventType === 'invite');
        if (log.direction === 'sent') { 
            backgroundColor = changeBackgroundColor(ovon.sender?.from);
            if (inviteEvent) {
                // Check if there's also a "whisper" event
                const whisperEvent = events.find(event => event.eventType === 'whisper');
                if (whisperEvent) {
                    logElement.textContent = `${user} - Invite w/ Whisper: ${whisperEvent.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`;
                } else {
                    logElement.textContent = `${user} - Bare Invite to: ${localStorage.getItem("assistantName")}`;
                }
            }else {
                logElement.textContent = `${user} - ${events[0]?.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`;                        
            }
        } else if (log.direction === 'received') {
            const backgroundColor = changeBackgroundColor(ovon.sender?.from);
            logElement.style.backgroundColor = backgroundColor;
            let tokenValue = 'unknown';
            for (const event of events) {
                if (event.parameters.dialogEvent && event.parameters.dialogEvent.features && event.parameters.dialogEvent.features.text && event.parameters.dialogEvent.features.text.tokens && event.parameters.dialogEvent.features.text.tokens.length > 0) {
                    tokenValue = event.parameters.dialogEvent.features.text.tokens[0].value;
                    break;
                }
            }
            logElement.textContent = `${assistantName} - ${tokenValue}`;
        }else{
            return 'Invalid log direction';
        }
        dialogContainer.appendChild(logElement);
     }); 
}
let senderToList = [];
let senderTo;
//function to display log from converse.html
function displayLogs(logsToDisplay) {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = ''; // Clear previous logs

    // senderToList = [];

    logsToDisplay.forEach((log, index) => {
        const logElement = document.createElement('div');
        logElement.className = `log ${log.direction ? log.direction.toLowerCase() : ''}`;
        const logDirection = log.direction ? log.direction.toLowerCase() : '';
        

        if (logDirection === 'sent' || logDirection === 'received') {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'label';
            labelDiv.textContent = logDirection === 'sent' ? 'Sent Message' : 'Received Message';
            logElement.appendChild(labelDiv);

            const contentObject = JSON.parse(log.content);
            const ovon = contentObject?.ovon || {};
            senderTo = ovon.sender?.from;
            senderToList.push(senderTo);
            senderToList = senderToList.filter(value => value!== 'Human' && value !== undefined && value !==localStorage.getItem('humanFirstName') && value !=="assistantBrowser");
            
            if(logDirection === 'sent'){
                const conversationId = ovon.conversation?.id || 'Unknown Conversation ID';
                    let convoDate;
                    
                    // Check if the first event is an utterance and contains the dialogEvent with the span
                    
                    if (ovon.conversation.startTime) {
                        convoDate = ovon.conversation.startTime;
                    } else {
                        // Fallback to the current time if span is not available
                        convoDate = cleanDateTimeString();
                    }
                    // const datePart = convoDate.split('T')[0];
                    document.getElementById('displayedConversationId').textContent = conversationId;
                    document.getElementById('displayedDate').textContent = convoDate;
            }
            // var backgroundColor = changeBackgroundColor(senderToList[index % senderToList.length]);
            let backgroundColor;
            // logElement.style.backgroundColor = backgroundColor;
                if (logDirection === 'received' ) {
                    // Set background color for received messages
                    for (let i=0; i<senderToList.length; i++){
                        console.log(senderToList[i]);
                        backgroundColor = changeBackgroundColor(senderToList[i]);
                        console.log(backgroundColor);
                    }
                    logElement.style.backgroundColor = backgroundColor;

                    const conversationId = ovon.conversation?.id || 'Unknown Conversation ID';
                    let convoDate = '';
                    
                    // Check if the first event is an utterance and contains the dialogEvent with the span
                    const utteranceEvent = ovon.conversation.startTime;
                    if (utteranceEvent) {
                        convoDate = utteranceEvent;
                    } else {
                        // Fallback to the current time if span is not available
                        convoDate = cleanDateTimeString();
                    }

                    document.getElementById('displayedConversationId').textContent = conversationId;
                    document.getElementById('displayedDate').textContent = convoDate;
                }
            
            for (const [key, value] of Object.entries(ovon)) {
                if (key !== 'events') {
                const elementDiv = document.createElement('div');
                elementDiv.className = 'element';
                elementDiv.textContent = `${key}: ${JSON.stringify(value, null, 2)}`;
                logElement.appendChild(elementDiv);
                }
            }
            const events = ovon.events || [];
            events.forEach((event, index) => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event';
                eventDiv.textContent = `Event ${index + 1}: ${JSON.stringify(event, null, 2)}`;
                logElement.appendChild(eventDiv);
            });
        } else {
            logElement.textContent = `${log}`;
        }
        logContainer.appendChild(logElement);
    });
}
function changeBackgroundColor(serviceAddress) {
    console.log('Searching for serviceAddress:', serviceAddress);
    const assistantInvite = invitedAssistantStack.find(assistant => assistant.assistant.serviceAddress === serviceAddress);
    console.log('assistantInvite:', assistantInvite);

    const assistantOther = assistantStack.find(assistant => assistant.assistant.serviceAddress === serviceAddress);
    console.log('assistantOther:', assistantOther);

    if (assistantInvite && assistantInvite.assistant.markerColor) {
        const markerColor = assistantInvite.assistant.markerColor;
        var hsl = hexToHSL(markerColor);
        console.log('Found color in invitedAssistantStack:', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    } else if (assistantOther && assistantOther.assistant.assistant.markerColor) {
        const markerColor = assistantOther.assistant.assistant.markerColor;
        var hsl = hexToHSL(markerColor);
        console.log('Found color in assistantStack:', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    } else {
        // Return a default color if no matching assistant is found in either stack
        console.log('No matching assistant found. Defaulting to white.');
        return "#ffffff"; // default to white
    }
}

console.log('Full invitedAssistantStack:', JSON.stringify(invitedAssistantStack, null, 2));
console.log('Full assistantStack:', JSON.stringify(assistantStack, null, 2));


function saveFullDialogToFile() {
    const dateStr = cleanDateTimeString();    
    const assistantName = localStorage.getItem('assistantName');
    const fileName = `${assistantName}${dateStr}.log.txt`;
    const logContent = logs.map(log => log.content).join('\n\n');
    writeSBFile(fileName, logContent, 'Logs');
    const successMessage = 'File written successfully to "/Report/Logs';
    alert(successMessage);
    setTimeout(function() {
        location.reload();
    }, 100);}

function fetchLogsAndPopulateDropdown() {
    const logDropdown = document.getElementById('logFileDropdown');
    const logFileNameRegex = /\w+_\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}\.log\.txt$/;
    const newLogFileNameRegex = /\w+_\d{1,2}-\d{1,2}-\d{4}_\d{1,2}:\d{1,2}:\d{1,2}\.log\.txt$/;

    fetch('../Report/Logs/')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch log files. HTTP status ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const lines = data.trim().split('\n');
            let dropdownHTML = '<br><label for="logFiles">Select a log file:</label>';
            dropdownHTML += '<select name="logFiles" id="logFiles">';
            dropdownHTML += '<option value="" selected>Select</option>';

            lines.forEach(logFileName => {
                logFileName = logFileName.trim();
                if (logFileNameRegex.test(logFileName) ||newLogFileNameRegex.test(logFileName)) {
                    dropdownHTML += `<option value="${logFileName}">${logFileName}</option>`;
                }
            });

            dropdownHTML += '</select>';
            logDropdown.innerHTML = dropdownHTML;
        })
        .catch(error => {
            console.error('Error fetching log files:', error);
        });
    return true;
}
let sentList = [];
let sentTo;
function displayLogFileContent(content, filter) {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = ''; // Clear previous logs
    sentList = [];
    const lines = content.split('\n');
    const filteredLines = lines.filter(
        line =>
            !line.includes('.log.txt') &&
            !line.startsWith('HTTP/') &&
            !line.startsWith('Server:') &&
            !line.startsWith('Date:')
    );
    const filteredContent = filteredLines.join('\n');
    const logEntries = filteredContent.split('\n\n');
    logEntries.forEach(logEntry => {
        if (logEntry.trim() === '') {
            return;
        }
        let logLine;
        try {
            logLine = JSON.parse(logEntry);
        } catch (error) {
            console.error('Error parsing log entry as JSON:', error);
            return;
        }
        
        if (logLine.ovon?.events && logLine.ovon.events.length >= 0) {
            const firstEvent = logLine.ovon;
            if (firstEvent.sender.from) {
                sentTo = firstEvent.sender.from;
                sentList.push(sentTo);
                sentList = sentList.filter(value => value !== 'Human' && value !== undefined && value !==localStorage.getItem('humanFirstName') && value !=="assistantBrowser");
            } 
        }
        let lightColor;
        for (let i=0; i<sentList.length; i++) {
            lightColor = changeBackgroundColor(sentList[i]);
        }
        // Determine the direction based on the sender
        const isInviteSent = logLine.ovon?.events?.some(event => event.eventType === 'invite');

        // Determine the direction based on the presence of an 'invite' event
        const direction = isInviteSent ? 'sent' : (logLine.ovon?.sender?.from === 'Human' || logLine.ovon.sender?.from === localStorage.getItem('humanFirstName')) ? 'sent' : 'received';


        // Apply the filter based on the specified direction
        if (filter === 'all' || direction === filter) {
            if (logLine.ovon?.sender?.from) {
                // Create a new log element based on the sender
                const currentLogElement = document.createElement('div');
                currentLogElement.className = `log ${direction}`;
                currentLogElement.style.backgroundColor = direction === 'received' ? lightColor : '';
                
                const firstEventValue = logLine?.ovon?.events[0]?.parameters?.dialogEvent?.features?.text?.tokens[0]?.value;
                const secondEventValue = logLine?.ovon?.events[1]?.parameters?.dialogEvent?.features?.text?.tokens[0]?.value;
                
                // Create a header for each log entry
                const logHeader = document.createElement('div');
                logHeader.className = 'accordion-log-header log-tooltip';

                // Check for different message types and modify the header text accordingly
                if (direction === 'sent') {
                    const whisperEvent = logLine.ovon?.events?.find(event => event.eventType === 'whisper');
                    if (isInviteSent) {
                        const sentLabel = document.createElement('span');
                        sentLabel.textContent = 'Sent:';
                        sentLabel.style.fontWeight = 'bold';
                        sentLabel.style.textDecoration = 'underline';
                        logHeader.appendChild(sentLabel);
                        logHeader.appendChild(document.createTextNode(
                            whisperEvent
                                ? ` Invite with Whisper: ${whisperEvent.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`
                                : ` Bare Invite to: ${logLine.ovon.sender.from || 'unknown'}`
                        ));
                    } else {
                        const sentLabel = document.createElement('span');
                        sentLabel.textContent = 'Sent: ';
                        sentLabel.style.fontWeight = 'bold';
                        sentLabel.style.textDecoration = 'underline'; // Underline applied directly to the label span
                        logHeader.appendChild(sentLabel);
                        logHeader.appendChild(document.createTextNode(firstEventValue ?? secondEventValue ?? 'unknown'));
                    }
                } else if (direction === 'received') {
                        const receivedLabel = document.createElement('span');
                        receivedLabel.textContent = 'Received: ';
                        receivedLabel.style.fontWeight = 'bold';
                        receivedLabel.style.textDecoration = 'underline'; // Underline applied directly to the label span
                        logHeader.appendChild(receivedLabel);
                        logHeader.appendChild(document.createTextNode(firstEventValue ?? secondEventValue ?? 'unknown'));
                    }
                const tooltip = document.createElement('div');
                tooltip.className = 'log-tooltip-text';
                tooltip.textContent = 'Click to expand';

                // Create a <pre> element for each log entry
                const logContentContainer = document.createElement('div');
                logContentContainer.className = 'log-content';
                const logContent = document.createElement('pre');
                logContent.className = 'log-content';
                logContent.textContent = JSON.stringify(logLine, null, 2);

                logContentContainer.style.display = 'none';

                // Add event listener to toggle accordion on header click
                logHeader.addEventListener('click', () => {
                    logContentContainer.style.display =
                        logContentContainer.style.display === 'none' ? 'block' : 'none';
                });
                logHeader.appendChild(tooltip);
                // Add the header and log content to the current log element
                logContentContainer.appendChild(logContent);
                currentLogElement.appendChild(logHeader);
                currentLogElement.appendChild(logContentContainer);

                // Append the log element to the log container
                logContainer.appendChild(currentLogElement);
                logHeader.addEventListener('mousemove', event => {
                    tooltip.style.left = `${event.clientX + 5}px`;
                    tooltip.style.top = `${event.clientY + 5}px`;
                });
            }
        }
    });
}

function fetchOvonLogs(fileName, direction) {
    fetch(`/Report/Logs/${fileName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch log file content for ${fileName}. HTTP status ${response.status}`);
            }
            return response.text();
        })
        .then(content => {
            displayLogFileContent(content, direction);
        })
        .catch(error => {
            console.error(`Error fetching content for file ${fileName}:`, error);
        });
}