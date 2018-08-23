import WebSocket from 'ws';

const wss = new WebSocket.Server({
    port: 8085,
});

function handleCommand(msgObject, ws) {
    switch (msgObject.data.command) {
        case 'help':
            ws.send(JSON.stringify({
                id: Date.now(),
                type: 'text',
                data: {
                    type: 'info',
                    text: '<div class="text-left">You can use <code>/COMMAND</code> to run special features:\n' +
                    '<ul>\n' +
                    '<li><code>/highlight CONTENT</code> creates hightlighted message with CONTENT</li>\n' +
                    '<li><code>/fadelast</code> fades out your last message</li>\n' +
                    '<li><code>/countdown NUMBER URL</code> redirects other user to URL after NUMBER of seconds</li>\n' +
                    '<li><code>/nick USERNAME</code> changes your name to USERNAME</li>\n' +
                    '<li><code>/oops</code> removes your last message</li>\n' +
                    '<li><code>/think CONTENT</code> shows your message\'s CONTENT with light bulb and different styling</li>\n' +
                    '<li><code>/help</code> displays this help</li>\n' +
                    '</ul></div>',
                }
            }));
            return false;
            break;
        case 'nick':
            ws.connectionUserName = msgObject.data.commandArguments;
            if (msgObject.data.commandArguments) {
                return {
                    type: 'command',
                    sendToAll: true,
                    data: {
                        command: 'userNameChange',
                        from: msgObject.userName,
                        to: msgObject.data.commandArguments,
                    },
                };
            } else {
                handleWrongCommandArguments(ws, msgObject.data.command, 'newUserName');
            }
            break;
        case 'disconnect':
            return {
                type: 'command',
                data: {
                    command: 'userDisconnected',
                    userName: ws.connectionUserName,
                }
            }
            break;
        case 'think':
            if (msgObject.data.commandArguments) {
                return {
                    type: 'text',
                    sendToAll: true,
                    data: {
                        type: 'think',
                        text: `:bulb:${msgObject.data.commandArguments}`,
                    },
                };
            } else {
                handleWrongCommandArguments(ws, msgObject.data.command, 'newUserName');
            }
            break;
        case 'highlight':
            if (msgObject.data.commandArguments) {
                return {
                    type: 'text',
                    sendToAll: true,
                    data: {
                        type: 'highlight',
                        text: msgObject.data.commandArguments,
                    },
                };
            } else {
                handleWrongCommandArguments(ws, msgObject.data.command, 'newUserName');
            }
            break;
        case 'fadelast':
            msgObject.sendToAll = true;
            return msgObject;
            break;
        case 'oops':
            msgObject.sendToAll = true;
            return msgObject;
        case 'countdown':
            const regExp = /^(\d+)(?:\s?)(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/i;
            const parsedArgs = regExp.exec(msgObject.data.commandArguments);
            if (parsedArgs) {
                return {
                    type: 'command',
                    data: {
                        command: msgObject.data.command,
                        time: parsedArgs[1],
                        url: parsedArgs[2],
                    }
                }
            } else {
                handleWrongCommandArguments(ws, msgObject.data.command, '5 http://example.org');
            }
            break;
        default:
            sendErrorMessage(ws, `Unknown command ${msgObject.data.command}`);
    }
}

function handleWrongCommandArguments(ws, command, exampleArguments) {
    sendErrorMessage(ws, `Wrong arguments for command ${command}. Example: /${command} ${exampleArguments}`);
}

function sendErrorMessage(ws, text) {
    ws.send(JSON.stringify({
        id: Date.now(),
        type: 'text',
        data: {
            type: 'error',
            text,
        }
    }));
}

function handleIncomingMessage(msgObject, ws) {
    let response;

    switch (msgObject.type) {
        case 'login':
            response = {
                type: 'command',
                data: {
                    command: 'userJoined',
                    userName: msgObject.userName,
                },
            };
            ws.connectionUserName = msgObject.userName;
            break;
        case 'text':
            response = msgObject;
            response.sourceConnectionId = ws.connectionId;
            break;
        case 'startedTyping':
            response = {
                type: msgObject.type,
                userName: msgObject.userName,

            };
            break;
        case 'stoppedTyping':
            response = {
                type: msgObject.type,
                userName: msgObject.userName,
            };
            break;
        case 'command':
            response = handleCommand(msgObject, ws, response);
            break;
    }

    if (response) {
        wss.clients.forEach((connection) => {
            response.id = Date.now();
            response.sourceConnectionId = ws.connectionId;
            if (response.sendToAll || connection != ws)
                connection.send(JSON.stringify(response));
        });
    }
}

wss.on('connection', (ws, req) => {
    if (wss.clients.size > 2) {
        const error = 'Chat room already has 2 users';
        ws.send(`closing connection: ${error}`);
        ws.close(4000, error);
    } else {
        ws.connectionId = Date.now() + Math.round(Math.random() * 10000);
        ws.send(JSON.stringify({
            type: 'welcome',
            data: {
                connectionId: ws.connectionId,
            },
        }));

        const otherUserName = wss.clients.values().next().value.connectionUserName;

        if (wss.clients.size > 0 && otherUserName) {
            ws.send(JSON.stringify({
                type: 'command',
                data: {
                    command: 'joinedOtherUser',
                    userName: otherUserName
                }
            }))
        }

        ws.on('message', (msg) => {
            try {
                const msgObject = JSON.parse(msg);
                handleIncomingMessage(msgObject, ws);
            } catch (exception) {
                console.error('msg', msg, exception);
                sendErrorMessage(ws, 'Wrong message or message format');
            }
        });
    }
});

