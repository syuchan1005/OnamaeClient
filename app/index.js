import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import store, { persistor, history } from './store/configureStore';
import './app.global.css';

render(
  <AppContainer>
    <Root store={store} history={history} persistor={persistor}/>
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} persistor={persistor}/>
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
