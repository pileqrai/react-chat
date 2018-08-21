import React from 'react';
import ChatMessages from '../ChatMessages';
import './styles.scss';
import {sendMessage, joinChat} from "../../actions";
import {connect} from 'react-redux';
import * as PropTypes from "prop-types";

const initialState = {
    isConnected: false,
    isConnecting: false,
    connectionId: 0,
    textMessages: [],
    myMessageIds: [],
    message: '',
    userName: '',
};

export class Chat extends React.Component {
    state = initialState;

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.userNameInputRef && this.userNameInputRef.focus();
    }

    componentWillUnmount() {
        this.disconnect();
    }

    connect() {
        // const ws = new WebSocket('ws://localhost:8085');
        //
        // this.setState({
        //     connectionError: null,
        // });
        //
        // ws.onmessage = (msg) => {
        //     const message = JSON.parse(msg.data);
        //
        //     switch (message.type) {
        //         case 'command':
        //             this.handleCommand(message);
        //             break;
        //         case 'text':
        //             this.setState({
        //                 textMessages: [...this.state.textMessages, message],
        //             });
        //             break;
        //         case 'startedTyping':
        //             this.setState({
        //                 status: `${message.userName} is typing...`,
        //             });
        //             break;
        //         case 'stoppedTyping':
        //             this.setState({
        //                 status: null,
        //             });
        //             break;
        //         case 'welcome':
        //             this.setState({
        //                 connectionId: message.data.connectionId,
        //             });
        //             break;
        //         default:
        //             break;
        //     }
        // };
        //
        // ws.onclose = (event) => {
        //     this.setState(initialState);
        //
        //     if (event.code === 4000) {
        //         this.setState({
        //             connectionError: event.reason,
        //         });
        //         this.userNameInput.value = this.userName;
        //     } else if (event.code === 1006) {
        //         this.setState({
        //             connectionError: 'Server unreachable',
        //         });
        //     }
        // };
        //
        // ws.onopen = () => {
        //     this.setState({
        //         isConnected: true,
        //     });
        //
        //     this.sendMessage('login');
        //     this.messageInputRef.focus();
        // };
        //
        // this.props.onConnect(this.state.userName);
        //
        // this.webSocket = ws;

        this.props.onConnect(this.state.userName);
    }

    disconnect() {
        this.sendMessage('command', {
            command: 'disconnect',
        });
        this.webSocket.close();
        this.setState(initialState);
    }

    handleCommand(msg) {
        const messages = this.state.textMessages;

        switch (msg.data.command) {
            case 'userJoined':
                this.setState({
                    targetUserName: msg.data.userName,
                    textMessages: [...messages, {
                        type: 'text',
                        data: {
                            type: 'info',
                            text: `${msg.data.userName} has joined`,
                        },
                    }],
                });
                break;
            case 'joinedOtherUser':
                this.setState({
                    targetUserName: msg.data.userName,
                    textMessages: [...messages, {
                        type: 'text',
                        data: {
                            type: 'info',
                            text: `You have joined ${msg.data.userName}`,
                        },
                    }],
                });
                break;
            case 'userNameChange':
                if (msg.sourceConnectionId === this.state.connectionId) {
                    this.setState({
                        userName: msg.data.to,
                        textMessages: [...messages, {
                            type: 'text',
                            data: {
                                type: 'info',
                                text: `You have renamed from ${msg.data.from} to ${msg.data.to}`,
                            },
                        }],
                    });
                } else {
                    this.setState({
                        targetUserName: msg.data.to,
                        textMessages: [...messages, {
                            type: 'text',
                            data: {
                                type: 'info',
                                text: `${msg.data.from} renamed to ${msg.data.to}`,
                            },
                        }],
                    });
                }
                break;
            case 'userDisconnected':
                this.setState({
                    targetUserName: null,
                    textMessages: [...messages, {
                        type: 'text',
                        data: {
                            type: 'info',
                            text: `${msg.data.userName} has left`,
                        },
                    }],
                });
                break;
            case 'fadelast':
                var indexToChange = this.getLastMessageIndex(msg.sourceConnectionId);

                if (indexToChange) {
                    messages[indexToChange].data.type = 'faded';

                    this.setState({
                        textMessages: messages,
                    });
                }
                break;
            case 'oops':
                var indexToRemove = this.getLastMessageIndex(msg.sourceConnectionId);

                if (indexToRemove) {
                    messages.splice(indexToRemove, 1);

                    this.setState({
                        textMessages: messages,
                    });
                }
                break;
            case 'countdown':
                let i = msg.data.time;

                const timer = window.setInterval(() => {
                    this.setState({
                        status: `Redirecting to ${msg.data.url} in ${i}...`,
                    });

                    if (i === 0) {
                        this.setState({
                            status: null,
                        });
                        window.open(msg.data.url, '_blank');
                        clearInterval(timer);
                    }
                    i -= 1;
                }, 1000);
                break;
        }
    }

    getLastMessageIndex(connectionId) {
        const messages = this.state.textMessages;
        let indexToRemove;

        for (let i = messages.length - 1; i >= 0; i--) {
            if ((messages[i].sourceConnectionId === this.state.connectionId || messages[i].sourceConnectionId === connectionId) && messages[i].data.type !== 'info') {
                indexToRemove = i;
                break;
            }
        }

        return indexToRemove;
    }

    sendMessage(type, content = null) {
        this.props.onSendMessage(type,content);
    }

    messageInputChangeHandler(e) {
        let isUserTyping = this.state.isUserTyping;
        if (!this.state.isUserTyping && e.target.value && !this.state.message) {
            isUserTyping = true;
            this.sendUserTyping(isUserTyping);
        } else if (!e.target.value) {
            isUserTyping = false;
            this.sendUserTyping(isUserTyping);
        }
        this.setState({
            isUserTyping,
            message: e.target.value,
        });
    }

    sendUserTyping(isTyping) {
        this.sendMessage(isTyping ? 'startedTyping' : 'stoppedTyping');
    }

    sendTextMessage() {
        const text = this.state.message;

        if (!this.state.targetUserName && text != '/help') return;

        if (text) {
            if (/^\/\w.*/.test(text)) {
                const command = /^\/(\w+)(?:\s)?(.*)?/i.exec(text);

                this.sendMessage('command', {
                    command: command[1],
                    commandArguments: command[2],
                });
            } else {
                this.sendMessage('text', {
                    text,
                    type: 'normal',
                });
            }
            this.sendUserTyping(false);
            this.setState({
                message: '',
                isUserTyping: false,
            });
        }
    }

    render() {

        const connectionMessage = this.props.connection.targetUserName ? (
            <React.Fragment>
                Connected as {this.props.connection.userName} with <strong>{this.state.targetUserName}</strong>
            </React.Fragment>) : 'Waiting for other user...';

        return (
            <div className="Chat">
                {JSON.stringify(this.props.connection)}
                {this.props.isConnected ? (
                    <React.Fragment>
                        <div className="top-bar">
                            <div className="text-muted small">
                                {connectionMessage}
                            </div>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => this.disconnect()}
                            >
                                Disconnect
                            </button>
                        </div>
                        <ChatMessages
                            messages={this.props.textMessages}
                            connectionId={this.state.connectionId}
                        />
                        <div className="status">
                            {this.props.connection.status}
                        </div>
                        <div className="message-input input-group">
                            <input
                                type="text"
                                id="message-input"
                                className="form-control"
                                onChange={e => this.messageInputChangeHandler(e)}
                                onKeyUp={e => e.key === 'Enter' && this.sendTextMessage()}
                                value={this.state.message}
                                placeholder="Type message or /help"
                                ref={el => {
                                    this.messageInputRef = el
                                }}
                            />
                            <div className="input-group-append">
                                <button
                                    onClick={() => this.sendTextMessage()}
                                    className="btn btn-outline-primary"
                                    disabled={!this.state.message || !this.state.targetUserName}
                                    type="button"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </React.Fragment>
                ) : (
                    <div className="initial-screen">
                        <div className="input-group">
                            <input
                                id="username-input"
                                type="text"
                                className="form-control"
                                onChange={e => this.setState({userName: e.target.value})}
                                onKeyUp={e => e.key === 'Enter' && !!this.state.userName && this.connect()}
                                placeholder="Please enter your username"
                                ref={el => this.userNameInputRef = el}
                            />
                            <div className="input-group-append">
                                <button
                                    disabled={!this.state.userName}
                                    onClick={() => this.connect()}
                                    className="btn btn-primary"
                                    type="button"
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                        {this.state.connectionError && (
                            <div className="mt-3 alert alert-danger">
                                {this.state.connectionError}
                            </div>
                        )
                        }
                    </div>
                )}
            </div>
        );
    }
}

export default connect((state, ownProps) => {
    return {
        textMessages: state.messages[ownProps.connection.connectionId] || [],
        ...ownProps.connection,
        // connection: ownProps.connection,
    }
}, (dispatch, ownProps) => {
    return {
        onConnect: login => {
            return dispatch(joinChat(ownProps.index, login));
        },
        onSendMessage: (type, content) => {
            dispatch(sendMessage(ownProps.connection, type, content));
        }
    }
})(Chat)
