// reducers/index.js
import { combineReducers } from 'redux';
import { userRegistrationReducer } from './userRagistration';
import changeTabView from './changeViewStyle/tabViews';
import projectsReducer from './projects';
import leadsReducer from './leads/filter';



const rootReducer = combineReducers({
      ragistrationProgress:userRegistrationReducer,
      changeTabView:changeTabView,
      projects:projectsReducer,
      leads:leadsReducer,

  
});

export default rootReducer;
