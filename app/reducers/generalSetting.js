import moment from 'moment';
import { ipcRenderer } from 'electron';

export const CHANGE_IP_INTERVAL = 'CHANGE_IP_INTERVAL';
export const CHANGE_UPDATE_HOST = 'CHANGE_UPDATE_HOST';
export const CHANGE_UPDATE_PORT = 'CHANGE_UPDATE_PORT';
export const CHANGE_CHECK_HOST = 'CHANGE_CHECK_HOST';
export const CHANGE_CHECK_PORT = 'CHANGE_CHECK_PORT';

export const SET_CURRENT_IP = 'SET_CURRENT_IP';

const initState = {
  ipInterval: 720, // 12 hours
  update: {
    host: 'ddnsclient.onamae.com',
    port: 65010,
  },
  check: {
    host: 'ddnsclient.onamae.com',
    port: 65000,
  },
  $data: {
    ip: '0.0.0.0',
    ipUpdate: '9999/99/99 99:99:99',
  },
};

const setTimer = (state) => {
  const nextTime = moment(state.$data.ipUpdate, 'YYYY/MM/DD HH:mm:ss')
    .add(state.ipInterval, 'minutes').format('YYYY/MM/DD HH:mm:ss');
  ipcRenderer.send('onamae:setTimer', nextTime);
};

const generalSetting = (state = initState, action) => {
  const s = { ...state };
  switch (action.type) {
    case CHANGE_IP_INTERVAL:
      s.ipInterval = action.minutes;
      setTimer(s);
      break;
    case CHANGE_UPDATE_HOST:
      s.update.host = action.host;
      break;
    case CHANGE_UPDATE_PORT:
      s.update.port = action.port;
      break;
    case CHANGE_CHECK_HOST:
      s.check.host = action.host;
      break;
    case CHANGE_CHECK_PORT:
      s.check.port = action.port;
      break;
    case SET_CURRENT_IP:
      s.$data.ip = action.ip;
      s.$data.ipUpdate = moment().format('YYYY/MM/DD HH:mm:ss');
      setTimer(s);
      break;
    default:
      return state;
  }
  return s;
};

export default generalSetting;
