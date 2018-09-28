import { ipcRenderer } from 'electron';
import * as actionTypes from '../reducers/generalSetting';

export const changeIPInterval = (minutes) => ({
  type: actionTypes.CHANGE_IP_INTERVAL,
  minutes,
});

export const changeUpdateHost = (host) => ({
  type: actionTypes.CHANGE_UPDATE_HOST,
  host,
});

export const changeUpdatePort = (port) => ({
  type: actionTypes.CHANGE_UPDATE_PORT,
  port,
});

export const changeCheckHost = (host) => ({
  type: actionTypes.CHANGE_CHECK_HOST,
  host,
});

export const changeCheckPort = (port) => ({
  type: actionTypes.CHANGE_CHECK_PORT,
  port,
});

export const setCurrentIP = (ip) =>  ({
  type: actionTypes.SET_CURRENT_IP,
  ip,
});

export const updateIP = () => (dispatch, getState) => {
  ipcRenderer.once('onamae:getIP:res', (event, ip) => {dispatch(setCurrentIP(ip))});
  ipcRenderer.send('onamae:getIP', getState().generalSetting);
};
