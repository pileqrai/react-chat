import Chat from "./components/Chat";
import * as React from "react";
import './App.scss';

/*TODO:
* const for message types
* error handling
* */

class App extends React.Component {
    render() {
        return (
            <div className="App container">
                <div className="row chat-container">
                    <div className="col-6"><Chat></Chat></div>
                    <div className="col-6"><Chat></Chat></div>
                </div>
            </div>
        );
    }
}

export default App;
