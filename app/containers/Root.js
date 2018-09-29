import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { PersistGate } from 'redux-persist/integration/react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ipcRenderer } from 'electron';
import s from '../store/configureStore';
import { allModIPTask } from '../actions/task';
import { updateIP } from '../actions/generalSetting';
import Routes from '../Routes';

ipcRenderer.on('menu:getIP', () => {
  s.dispatch(updateIP());
});

ipcRenderer.on('menu:clickRunAll', () => {
  s.dispatch(allModIPTask());
});

const { generalSetting } = s.getState();
const nextTime = moment(generalSetting.$data.ipUpdate, 'YYYY/MM/DD HH:mm:ss')
  .add(generalSetting.ipInterval, 'minutes');
const now = moment().valueOf();
ipcRenderer.send('onamae:setTimer', ((nextTime.valueOf() - now) < 0 ? now : nextTime).format('YYYY/MM/DD HH:mm:ss'));

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object,
    persistor: PropTypes.object,
    history: PropTypes.object,
  };

  static defaultProps = {
    store: {},
    persistor: {},
    history: {},
  };

  render() {
    const { store, history, persistor } = this.props;

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConnectedRouter history={history}>
            <Routes />
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    );
  }
}
