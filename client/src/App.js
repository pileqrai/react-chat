import Chat from "./components/Chat";
import * as React from "react";
import './App.scss';

/*TODO:
* const for message types
* error handling
* */

class App extends React.Component {
    state = {
        hasSecondChat: false,
    };

    render() {
        const secondColumn = this.state.hasSecondChat ?
            <Chat/>
            :
            <div className="text-center mt-5">
                <button
                    className="btn btn-lg btn-outline-primary"
                    onClick={() => this.setState({hasSecondChat: true})}
                >
                    Add second chat window
                </button>
                <div className="small text-muted mt-3">Or in open another <a href="" target='_blank'>tab</a></div>
            </div>;
        return (
            <div className="App container">
                <div className="row chat-container">
                    <div className="col-6"><Chat/></div>
                    <div className="col-6">{secondColumn}</div>
                </div>
            </div>
        );
    }
}

export default App;
