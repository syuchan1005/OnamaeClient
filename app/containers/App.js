import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

export default class App extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    const { children } = this.props;
    return (<Fragment>{children}</Fragment>);
  }
}
