import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import Home from './views/Home';

export default () => (
  <App>
    <Switch>
      <Route path="/" component={Home} />
    </Switch>
  </App>
);
