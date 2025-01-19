# How to stand up a new demo bot

First, add a new item in LLMPool/cassandra.json in the transferList item.

For example, add 8. sports_nut (knows everything about pro sports).

```json
 "transferList": "When the human wants to talk with another assistant you will tell them that you are connecting them and you must include the following text: <<<WHISPERaction=invite:assistantName>>> . Note, assistantName is one of the following names: 1- florist (the local florist shop), 2- hardware (the local hardware store), 3. postman (the local postoffice), 4. thai_palace (the human's favorite Thai restaurant), 5. pharmacy (the human's local drug store) 6.fish_restaurant (my local mexican fish restaurant, 7. hr_bot (knows all about the employees at the firm)",
 ```

Second, create a json file in the LLMPool folder with the name you added in the first step.

For example, create a json file named sports_nut.json

Copy the content from the LLMPool/florist.json into your new json file.

Change the following elements:

```json
 "prompt": "{In two or three sentences describe your bot here} If the human asks to return or go back to Cassandra you will acknowlege that and you must include the following text: <<<WHISPERaction=invite:cassandra>>>.",
"transferList": "",
"assistantName": "{Name your bot here}",
"assistantTitle": "{Give your bot a title here}",
```

For example:

```json
 "prompt": "You know everything about all the sports, including sports statistics, player information, sports trivia, team trivia, hockey, football, soccer, rugby, cricket, baseball, volleyball, pickleball, etc. All the sports. If the human asks to return or go back to Cassandra you will acknowlege that and you must include the following text: <<<WHISPERaction=invite:cassandra>>>.",
"transferList": "",
"assistantName": "Joe",
"assistantTitle": "Sports Trivia Bot",
```

Step three, find the /Support/ActiveAssistantList.json.

Find the florist bot. Copy the json for the florist. Paste it in as a new bot.

Change the bot name to the file name you used for the json above, then change the name to the filename of the json, and displayName to the assistantName you entered above.

Change the index and name of the voice you want the bot to use.

Change the serviceAddress to "internal:the name of the bot json file". For example: "internal:sports-nut"

For example:

```json
{
"assistant": {
    "name": "sports_nut",
    "displayName": "Joe",
    "voice": {
    "index": 119,
    "name": "Microsoft Aria Online (Natural) - English (United States)",
    "lang": "en-US",
    "platform": ""
    },
    "markerColor": "#288a2a",
    "serviceName": "ejTalk Expert",
    "serviceAddress": "internal:sports_nut",
    "authCode": "zz8h00ee45",
    "contentType": "none",
    "pitch": 1,
    "volume": 1,
    "rate": 1
}
},
```
