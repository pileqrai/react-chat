import Chat from "./components/Chat";
import * as React from "react";
import {connect} from 'react-redux';
import './App.scss';
import {ADD_CHAT, addChat} from "./actions";

class App extends React.Component<null, {
    hasSecondChat: boolean,
}> {

    constructor(props) {
        console.log(props);
        super(props);
    }

    componentDidMount() {
        console.log('conenctions', this.props.connections);
        this.props.addChat();
    }

    render() {
        const chats = this.props.connections.map((connection, index) =>
            (
                <div className="col-6" key={index}>
                    {JSON.stringify(connection)}
                    <Chat connection={connection}
                          index={index}/>
                </div>
            )
        )
        return (
            <div className="App container">
                <div className="row chat-container">
                    {JSON.stringify(this.props.connections)}
                    <div className="row">
                        {chats}
                    </div>
                    {(chats.length === 1) && (
                        <div className="text-center mt-5">
                            <button
                                className="btn btn-lg btn-outline-primary"
                                onClick={() => this.props.dispatch(addChat())}
                            >
                                Add second chat window
                            </button>
                            <div className="small text-muted mt-3">Or in open another <a href=""
                                                                                         target='_blank'>tab</a></div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default connect(state => {
    console.log('new connections', state);
    return {
        connections: state.connections.slice() || [],
    }
}, (dispatch) => {
    return {
        addChat: () => dispatch(addChat()),
        dispatch,
    };
})(App);
