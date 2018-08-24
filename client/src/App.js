import Chat from './components/Chat';
import * as React from 'react';
import {connect} from 'react-redux';
import './App.scss';
import {ADD_CHAT, addChat} from './actions';

class App extends React.Component<null, {
	hasSecondChat: boolean,
}> {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.props.addChat();
		this.props.addChat();
	}

	render() {
		const chats = this.props.connections.map((connection, index) =>
			(
				<div className="col-6"
				     key={index}>
					<Chat connection={connection}
					      index={index}/>
				</div>
			)
		)
		return (
			<div className="App container">
				<div className="row chat-container">
					{chats}
					{(chats.length < 3) && (
						<div className="text-center mt-5">
							<button
								className="btn btn-lg btn-outline-primary"
								onClick={() => this.props.dispatch(addChat())}
							>
								Add chat window
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
	return {
		connections: state.connections.slice() || [],
	}
}, (dispatch) => {
	return {
		addChat: () => dispatch(addChat()),
		dispatch,
	};
})(App);
