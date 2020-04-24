import {compose,applyMiddleware, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';

import {rootReducer} from './reducers';

const logger = store => next => action => {
    console.group(action.type)
    console.log('prev state', store.getState())
    console.info('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    console.groupEnd()
    return result
  }

const round = number => Math.round(number * 100) / 100
const monitorReducerEnhancer = createStore => (
  reducer,
  initialState,
  enhancer
) => {
  const monitoredReducer = (state, action) => {
    const start = performance.now()
    const newState = reducer(state, action)
    const end = performance.now()
    const diff = round(end - start)
    console.log('reducer process time:', diff)
    return newState
  }
  return createStore(monitoredReducer, initialState, enhancer)
}

export default function configStore(preloadState) {
    const middlewares = [logger, thunkMiddleware];
    const middlewareEnhancer = applyMiddleware(...middlewares)

    const enhancers = [middlewareEnhancer, monitorReducerEnhancer];
    const composedEnhancers = compose(...enhancers);

    const store = createStore(rootReducer,preloadState, composedEnhancers);

    if (process.env.NODE_ENV !== 'production' && module.hot) {
        module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
      }

    return store;
}