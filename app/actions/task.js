import { ipcRenderer, remote } from 'electron';

import * as actionTypes from '../reducers/task';
import { updateIP } from './generalSetting';

export const addTaskClick = (task) => ({
  type: actionTypes.ADD_TASK,
  task: {
    ...task,
    $data: {
      lastIP: '',
      lastDate: '',
      status: 'Never run',
    },
  },
});

export const deleteTaskClick = (index) => ({
  type: actionTypes.DELETE_TASK,
  index,
});

export const editStatus = (index, msg, ip) => ({
  type: actionTypes.EDIT_STATUS,
  index,
  msg,
  ip,
});

export const modIPTask = (index) => (dispatch, getState) => {
  dispatch(updateIP());
  const state = getState();
  const task = state.task.tasks[index];
  dispatch(editStatus(index, 'SETTING IP'));
  ipcRenderer.once('onamae:modIP:res', (event, result, isSuccess, ip) => {
    dispatch(editStatus(index, result, ip));
  });
  ipcRenderer.send('onamae:modIP', state.generalSetting, task);
};

export const allModIPTask = () => (dispatch, getState) => {
  dispatch(updateIP());
  const state = getState();
  state.task.tasks.reduce((prev, next, index) => prev.then(() => new Promise((resolve) => {
      dispatch(editStatus(index, 'SETTING IP'));
      ipcRenderer.once('onamae:modIP:res', (event, result, isSuccess, ip) => {
        dispatch(editStatus(index, result, ip));
        resolve();
      });
      ipcRenderer.send('onamae:modIP', state.generalSetting, next);
    }),
  ), Promise.resolve());
};
