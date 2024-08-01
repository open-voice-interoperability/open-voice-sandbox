//Objects for the sbTable

class participant {
    constructor(){
        asName = "Noname";
        asURL = "someURL";
        sbOVON_httpReqObject = new XMLHttpRequest();
        manifest = {};
    }
    sendOVON( OVONmsg ) {
        // the sbPost stuff
        remoteURL = this.identification.serviceEndpoint;
        assistType = remoteURL.split(':');
        
        jsonSENT = JSON.stringify( ovonEnvelope, null, 2 );
      
        if( assistType[0] == "internal" ){
          callInternalAssistant( assistType[1], assistantObject, OVONmsg, false );
        }else if( assistType[0] == "internalLLM" ){
          callInternalLLM( assistType[1], assistantObject, OVONmsg );
        }else if( assistType[0] == "internal" && assistType[1] == "basic" ){
          callBasicAssistant( assistType[1], assistantObject, OVONmsg );
        }else{
          if( this.sbOVON_httpReqObject == null ){
            try{
              this.sbOVON_httpReqObject = new XMLHttpRequest();
            }catch(e){
              this.sbOVON_httpReqObject = null;
              alert( 'Failed to make sandbox communication object' );
              return false;
            }
            this.sbOVON_httpReqObject.onreadystatechange=this.callbackOVON;
          }
          if( this.sbOVON_httpReqObject != null ){  
            this.sbOVON_httpReqObject.open( 'POST', remoteURL, true ); // false makes it async
            if( contentType != "none"){  // UGLY HACK to make some assistants work
                this.sbOVON_httpReqObject.setRequestHeader('Content-Type', contentType ); } // END OF UGLY HACK!!!!!
            this.sbOVON_httpReqObject.send( JSON.stringify( ovonEnvelope ) ); // send to server
          }
        }
        //displayMsgSent(jsonSENT); Maybe log or display stuff for table???
        
      
    };
    callbackOVON(){
        // get the returned OVON and put it on the msg Queue
        if( this.sbOVON_httpReqObject.readyState == 4 ){
            if( this.sbOVON_httpReqObject.status == 200 || this.sbOVON_httpReqObject.status == 201 ){
              sbData = this.sbOVON_httpReqObject.responseText;
              if( sbData.length ){
                var start = sbData.indexOf("{");
                var stop = sbData.lastIndexOf("}");
                var result;
                if( stop > start ){
                  result = sbData.substring(start, stop+1);          
                }
                retOVONJSON = JSON.parse(result);
                //retOVONJSON = JSON.parse(sbData);
                handleReturnedOVON( retOVONJSON );
              }
            }
          }
        }
}

class ejQueue2 {
	constructor() {
		this.items = {}
		this.frontIndex = 0
		this.backIndex = 0
	}
	enqueue(item) {
		this.items[this.backIndex] = item
		this.backIndex++
		return item + ' inserted'
	}
	dequeue() {
		const item = this.items[this.frontIndex]
		delete this.items[this.frontIndex]
		this.frontIndex++
		return item
	}
	peek() {
		return this.items[this.frontIndex]
	}
	get printQueue() {
		return this.items;
	}
}
/*
const queue = new ejQueue2()
console.log(queue.enqueue(7))
console.log(queue.enqueue(2))
console.log(queue.enqueue(6))
console.log(queue.enqueue(4))
console.log(queue.dequeue())
console.log(queue.peek())
let str = queue.printQueue;
console.log(str)
*/

// Queue class
class ejQueue{
	constructor() { // Array implementation
		this.items = [];
	}
    enqueue(element){ 
        this.items.push(element);
    }
    dequeue(){ // returns null when empty
        if(this.isEmpty())
            return null;
        return this.items.shift();
    }
    peek(){
        if(this.isEmpty())
            return null;
        return this.items[0];
    }
    isEmpty() { // return true if empty.
        return this.items.length == 0;
    }
}
