import type {AppState} from '../flow-types';
import {
	ADD_CHAT,
	ADD_MESSAGE,
	ADD_TARGET_USER,
	DISCONNECT, FADE_LAST,
	JOIN_CHAT,
	JOINED_CHAT,
	MESSAGE_SENT, OOPS,
	SEND_MESSAGE,
	SET_STATUS,
	USER_DISCONNECTED,
	USER_NAME_CHANGE
} from '../actions';

// @flow


export default function chatReducer(state: AppState = defaultState, action): AppState {
	const newState = {...state};
	switch (action.type) {
		case ADD_TARGET_USER:
			newState.connections.find(connection => connection.connectionId === action.connection.connectionId).targetUserName = action.targetUserName
			return {
				...newState,
			};
		case JOIN_CHAT:
			return {
				...state,
			};
		case JOINED_CHAT:
			newState.connections[action.index] = {...action.connection};
			newState.messages[action.connection.connectionId] = [];
			return newState;
		case SEND_MESSAGE:
			if (action.message.type === 'text') {
				newState.messages[action.connection.connectionId] = [...newState.messages[action.connection.connectionId], action.message];
			}
			return newState;
		case ADD_CHAT:
			newState.connections = [...state.connections, {}];
			return newState;
		case SET_STATUS:
			newState.connections.find(connection => connection.connectionId === action.connectionId).status = action.status;
			return newState;
		case ADD_MESSAGE:
			newState.messages[action.connection.connectionId] = [...newState.messages[action.connection.connectionId], action.message];
			return newState;
		case USER_NAME_CHANGE:
			newState.connections.forEach((connection) => {
				if (connection.connectionId === action.connectionId) {
					connection.userName = action.newUserName;
				} else {
					connection.targetUserName = action.newUserName;
				}
			});
			return newState;
		case USER_DISCONNECTED:
			newState.connections.find(connection => connection.connectionId === action.connectionId).targetUserName = null;
			return newState;
		case DISCONNECT:
			const connectionIndex = newState.connections.indexOf(action.connection);
			action.connection.ws.close();
			delete newState.messages[action.connection.connectionId];
			newState.connections.splice(connectionIndex, 1);
			return newState;

		case FADE_LAST: {
			const messages = [...newState.messages[action.connectionId]];
			const indexToChange = getLastMessageIndex(messages, action.targetConnectionId);

			if (indexToChange > -1) {
				messages[indexToChange].data.type = 'faded';
			}
			newState.messages[action.connectionId] = messages;
			return newState;
		}
		case OOPS: {
			const messages = [...state.messages[action.connectionId]];
			const indexToChange = getLastMessageIndex(messages, action.targetConnectionId);

			if (indexToChange > -1) {
				messages.splice(indexToChange, 1);
			}
			newState.messages[action.connectionId] = messages;
			return newState;
		}
		case MESSAGE_SENT:
		default:
			return state;
	}
}

function getLastMessageIndex(messages, connectionId) {
	let indexToRemove = -1;

	for (let i = messages.length - 1; i >= 0; i--) {
		if ((messages[i].sourceConnectionId === connectionId) && messages[i].data.type !== 'info') {
			indexToRemove = i;
			break;
		}
	}

	return indexToRemove;
}
