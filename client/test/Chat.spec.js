import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from 'chai';
import {Chat} from "../src/components/Chat";
import {JSDOM} from 'jsdom'
import * as sinon from "sinon";
import configureStore from 'redux-mock-store';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

describe('<Chat/>', () => {
    var mockStore = configureStore([]);
    const store = mockStore({
        connections: [],
        messages: {},
    });
    const wrapper = mount(<Chat store={store}></Chat>);

    it('Check if Chat component is created', () => {
        expect(wrapper.find('.Chat')).to.have.length(1);
    });


    var connectSpy = sinon.spy(wrapper.instance(), 'connect');

    it('Can\'t connect without username', () => {
        wrapper.find('.initial-screen button').simulate('click');
        wrapper.find('.initial-screen input').simulate('keyPress', {
            key: 'Enter',
            keyCode: 13,
            which: 13,
        });
        expect(connectSpy.callCount).to.equal(0);
    });

    it('Can connect with username', () => {
        wrapper.setState({userName: 'aaa'});
        wrapper.find('.initial-screen button').simulate('click');
        expect(connectSpy.callCount).to.equal(1);
    });

});