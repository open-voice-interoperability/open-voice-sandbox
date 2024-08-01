// The Conversational Floor Manager

function handleInput(message, whisper, isText, isWhisper) {
  // send message to the floor
  // if floor chooses to handle it then do the floor action
  //   otherwise send it off as usual
  //
  localStorage.setItem("lastUtterance", message);
  var concepts = searchConcept(message);
  if (concepts) {
    floor = processFloorEvents(concepts);
    if (floor) {
      sbFloorEvents(floor, message, whisper, isText, isWhisper); // do the return or delegate
    } else {
      sendReply(message, isWhisper, isText, false, whisper); // just do what we always did before
    }
  } else {
    sendReply(message, isWhisper, isText, false, whisper);
  }
}

function processFloorEvents(conceptJSON) {
  var redirect = "";
  var concept = "";
  //floorDirectives
  var fDir = {
    redirect: "",
    assistantName: "",
    repeatLastUtt: false,
    manifest: false,
    discovery: false
  };
  let delegate = false;

  if (conceptJSON) {
    // loop thru concept/intents to collect any that might occur
    for (var i = 0; i < conceptJSON.length; i++) {
      concept = conceptJSON[i].concept;
      if (concept === "return") {
        redirect = concept;
        fDir.redirect = concept;
      } else if (concept === "delegate" && !redirect) {
        redirect = concept;
        fDir.redirect = concept;
      } else if (concept === "assistantName") {
        fDir.assistantName = conceptJSON[i].matchedWords[0];
      } else if (concept === "repeatLastUtt") {
        fDir.repeatLastUtt = true;
      } else if (concept === "manifest") {
        fDir.manifest = true;
      } else if (concept === "discovery") {
        fDir.discovery = true;
        redirect = "delegate";
        fDir.redirect = "delegate";
        fDir.assistantName = "discovery";
      }
    }
  }
  if (redirect.length || fDir.repeatLastUtt || fDir.manifest) {
    return fDir;
  } else {
    console.log("No action needed based on concepts.");
    return null;
  }
}

function sbFloorEvents(floorDirectives, message, whisper, isText, isWhisper) {
  let prevAssistantServiceAddress = "";
  let prevAssistant;
  if (invitedAssistantStack.length >= 0) {
    prevAssistant = invitedAssistantStack[0];
    prevAssistantList.unshift(invitedAssistantStack[0].assistant);
    prevAssistantServiceAddress = prevAssistantList[0].serviceAddress;
  }
  var someAssistant = null;
  if (floorDirectives.assistantName.length) {
    someAssistant = sbGetAgentParams(floorDirectives.assistantName);
  }
  if (!someAssistant) {
    // get name from the stack (the last assistant speaking)
    //someAssistant = sbGetAgentParams("leah"); // just fake for testing now
    someAssistant = prevAssistant; // always use the current assistant?
  }

  if (floorDirectives.repeatLastUtt === true) {
    const lastMessage = JSON.parse(localStorage.getItem("lastReceived"));
    if (
      lastMessage &&
      lastMessage.ovon &&
      lastMessage.ovon.events &&
      lastMessage.ovon.events.length > 0
    ) {
      const utteranceEvent = lastMessage.ovon.events.find(
        (event) => event.eventType === "utterance"
      );
      if (
        utteranceEvent && utteranceEvent.parameters && utteranceEvent.parameters.dialogEvent
      ) {
        const text = utteranceEvent.parameters.dialogEvent.features.text;
        if (text && text.tokens && text.tokens.length > 0) {
          const lastMessageText = text.tokens[0].value;
          sendReply(message, isWhisper, isText, assistantBrowser, whisper);
          // sbPostToAssistant(assistantObject, message);
          // displayMsgSent(JSON.stringify(lastMessage, null, 2));
          sbSpeak("What I said was.."+lastMessageText, assistantObject);
        } else {
          console.log("No message text found in the last utterance event");
        }
      } else {
        console.log("No utterance event found in the last message");
      }
    } else {
      console.log("Invalid last message structure");
    }
  }

  if (someAssistant) {
    assistantObject = someAssistant;
    var ovonMSG = baseEnvelopeOVON(someAssistant.assistant.serviceAddress, false);
    if (floorDirectives.redirect.length) {
      if (floorDirectives.redirect == "delegate") {
        ovonMSG.ovon.sender.from = assistantBrowserServiceAddress;
        //sendReply(message, isWhisper, isText, assistantBrowser, whisper);
        delegate = true;
        var thisInvite = bareInviteOVON(ovonMSG, someAssistant, delegate);
        sbPostToAssistant(someAssistant, thisInvite);
      } else if (floorDirectives.redirect == "return") {
        // just do the delegate for now (later add a "return whisper")
        ovonMSG.ovon.sender.from = assistantBrowserServiceAddress;
        sendReply(message, isWhisper, isText, assistantBrowser, whisper);
        delegate = true;
        var thisInvite = bareInviteOVON(ovonMSG, someAssistant, delegate);
        sbPostToAssistant(someAssistant, thisInvite);
      }
    }else if (floorDirectives.manifest) {
      var manReq = addManifestRequestOVON(ovonMSG, someAssistant, delegate);
      ovonMSG.ovon.sender.from = assistantBrowserServiceAddress;
      sbPostToAssistant(someAssistant, manReq);
    }
  } else {
    return false;
  }
}
