// src/redux/reducer.js
export const SET_VIEW_TYPE = 'SET_VIEW_TYPE';

const initialState = {
  viewType: 'menu', // default view type
};

const changeTabView = (state = initialState, action) => {
  switch (action.type) {
    case SET_VIEW_TYPE:
      return {
        ...state,
        viewType: action.payload,
      };
    default:
      return state;
  }
};

export default changeTabView;

