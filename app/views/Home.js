import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import RunIcon from '@material-ui/icons/PlayArrow';
import AddIcon from '@material-ui/icons/Add';

import moment from 'moment';
import { ipcRenderer } from 'electron';

import * as actions from '../actions/task';
import TaskTable from '../components/TaskTable';
import TaskDialog from '../components/TaskDialog';
import GeneralSettingDialog from '../components/GeneralSettingDialog';

class Home extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    task: PropTypes.object.isRequired,
    generalSetting: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  state = {
    newTaskDialogOpen: false,
    editIndex: -1,
    generalSettingOpen: false,
  };

  componentWillMount() {
    if (!ipcRenderer.listeners('menu:openGeneralSetting').includes(this.openGeneralSetting)) {
      ipcRenderer.on('menu:openGeneralSetting', this.openGeneralSetting);
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('menu:openGeneralSetting', this.openGeneralSetting);
  }

  openGeneralSetting = () => {
    this.setState(prevState => ({ ...prevState, generalSettingOpen: true }));
  };

  handleRunAll = () => {
    this.props.actions.allModIPTask();
  };

  render() {
    const { classes, task, generalSetting } = this.props;
    return (
      <div className={classes.home}>
        <Button variant="outlined" color="secondary" aria-label="Add" className={classes.button}
                onClick={() => this.setState(prevState => ({ ...prevState, newTaskDialogOpen: true }))}>
          <AddIcon/>
          New Task
        </Button>

        <TaskTable items={task ? task.tasks : []}
                   onClickDelete={this.props.actions.deleteTaskClick}
                   onClickEdit={(index) => {
                     this.setState(prevState => ({ ...prevState, editIndex: index, newTaskDialogOpen: true }));
                   }}
                   onClickRun={this.props.actions.modIPTask}/>

        <Button variant="contained" className={classes.runAllButton} style={{ backgroundColor: 'white' }}
                onClick={this.handleRunAll}>
          <RunIcon color='primary'/>
          Run All
        </Button>

        <footer className={classes.footer}>
          <div>
            <span>Next run time: {moment(generalSetting.$data.ipUpdate, 'YYYY/MM/DD HH:mm:ss')
              .add(generalSetting.ipInterval, 'minutes').format('YYYY/MM/DD HH:mm:ss')}</span>
          </div>
          <div>
            <span>IP address: {generalSetting.$data.ip} ({generalSetting.$data.ipUpdate})</span>
          </div>
        </footer>

        <TaskDialog
          open={this.state.newTaskDialogOpen}
          task={this.state.editIndex !== -1 ? task.tasks[this.state.editIndex] : undefined}
          addText={this.state.editIndex !== -1 ? 'Edit' : undefined}
          onClose={() => this.setState(prevState => ({ ...prevState, newTaskDialogOpen: false, editIndex: -1 }))}
          onAddClick={(addTask) => {
            if (this.state.editIndex === -1) this.props.actions.addTaskClick(addTask);
          }}/>

        <GeneralSettingDialog open={this.state.generalSettingOpen} onClose={() => {
          this.setState(prevState => ({ ...prevState, generalSettingOpen: false }));
        }}/>
      </div>
    );
  }
}

function mapDispatch(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

export default withStyles((theme) => ({
  home: {
    display: 'flex',
    'flex-direction': 'column',
  },
  runAllButton: {
    'margin-left': 'auto',
    'margin': '10px',
  },
  footer: {
    display: 'flex',
    'justify-content': 'space-between',
    'border-top': 'solid 1px lightgray',
  },
  button: {
    margin: theme.spacing.unit * 2,
    position: 'fixed',
    right: '0',
    top: '0',
    zIndex: 1,
  },
}))(connect(state => ({
  task: state.task,
  generalSetting: state.generalSetting,
}), mapDispatch)(Home));
