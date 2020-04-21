import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import { rootReducer } from "./store";
import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import { Router } from "react-router";
import { history } from "./helper/history";
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
let middlewares = [];
if(process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger');
  middlewares.push(logger);
}
//const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, ...middlewares));
const store = compose(applyMiddleware(thunkMiddleware, ...middlewares))(createStore)(rootReducer);
const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
  rootElement
);
