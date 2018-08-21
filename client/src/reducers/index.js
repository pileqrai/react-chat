import type {AppState} from "../flow-types";
import {ADD_CHAT, ADD_MESSAGE, JOIN_CHAT, JOINED_CHAT, MESSAGE_SENT, SEND_MESSAGE, SET_STATUS} from "../actions";

// @flow


export default function chatReducer(state: AppState = defaultState, action): AppState {
    const newState = {...state};
    switch (action.type) {
        case JOIN_CHAT:
            return {
                ...state,
            };
        case JOINED_CHAT:
            newState.connections[action.index] = {...action.connection};
            newState.messages[action.connection.connectionId] = [];
            return newState;
        case SEND_MESSAGE:
            //newState.messages[action.connectionId].push(action.message)
            return newState;
        case ADD_CHAT:
            newState.connections = [...state.connections, {}];
            return newState;
        case SET_STATUS:
            newState.connections.find(connection => connection.connectionId === action.connectionId).status = action.status;
            return newState;
        case ADD_MESSAGE:
            newState.messages[action.connection.connectionId] = [...newState.messages[action.connection.connectionId], action.message]
            return newState;
        case MESSAGE_SENT:
        default:
            return state;
    }
}