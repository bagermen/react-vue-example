import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { createHashHistory } from 'history';
import persistState from 'redux-localstorage'

import { routerMiddleware } from 'connected-react-router';
import { CookiesProvider } from 'react-cookie';

import Routes from './routes';
import thunk from 'redux-thunk';
import createRootReducer from  './reducers';
import './scss/variables.scss';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create a history of your choosing (we're using a browser history in this case)
const history = createHashHistory()
// Build the middleware for intercepting and dispatching navigation actions
const middleware = routerMiddleware(history);

const store = createStore(
  createRootReducer(history),
  composeEnhancers(
    applyMiddleware(thunk),
    applyMiddleware(middleware),
    persistState(
      'BrandVideo',
      {
        key: 'cltv-loader',
        slicer: (path) => {
          return (state) => {
            let VideoFilter = state[path]['VideoFilter'];

            return {[path]: {VideoFilter} };
          }
        }
      }
    )
  ));


ReactDOM.render(
  <CookiesProvider>
    <Provider store={store}>
      <Routes history={history}/>
    </Provider>
  </CookiesProvider>,
  root
);

