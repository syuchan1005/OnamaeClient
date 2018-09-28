import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  withStyles,
} from '@material-ui/core';

import * as generalSettingAction from '../actions/generalSetting';

class GeneralSettingDialog extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    actions: PropTypes.object,
    setting: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    classes: {},
    actions: {},
    setting: {},
    onClose: () => {},
  };

  render() {
    const { classes, setting, actions } = this.props;

    return (
      <div>
        <Button onClick={this.handleClickOpen}>Open form dialog</Button>
        <Dialog
          open={this.props.open}
          onClose={this.props.onClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">General Setting</DialogTitle>

          <DialogContent>
            <FormControl className={classes.selectField}>
              <InputLabel>IP check interval</InputLabel>
              <Select value={setting.ipInterval}
                      onChange={(event) => actions.changeIPInterval(event.target.value)}>
                <MenuItem value={1}>1 Minutes</MenuItem>
                <MenuItem value={5}>5 Minutes</MenuItem>
                <MenuItem value={10}>10 Minutes</MenuItem>
                <MenuItem value={30}>30 Minutes</MenuItem>
                <MenuItem value={60}>60 Minutes</MenuItem>
                <MenuItem value={180}>3 Hours</MenuItem>
                <MenuItem value={360}>6 Hours</MenuItem>
                <MenuItem value={720}>12 Hours</MenuItem>
                <MenuItem value={1440}>24 Hours</MenuItem>
              </Select>
            </FormControl>

            <DialogContentText className={classes.sectionText}>Update server information</DialogContentText>
            <TextField label="Host" value={setting.update.host} className={classes.hostField}
                       onChange={(event) => actions.changeUpdateHost(event.target.value)}/>
            <TextField label="Port" value={setting.update.port} className={classes.portField}
                       onChange={(event) => actions.changeUpdatePort(event.target.value)}/>

            <DialogContentText className={classes.sectionText}>IP check server information</DialogContentText>
            <TextField label="Host" value={setting.check.host} className={classes.hostField}
                       onChange={(event) => actions.changeCheckHost(event.target.value)}/>
            <TextField label="Port" value={setting.check.port} className={classes.portField}
                       onChange={(event) => actions.changeCheckPort(event.target.value)}/>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.props.onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

function mapDispatch(dispatch) {
  return {
    actions: bindActionCreators(generalSettingAction, dispatch),
  };
}

export default withStyles({
  hostField: {
    width: '70%',
  },
  portField: {
    width: '20%',
    marginLeft: 20,
  },
  selectField: {
    width: '50%',
  },
  sectionText: {
    marginTop: 10,
  },
})(connect(state => ({
  setting: state.generalSetting,
}), mapDispatch)(GeneralSettingDialog));
