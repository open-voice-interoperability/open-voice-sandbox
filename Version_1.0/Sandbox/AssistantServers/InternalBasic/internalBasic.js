var invite = false;
var bye = false;
var utterance = false;
var whisper = false;
var utteranceText = "";
var whisperText = "";
var humanName = "Human";



function callBasicAssistant( assistName, assistantObject, OVONmsg ){
    retOVONJSON = baseEnvelopeOVON( assistantObject );
        //findEvents( OVONmsg.ovon.events );
        var eventsJSON = eventSummary( OVONmsg.ovon.events );
        if( eventsJSON.invite ){
            if (eventsJSON.whisperText !== "") {
                // Hardcoded response for invite with whisper
                const responseText = "Hi there! Thanks for the invite with whisper.";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            } else {
                // Hardcoded response for invite without whisper
                const responseText = "Hello! Thanks for the invite! How can I assist you today?";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            }
            if( eventsJSON.utterance ){
                const responseText = "Hello! Thanks for the utterance";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            }
        }else{
            if( eventsJSON.utterance ){
                const responseText = "Hello! Thanks for the utterance.....";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
                handleReturnedOVON(retOVONJSON);
            }else{
                ovonUtt = buildUtteranceOVON( assistName, "You must invite the assistant first." );
                retOVONJSON.ovon.events.push(ovonUtt);         
            }
        }
    return;
}
