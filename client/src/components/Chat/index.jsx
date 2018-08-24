import React from 'react';
import ChatMessages from '../ChatMessages';
import './styles.scss';
import {sendMessage, joinChat, disconnect} from '../../actions';
import {connect} from 'react-redux';

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
		this.setState({
			userName: `User ${this.props.index}`
		});
		this.userNameInputRef && this.userNameInputRef.focus();
		window.setTimeout(this.connect.bind(this), 1000);
	}

	componentWillUnmount() {
		if (this.props.connection.ws && this.props.connection.ws.readyState < WebSocket.CLOSING) {
			this.disconnect();
		}
	}

	componentWillReceiveProps(p1, p2) {
		console.log('props change', p1,p2);
	}

	connect() {
		console.log(this.state)
		this.props.onConnect(this.state.userName);
	}

	disconnect() {
		this.sendMessage('command', {
			command: 'disconnect',
		});
		this.props.onDisconnect();
		this.setState(initialState);
	}

	sendMessage(type, content = null) {
		this.props.onSendMessage(type, content);
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

		if (!this.props.connection.targetUserName && text != '/help') return;

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
				Connected
				as {this.props.connection.userName} with <strong>{this.props.connection.targetUserName}</strong>
			</React.Fragment>) : 'Waiting for other user...';

		return (
			<div className="Chat">
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
							connectionId={this.props.connection.connectionId}
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
									disabled={!this.state.message || !this.props.connection.targetUserName}
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
								value={this.state.userName}
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
	}
}, (dispatch, ownProps) => {
	return {
		onConnect: login => {
			return dispatch(joinChat(ownProps.index, login));
		},
		onDisconnect: () => {
			return dispatch(disconnect(ownProps.connection));
		},
		onSendMessage: (type, content) => {
			dispatch(sendMessage(ownProps.connection, type, content));
		}
	}
})(Chat)
