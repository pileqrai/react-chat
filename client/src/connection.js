export default class Connection {
    constructor(url) {
        this.ws = new WebSocket('ws://localhost:8085');
    }
}