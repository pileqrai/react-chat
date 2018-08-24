export const ADD_TARGET_USER = 'ADD_TARGET_USER';
export const SEND_MESSAGE = 'SEND_MESSAGE';
export const MESSAGE_SENT = 'MESSAGE_SENT';
export const USER_DISCONNECTED = 'USER_DISCONNECTED';
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const JOIN_CHAT = 'JOIN_CHAT';
export const JOINED_CHAT = 'JOINED_CHAT';
export const ADD_CHAT = 'ADD_CHAT';
export const SET_STATUS = 'SET_STATUS';
export const USER_NAME_CHANGE = 'USER_NAME_CHANGE';
export const DISCONNECT = 'DISCONNECT';
export const FADE_LAST = 'FADE_LAST';
export const OOPS = 'OOPS';

export const sendMessage = (connection, type, content = null) => {
	const message = {
		type,
		id: Date.now(),
		userName: connection.userName,
		sourceConnectionId: connection.connectionId,
		data: {
			...content,
		},
		targetUserName: null,
	};


	connection.ws.send(JSON.stringify(message));

	return {
		type: SEND_MESSAGE,
		connection: connection,
		message,
	}

};

export const handleCommandMessage = (message, connection, dispatch) => {
	let newAction;
	switch (message.data.command) {
		case 'userJoined':
			dispatch(addTargetUser(connection, message.data.userName));
			newAction = addMessage(connection, {
				type: 'text',
				data: {
					type: 'info',
					text: `${message.data.userName} has joined`,
				},
			});
			break;
		case 'joinedOtherUser':
			dispatch(addTargetUser(connection, message.data.userName));
			newAction = addMessage(connection, {
				type: 'text',
				data: {
					type: 'info',
					text: `You have joined ${message.data.userName}`,
				},
			});
			break;
		case 'userNameChange':
			dispatch(userNameChange(message.sourceConnectionId, message.data.to));
			const text = message.sourceConnectionId === connection.connectionId ?
				`You have renamed from ${message.data.from} to ${message.data.to}` :
				`${message.data.from} renamed to ${message.data.to}`;

			newAction = addMessage(connection, {
				type: 'text',
				data: {
					type: 'info',
					text,
				}
			});
			break;
		case 'userDisconnected':
			dispatch(addMessage(connection, {
				type: 'text',
				data: {
					type: 'info',
					text: `${message.data.userName} has left`,
				},
			}));

			newAction = userDisconnected(connection.connectionId);
			break;
		case 'fadelast':
			newAction = fadeLast(connection.connectionId, message.sourceConnectionId);
			break;
		case 'oops':
			newAction = oops(connection.connectionId, message.sourceConnectionId);
			break;
		case 'countdown':
			let i = message.data.time;
			newAction = dispatch => {
				const timer = window.setInterval(() => {
					dispatch(setStatus(connection.connectionId, `Redirecting to ${message.data.url} in ${i}...`));

					if (i === 0) {
						dispatch(setStatus(connection.connectionId, null));
						window.open(message.data.url, '_blank');
						clearInterval(timer);
					}
					i -= 1;
				}, 1000);
			};
	}

	return newAction;
};

export const joinChat = (index, login) => dispatch => {
	const ws = new WebSocket('ws://localhost:8085');
	const connection = {
		ws,
		userName: login,
	}

	// @todo move WS handlers to middleware

	ws.onmessage = (msg) => {
		const message = JSON.parse(msg.data);

		switch (message.type) {
			case 'command':
				const handledCommand = handleCommandMessage(message, connection, dispatch);
				dispatch(handledCommand);
				break;
			case 'text':
				dispatch(addMessage(connection, message));
				break;
			case 'startedTyping':
				dispatch(setStatus(connection.connectionId, `${message.userName} is typing...`));
				break;
			case 'stoppedTyping':
				dispatch(setStatus(connection.connectionId, null));
				break;
			case 'welcome':
				connection.connectionId = message.data.connectionId;
				connection.isConnected = true;
				dispatch({
					type: JOINED_CHAT,
					index,
					connection,
				});

				dispatch(sendMessage(connection, 'login'));
				break;
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

export const userDisconnected = (connectionId) => ({
	type: USER_DISCONNECTED,
	connectionId,
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

export const addTargetUser = (connection, targetUserName) => ({
	type: ADD_TARGET_USER,
	connection,
	targetUserName,
});

export const userNameChange = (connectionId, newUserName) => ({
	type: USER_NAME_CHANGE,
	connectionId,
	newUserName,
});

export const disconnect = (connection) => ({
	type: DISCONNECT,
	connection,
});

export const fadeLast = (connectionId, targetConnectionId) => ({
	type: FADE_LAST,
	connectionId,
	targetConnectionId,
});

export const oops = (connectionId, targetConnectionId) => ({
	type: OOPS,
	connectionId,
	targetConnectionId,
});