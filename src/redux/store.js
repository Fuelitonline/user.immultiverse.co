import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
import { createLogger } from 'redux-logger';

// Logger middleware configuration
const logger = createLogger({
  collapsed: true,
  diff: true,
});

const isDevelopment = process.env.NODE_ENV !== 'production';

const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false, // Adjust as needed
      immutableCheck: false, // Adjust as needed
    });

    if (isDevelopment) {
      middlewares.push(logger);
    }

    return middlewares;
  },

  devTools: isDevelopment, // Enable Redux DevTools in development
});

export default store;
