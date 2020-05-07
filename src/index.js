import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { history } from "./helper/history";
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import {loadState, saveState} from './persitor';
import configStore from './store';

const persitedState = loadState(); 

//const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, ...middlewares));
//const store = compose(applyMiddleware(thunkMiddleware, ...middlewares))(createStore)(rootReducer);

const store = configStore(persitedState);

store.subscribe(() => {
  saveState(store.getState())
})

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
