import EventEmitter from 'eventemitter3';

export default class Socket extends EventEmitter {
  constructor() {
    super();
    
    this.isConnected = false;

    this.ws = new WebSocket('ws://159.89.15.214:8080');
    this.ws.onopen = () => {
      console.log('[open]');
      this.isConnected = true;
      this.emit('connect');
    };
  
    this.ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
      } else {
        console.log(`[close] Connection died, code=${event.code} reason=${event.reason}`);
      }
      this.emit('disconnect');
    };
  
    this.ws.onclose = (error) => {
      console.log(`[error] ${error.message}`);
    };
  
    this.ws.onmessage = (message) => {
      try {
        this.emit('message', JSON.parse(message.data));
      } catch (err) {
        console.log('failed to parse WS message', err);
      }
    };
  }
  
  send(message) {
    if (!this.isConnected) {
      this.once('connect', () => this.ws.send(message));
      return;
    }
    
    this.ws.send(message);
  }
}
