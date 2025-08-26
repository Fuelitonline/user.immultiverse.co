import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./theme/themeProvider";
import App from "./App"
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./redux/store";
import { Provider } from "react-redux";
import { AuthProvider } from "./middlewares/auth/authContext";
import { BrowserRouter as Router } from "react-router-dom"; 

// Create a new instance of QueryClient
const queryClient = new QueryClient();
//
const root = ReactDOM.createRoot(document.getElementById("root"));
// Render the app within the root.
root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient} >
      <ThemeProvider >
        <Router future={{ v7_relativeSplatPath: true }}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Router>
      </ThemeProvider>
     </QueryClientProvider> 
  </Provider>
);
