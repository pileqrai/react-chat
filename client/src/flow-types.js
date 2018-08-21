export type Message = {
    sourceConnectionId: string,
    userName: string,
    type: MessageType,
    data: {}
}

export type Connection = {
    id: string,
    isConnected: boolean,
    isConnecting: boolean,
    userName: string,
    targetUserName: string,
    ws: any,
},

export type MessageType = 'command' | 'text' | 'startedTyping' | 'stoppedTyping' | 'welcome';
export type AppState = {
    connections: {
        [string]: Connection
    }
    status: string,
    messages: {
        [string]: Array<Message>
    }
};