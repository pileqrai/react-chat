import React from 'react';
import {mount} from 'enzyme';
import {expect} from 'chai';
import ChatMessages from "../src/components/ChatMessages";
import Emojify from 'react-emojione';

import {JSDOM} from 'jsdom'
const dom = new JSDOM('<!doctype html><html><body></body></html>')
global.window = dom.window
global.document = dom.window.document

describe('<ChatMessages/>', () =>{
    const messages = [
        {
            id: 1,
            type: 'text',
            sourceConnectionId: 123,
            data: {
                type: 'normal',
                text: 'some text',
            }
        },
        {
            id: 2,
            type: 'text',
            sourceConnectionId: 456,
            data: {
                type: 'normal',
                text: 'some text :)',
            }
        }
    ]
    const wrapper = mount(<ChatMessages messages={messages} connectionId={123}/>);

    it('Component was rendered and has messages', () => {
        expect(wrapper.find('.ChatMessages')).to.have.length(1);
        expect(wrapper.find('.ChatMessages .message')).to.have.length(2);
    });

    it('Messages have appropriate classes', () => {
        expect(wrapper.find('.ChatMessages .message').at(0).hasClass('message--mine')).to.equal(true);
        expect(wrapper.find('.ChatMessages .message').at(1).hasClass('message--mine')).to.equal(false);
        expect(wrapper.find('.ChatMessages .message').at(1).hasClass('message--other-person')).to.equal(true);
    });

    it('Emojis are handled', () => {
        expect(wrapper.find('.ChatMessages .message').at(1).contains(Emojify)).to.be.true;
    });
});