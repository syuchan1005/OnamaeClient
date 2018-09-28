import moment from 'moment';

export const ADD_TASK = 'ADD_TASK';
export const DELETE_TASK = 'DELETE_TASK';
export const EDIT_STATUS = 'EDIT_STATUS';


const initState = {
  tasks: [],
};

const task = (state = initState, action) => {
  const s = { ...state };
  switch (action.type) {
    case ADD_TASK:
      s.tasks.push(action.task);
      break;
    case DELETE_TASK:
      s.tasks.splice(action.index, 1);
      break;
    case EDIT_STATUS:{
      const taskA = s.tasks[action.index];
      if (action.ip) {
        taskA.$data.lastIP = action.ip;
        taskA.$data.lastDate = moment().format('YYYY/MM/DD HH:mm:ss');
      }
      taskA.$data.status = action.msg;
      break;
    }
    default:
      return state;
  }
  return s;
};

export default task;
