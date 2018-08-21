export const handleMessage = (message) => ({
    message
});

export const SEND_MESSAGE = 'SEND_MESSAGE';
export const MESSAGE_SENT = 'MESSAGE_SENT';
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const JOIN_CHAT = 'JOIN_CHAT';
export const JOINED_CHAT = 'JOINED_CHAT';
export const ADD_CHAT = 'ADD_CHAT';
export const SET_STATUS = 'SET_STATUS';

export const sendMessage = (connection, type, content = null) => {
    const message = {
        type,
        id: Date.now(),
        userName: connection.userName,
        sourceConnectionId: connection.connectionId,
        data: {
            ...content,
        },
    };

    if (connection.ws) {
        connection.ws.send(JSON.stringify(message));

        return {
            type: SEND_MESSAGE,
            connectionId: connection.connectionId,
            message,
        }
    } else {
        debugger;
    }
};

export const handleCommandMessage = (message, connection) => {
    let newAction;
    switch (message.data.command) {
        case 'userJoined':
            newAction = {
                type: ADD_MESSAGE,
                connection,
                message: {
                    type: 'text',
                    data: {
                        type: 'info',
                        text: `${message.data.userName} has joined`,
                    },
                }
            }
    }

    return newAction;
};

export const joinChat = (index, login) => dispatch =>  {
    const ws = new WebSocket('ws://localhost:8085');
    const connection = {
        ws,
        userName: login,
    }

    // @todo move WS handlers to middleware

    ws.onmessage = (msg) => {
        const message = JSON.parse(msg.data);
        //
        switch (message.type) {
            case 'command':
                dispatch(addMessage(connection, {
                    type: 'text',
                    data: {
                        type: 'info',
                        text: 'test'
                    }
                }));
                const handledCommand = handleCommandMessage(message, connection);
                dispatch(handledCommand);
                break;
            //     case 'text':
            //         this.setState({
            //             textMessages: [...this.state.textMessages, message],
            //         });
            //         break;
            case 'startedTyping':
                dispatch(setStatus(connection.connectionId, `${message.userName} is typing...`));
                break;
            case 'stoppedTyping':
                dispatch(setStatus(connection.connectionId, null));
                break;
            case 'welcome':
                connection.connectionId = message.data.connectionId;
                connection.isConnected = true;
                dispatch(sendMessage(connection, 'login'));

                dispatch({
                    type: JOINED_CHAT,
                    index,
                    connection,
                });
                //resolve(message.data.connectionId);
                break;
            //     default:
            //         break;
        }
    };

    ws.onclose = (event) => {
        // this.setState(initialState);
        //
        // if (event.code === 4000) {
        //     this.setState({
        //         connectionError: event.reason,
        //     });
        //     this.userNameInput.value = this.userName;
        // } else if (event.code === 1006) {
        //     this.setState({
        //         connectionError: 'Server unreachable',
        //     });
        // }
    };

    ws.onopen = () => {
        // this.setState({
        //     isConnected: true,
        // });
        //
        // this.sendMessage('login');
        // this.messageInputRef.focus();
        // dispatch({
        //     type: START_CHAT,
        //     ws,
        // });
    }
};

export const setStatus = (connectionId, status) => ({
    type: SET_STATUS,
    connectionId,
    status,
});

export const joinedChat = (ws) => ({
    type: START_CHAT,
    ws,
});

export const addChat = () => ({
    type: ADD_CHAT,
});

export const addMessage = (connection, message) => ({
    type: ADD_MESSAGE,
    connection,
    message,
});

const a = {
    B: 3,
    C: 4,
};

export const ACT = Object.keys(a);