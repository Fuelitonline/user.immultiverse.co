import { REORDER_COLUMNS, SET_FILTERS, SET_LEAD_DATA, TOGGLE_COLUMN } from "../../constents/leads/filter";

export const setFilters = (filters) => ({
    type: SET_FILTERS,
    payload: filters
  });
  
  export const setLeadData = (leadData) => ({
    type: SET_LEAD_DATA,
    payload: leadData
  });

  export const toggleColumn = (columnId, isActive) => ({
    type: TOGGLE_COLUMN,
    payload: { columnId, isActive }
  });

  export const reorderColumns = (columns) => ({
    type: REORDER_COLUMNS,
    payload: columns,
  });
