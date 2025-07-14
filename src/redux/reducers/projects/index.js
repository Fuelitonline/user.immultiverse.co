import {
    PROJECT_UPDATE, TOGGLE_PROJECT_LEAD} from '../../constents/projects/index.js';
  
  const initialState = {
    update: false,
    toggle : false,
  };

  const projectsReducer = (state = initialState, action) => {
    switch (action.type) {
      case PROJECT_UPDATE:

        return {
          update : action.payload
        };
        case TOGGLE_PROJECT_LEAD:

        return {
          toggle : action.payload
        };
      default:
        return state;
    }
  };
  
  export default projectsReducer;