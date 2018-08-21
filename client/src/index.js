import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import chatReducer from "./reducers";
import {applyMiddleware, compose, createStore} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";


const wsMiddleware = store => next => action => {
    console.log(action.type);
    return next(action);
}

const store = createStore(chatReducer, {
        messages: {},
        connections: [],
    },
    compose(
        applyMiddleware(wsMiddleware),
        applyMiddleware(thunk),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
);
ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));
module.hot.accept();