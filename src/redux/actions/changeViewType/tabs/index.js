import { SET_VIEW_TYPE } from "../../../reducers/changeViewStyle/tabViews";

export const setViewType = (viewType) => ({
    type: SET_VIEW_TYPE,
    payload: viewType,
  });