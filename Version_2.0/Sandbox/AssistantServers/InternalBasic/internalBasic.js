var invite = false;
var bye = false;
var utterance = false;
var whisper = false;
var utteranceText = "";
var whisperText = "";
var humanName = "Human";



function callBasicAssistant( assistName, assistantObject, OVONmsg ){
    retOVONJSON = baseEnvelopeOVON( assistantObject,true );
        //findEvents( OVONmsg.ovon.events );
        let eventsJSON = eventSummary( OVONmsg.ovon.events );
        if(eventsJSON.utteranceText.includes("transfer")){
            return;
        }
        if( eventsJSON.invite ){
            if (eventsJSON.whisperText !== "") {
                // Hardcoded response for invite with whisper
                const responseText = "Hi there! Thanks for the invite with whisper.";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
            } else {
                // Hardcoded response for invite without whisper
                const responseText = "Hello! Thanks for the invite! How can I assist you today?";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
            }
            // handleReturnedOVON(retOVONJSON);
        }else{
            if( eventsJSON.utterance ){
                const responseText = "Hello! Thanks for the utterance.....";
                ovonUtt = buildUtteranceOVON(assistName, responseText);
                retOVONJSON.ovon.sender.from = assistName; // Set sender name
                retOVONJSON.ovon.events.push(ovonUtt); // Insert
            }else{
                ovonUtt = buildUtteranceOVON( assistName, "You must invite the assistant first." );
                retOVONJSON.ovon.events.push(ovonUtt);         
            }
        }
        handleReturnedOVON(retOVONJSON);
    return;
}
