import PropTypes from 'prop-types';
import * as React from 'react';
import classNames from 'classnames';
import Emojify from 'react-emojione';
import './styles.scss';
import moment from "moment";

export default class ChatMessages extends React.Component {
    static propTypes = {
        messages: PropTypes.array.isRequired,
        connectionId: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);
        this.messagesContainer = React.createRef();
        this.messagesEnd = React.createRef();
    }

    componentDidUpdate() {
        window.setTimeout(() => {
            this.messagesContainer.current.scrollTop = this.messagesContainer.current.scrollHeight;
        }, 0);
    }

    render() {
        const messages = this.props.messages.map((msg, index) => {
            const classes = classNames('message', `message--${msg.data.type || 'normal'}`, {
                'message--mine': msg.sourceConnectionId === this.props.connectionId,
                'message--other-person': msg.sourceConnectionId && msg.sourceConnectionId !== this.props.connectionId,
            });

            const messageContent = msg.data.type === 'text' ? (
                <Emojify style={{height: 24, width: 24}}>
                    {msg.data.text}
                </Emojify>
            ) : (
                <div dangerouslySetInnerHTML={{__html: msg.data.text}} />
            );

            const messageDate = moment(msg.id).format('lll');

            // Alternatively handling ;) and :) could be done with simple string replacing, e.g.
            // const messageContent = msg.data.text.replace(/:\)/g,'☺️').replace(/;\)/g,'😉')
            // but using library gives more options and provides more compatibility

            msg.id = msg.id || Math.round(Math.random() * 10000);

            return (
                <div
                    key={`${msg.sourceConnectionId}#${msg.id}`}
                    className={classes}
                >
                    <div className="content">
                        {messageContent}
                    </div>
                    <div className="date">
                        {messageDate}
                    </div>
                </div>
            );
        });

        return (
            <div className="ChatMessages" ref={this.messagesContainer}>
                {messages}
            </div>
        );
    }
}
