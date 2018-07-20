//import { expect } from 'chai';
import { mount, render, shallow, configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { WebSocket, Server } from 'mock-socket';
// global.expect = expect;
//
// global.mount = mount;
// global.render = render;
// global.shallow = shallow;
global.WebSocket = WebSocket;
configure({ adapter: new Adapter() });