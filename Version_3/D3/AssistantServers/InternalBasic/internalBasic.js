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
        var eventsJSON = eventSummary( OVONmsg.ovon.events );
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
            }else if(eventsJSON.requestManifest) {
                    const responseText = "Here is my manifest";
                    ovonUtt = buildUtteranceOVON(assistName, responseText);
                    manifest = {
                        "eventType": "publishManifest",
                    "parameters": {
                        "manifest" : {
                            "identification":
                            {
                                "serviceEndpoint": "internal:basic",
                                "organization": "Sandbox_LFAI",
                                "conversationalName": "Basic",
                                "serviceName": "JS Basic",
                                "role": "Basic js assistant",
                                "synopsis" : "I am a dumb assistant ."
                            },               
                            "capabilities": [
                                {
                                    "keyphrases": [
                                        "dumb",
                                        "lazy"
                                    ],
                                    "languages": [
                                        "en-us"
                                    ],
                                    "descriptions": [
                                        "just some test code to test manifest messages",
                                        "simple minded unit test code"
                                    ],
                                    "supportedLayers": [
                                        "text"
                                    ]
                                }
                            ]
                        }
                    }}
                    retOVONJSON.ovon.sender.from = assistName; // Set sender name
                    retOVONJSON.ovon.events.push(manifest); // Insert
                    retOVONJSON.ovon.events.push(ovonUtt);
                    // console.log(retOVONJSON)
        
            }else{
                ovonUtt = buildUtteranceOVON( assistName, "You must invite the assistant first." );
                retOVONJSON.ovon.events.push(ovonUtt);         
            }
        }
        // console.log(retOVONJSON);
        handleReturnedOVON(retOVONJSON);
    return;
}
