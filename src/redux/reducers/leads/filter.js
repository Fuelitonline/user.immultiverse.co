// reducers/leadsReducer.js

import { range } from "lodash";
export const LEAD_TOGGLE = 'LEAD_TOGGLE'
import { SET_FILTERS, SET_LEAD_DATA, TOGGLE_COLUMN, REORDER_COLUMNS, REFETCH_LEADS,APPLY_RANGE_FILTER, SET_DOWNLOAD_DATA, APPLY_CANVAN_FILTER } from "../../constents/leads/filter";

// Define initial state
const initialState = {
  filters: [],
  column: [],
  leadData: [],
  refetch : false,
  toggle : false,
  range:{},
  downloadData: [],
  gridFilter: false,
  canvanFilter : false
};
// Load initial state from local storage or use default
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('leadsState');
    if (serializedState === null) return initialState; // Use default initialState if none found
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return initialState;
  }
};

// Initialize state from local storage or use default initialState
const currentState = loadStateFromLocalStorage();

// Save state to local storage
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('leadsState', serializedState);
  } catch (err) {
    console.error("Could not save state to localStorage", err);
  }
};

// Generate a unique ID for a filter/column based on its label
const generateId = (label) => {
  const cleanedLabel = label?.trim().replace(/\s+/g, ' ');
  return cleanedLabel
    ?.split(' ')
    ?.map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    ?.join('');
}

// Create filter or column array with id and visibility
const createFilter = (filters) => {
  const data = [];

  filters?.map((filter) => data.push({
    id: generateId(filter?.label),
    label: filter?.label,
    visible: filter?.visible,
    type: filter?.type,
    options: filter?.options

  })) || [];

  return data;
};


// Reducer function
const leadsReducer = (state = currentState, action) => {
  switch (action.type) {
    case TOGGLE_COLUMN:
      const { columnId, isActive } = action.payload;

      // Update visibility status of the column while preserving order
      const updatedColumns = state.column.map(col =>
        col.id === columnId ? { ...col, visible: isActive } : col
      );

      const newState = {
        ...state,
        column: updatedColumns
      };

      // Save to local storage only if there's an actual change
      if (JSON.stringify(state.column) !== JSON.stringify(newState.column)) {
        saveStateToLocalStorage(newState);
      }

      return newState;

    case SET_FILTERS:
      const filters = action.payload;
      const newFilters = createFilter(filters);
      
      return {
        ...state,
        filters: newFilters,
        column: newFilters // Assuming you want to update columns with new filters
      };

    case SET_LEAD_DATA:
      return {
        ...state,
        leadData: action.payload
      };

    case REORDER_COLUMNS:
      return {
        ...state,
        column: action.payload
      };
    case REFETCH_LEADS:
      return {
        ...state,
        refetch : action.payload
      };
      case LEAD_TOGGLE:
      return {
        ...state,
        toggle : action.payload
      };
      case APPLY_RANGE_FILTER:
        return {
          ...state,
          range : action.payload
        };
      case SET_DOWNLOAD_DATA:
        return {
          ...state,
          downloadData : action.payload
        };
      case APPLY_CANVAN_FILTER :
        return {
           ...state,
           canvanFilter : action.payload
        }  
    default:
      return state;
  }
};

export default leadsReducer;
