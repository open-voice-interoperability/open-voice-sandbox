document.addEventListener('DOMContentLoaded', function () {
    let logs = JSON.parse(localStorage.getItem('conversationLog')) || [];
    var lastSelectedFiles = [];
    displayLogs(logs);
    changeBackgroundColor();
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
        const selectedFileName = logDropdown.value;
        if (selectedFileName && selectedFileName.endsWith('.txt')) {
            fetchOvonLogs(selectedFileName, 'all');
        }else{
            applyFilter('all')
        }
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

function showFullDialog(lightColor) {
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
            if (inviteEvent) {
                // Check if there's also a "whisper" event
                const whisperEvent = events.find(event => event.eventType === 'whisper');
                if (whisperEvent) {
                    logElement.textContent = `${user} - Invite w/ Whisper: ${whisperEvent.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`;
                } else {
                    logElement.textContent = `${user} - Bare Invite to: ${localStorage.getItem("assistantName")} at ${inviteEvent.parameters.to.url || 'unknown'}`;
                }
            }else {
                logElement.textContent = `${user} - ${events[0]?.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`;                        
            }
        } else if (log.direction === 'received') {
            logElement.textContent = `${assistantName} - ${events[0]?.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`;
            logElement.style.backgroundColor = lightColor; 
        }else{
            return 'Invalid log direction';
        }
        dialogContainer.appendChild(logElement);
     }); 
}
  
//function to display log from converse.html
function displayLogs(logsToDisplay) {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = ''; // Clear previous logs
    const lightColor = localStorage.getItem("lightColor");
    logsToDisplay.forEach(log => {
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

            if (logDirection === 'received') {
                // Set background color for received messages
                logElement.style.backgroundColor = lightColor;
                const conversationId = ovon.conversation?.id || 'Unknown Conversation ID';
                const convoDate = ovon.events[0].parameters.dialogEvent.span.startTime
                const datePart = convoDate.split(' ')[0];
                document.getElementById('displayedConversationId').textContent = conversationId;
                document.getElementById('displayedDate').textContent = datePart;
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

function changeBackgroundColor() {
    document.documentElement.style.setProperty('--received-color', localStorage.getItem("lightColor"));
}

function saveFullDialogToFile() {
    const dateStr = cleanDateTimeString();    
    const assistantName = localStorage.getItem('assistantName');
    const fileName = `OVON_${assistantName}${dateStr}.log.txt`;
    const logContent = logs.map(log => log.content).join('\n\n');
    writeSBFile(fileName, logContent, 'Logs');
    const successMessage = 'File written successfully to "/Report/Logs';
    alert(successMessage);
    setTimeout(function() {
        location.reload();
    }, 100);}

function fetchLogsAndPopulateDropdown() {
    const logDropdown = document.getElementById('logFileDropdown');
    const logFileNameRegex = /^OVON_\w+_\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}\.log\.txt$/;

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
                if (logFileNameRegex.test(logFileName)) {
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

function displayLogFileContent(content, filter) {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = ''; // Clear previous logs
    const lightColor = localStorage.getItem('lightColor');

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
        // Determine the direction based on the sender
        const direction =
            logLine.ovon?.sender?.from === 'Human' ||
            logLine.ovon.sender?.from === localStorage.getItem('humanFirstName')
                ? 'sent'
                : 'received';

        // Apply the filter based on the specified direction
        if (filter === 'all' || direction === filter) {
            if (logLine.ovon?.sender?.from) {
                // Create a new log element based on the sender
                const currentLogElement = document.createElement('div');
                currentLogElement.className = `log ${direction}`;
                currentLogElement.style.backgroundColor = direction === 'received' ? lightColor : '';

                // Create a header for each log entry
                const logHeader = document.createElement('div');
                logHeader.className = 'accordion-log-header log-tooltip';

                // Check for different message types and modify the header text accordingly
                if (direction === 'sent') {
                    const inviteEvent = logLine.ovon?.events?.find(event => event.eventType === 'invite');
                    const whisperEvent = logLine.ovon?.events?.find(event => event.eventType === 'whisper');

                    if (inviteEvent) {
                        logHeader.textContent = `Sent: ${
                            whisperEvent
                                ? `Invite with Whisper: ${whisperEvent.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`
                                : `Bare Invite to: ${inviteEvent.parameters.to.url || 'unknown'}`
                        }`;
                    } else {
                        logHeader.textContent = `Sent: ${logLine.ovon?.events[0]?.parameters.dialogEvent.features.text.tokens[0].value || 'unknown'}`;
                    }
                } else if (direction === 'received') {
                    logHeader.textContent = `Received: ${logLine.ovon?.events[0]?.parameters.dialogEvent?.features?.text?.tokens[0]?.value || 'unknown'}`;
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