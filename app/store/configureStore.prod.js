import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import { persistStore } from 'redux-persist'
import rootReducer from '../reducers';

export const history = createHashHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

const store = createStore(rootReducer, enhancer);
export const persistor = persistStore(store);

export default store;
