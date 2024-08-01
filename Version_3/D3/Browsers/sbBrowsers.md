# Sandbox HTML Pages

These HTML pages collectively form the user interface of the Sandbox application, allowing users to interact with and manage different aspects of assistant functionality. 

## ${\textsf{\color{#3AABFC}sbHome.html}}$
* Represents the homepage of the Sandbox application.
* Displays basic information such as Interoperability logo, browser, and operating system details.
* Provides buttons to navigate to other pages like Startup Page, Settings, and create a new assistant.
* Allows users to initiate a bare invite or an invite with a WHISPER

## ${\textsf{\color{#3AABFC}sbConverse.html}}$
* Represnts the conversation page where users can interact with an assistant.
* Includes buttons to navigate to other pages like Home, Logs, Settings, and Sequence Diagram.
* Allows users to input utterances and whispers, and dispays responses from the assistant.
* Provides options to turn TTS on and off.

## ${\textsf{\color{#3AABFC}sbAddAssistant.html }}$
* Allows users to create a new assistant with various setting options.
* Provides a form to input assistant such as type, name, ID, voice, etc.
* Users can select the assistant type from a dropdown menu: basic python, basic JavaScript, or LLM JavaScript.

## ${\textsf{\color{#3AABFC}sbLogs.html}}$
* Displays logs of conversations.
* Allows users to filter and display different types of logs (all, sent, recieved, and full dialog).
* Provides a dropdown to select a log file from `/Report/Logs` and view its details.
* Includes options to filter log files and expand/collapse messages.
* Users can save the full dialog to a file by pressing a button.

## ${\textsf{\color{#3AABFC}sbSequenceDiag.html}}$
* Represents the sequence diagram page.
* Displays the sequence diagram as a SVG container from D3.js library based on the conversation with assistant.
* Users can save the diagram, which saves to `/Report/Logs`, along with selecting a file from a dropdown menu.
* The page also includes tooltips that appear when the user hovers over any of the elements in the SVG.

## ${\textsf{\color{#3AABFC}sbSettings.html}}$
* Allows user to configure settings.
* Users can set their first name, API keys (OpenAI) and other initiliazations.
* Provides options to select assistant along with sending a bare invite and invites with whispers.
* Displays assistant-specific settings on the left and general settings on the right.

## ${\textsf{\color{#3AABFC}sbVoices.html}}$
* Represents the TTS (Text-to-Speech) voice selection page.
* Users can select any voice they want and adjust the volume, rate, and pitch settings.
* Allows users to test the selected voice with provided text.
* Provides options to update the selected voice settings for the entire conversation.
