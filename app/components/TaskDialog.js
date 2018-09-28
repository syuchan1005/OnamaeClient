import React,{ Component } from 'react';
import {
  Button, Checkbox, TextField,
  Dialog, DialogActions, DialogContent, DialogTitle,
  RadioGroup, Radio, FormControlLabel, DialogContentText,
  withStyles,
} from '@material-ui/core';
import PropTypes from 'prop-types';

const StyledDialogContentText = withStyles({
  root: {
    marginTop: '30px',
  },
})(DialogContentText);

class TaskDialog extends Component {
  static get emptyTask() {
    return {
      host: {
        subdomain: '',
        domain: '',
      },
      user: {
        id: '',
        pass: '',
      },
      ip: {
        type: 'default',
        customIP: '',
      },
      enabled: true,
    };
  }

  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onAddClick: PropTypes.func,
    task: PropTypes.object,
    addText: PropTypes.string,
  };

  // noinspection JSUnusedGlobalSymbols
  static defaultProps = {
    open: false,
    onClose: () => {},
    onAddClick: () => {},
    task: undefined,
    addText: 'Add',
  };

  state = {
    task: TaskDialog.emptyTask,
  };

  componentWillReceiveProps(props) {
    this.setState({task: (props.task || TaskDialog.emptyTask)});
  }

  render() {
    const {open, onAddClick, addText} = this.props;
    const { task }= this.state;
    const onClose = () => {
      this.setState({task: TaskDialog.emptyTask});
      if (this.props.onClose) this.props.onClose();
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add new task</DialogTitle>
        <DialogContent>
          <StyledDialogContentText style={{ marginTop: '0' }}>Host information</StyledDialogContentText>
          <TextField fullWidth label="Host name (Optional)" value={task.host.subdomain}
                     onChange={(event) => {
                       const s = { ...this.state };
                       s.task.host.subdomain = event.target.value;
                       this.setState(s);
                     }}/>
          <TextField fullWidth label="Domain name" value={task.host.domain}
                     onChange={(event) => {
                       const s = { ...this.state };
                       s.task.host.domain = event.target.value;
                       this.setState(s);
                     }}/>

          <StyledDialogContentText>Onamae.com login information</StyledDialogContentText>
          <TextField fullWidth label="Onamae ID" value={task.user.id} onChange={(event) => {
            const s = { ...this.state };
            s.task.user.id = event.target.value;
            this.setState(s);
          }}/>
          <TextField fullWidth label="Password" type="password" value={task.user.pass}
                     onChange={(event) => {
                       const s = { ...this.state };
                       s.task.user.pass = event.target.value;
                       this.setState(s);
                     }}/>

          <StyledDialogContentText>Update method</StyledDialogContentText>
          <RadioGroup
            aria-label="Update method"
            value={task.ip.type}
            onChange={(event, value) => {
              const s = { ...this.state };
              s.task.ip.type = value;
              this.setState(s);
            }}
          >
            <FormControlLabel control={<Radio/>} value="default"
                              label="Update with the currently connected IP address."/>
            <FormControlLabel control={<Radio/>} value="custom" label="Update with the entered IP address."/>
          </RadioGroup>

          <TextField fullWidth label="IP address" value={task.ip.customIP} onChange={(event) => {
            const s = { ...this.state };
            s.task.ip.customIP = event.target.value;
            this.setState(s);
          }}/>

          <FormControlLabel control={
            <Checkbox
              checked={task.enabled}
              color="primary"
              onChange={(event, checked) => {
                const s = { ...this.state };
                s.task.enabled = checked;
                this.setState(s);
              }}/>
          } label="Enable task"/>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => { if (onAddClick) {onAddClick(task);} onClose(); } } color="primary">
            {addText || 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default TaskDialog;
