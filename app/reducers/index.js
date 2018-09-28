import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist'
import createElectronStorage from "redux-persist-electron-storage";
import { routerReducer as router } from 'react-router-redux';

import task from './task';
import generalSetting from './generalSetting';

const storage = createElectronStorage();

const rootReducer = combineReducers({
  task,
  generalSetting,
  router
});

export default persistReducer({
  key: 'root',
  storage,
  whitelist: ['task', 'generalSetting'],
},rootReducer);
