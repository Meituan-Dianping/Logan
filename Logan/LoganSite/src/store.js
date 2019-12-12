import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createHashHistory } from "history"
import thunk from "redux-thunk";

import nativeListReducer from "./views/native-list/redux/reducer";
import nativeLogDetailReducer from "./views/native-log-detail/redux/reducer";
import webListReducer from "./views/web-list/redux/reducer";
import webLogDetailReducer from "./views/web-detail/redux/reducer";

const composeEnhancers = composeWithDevTools({});

export const history = createHashHistory();

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  nativeList: nativeListReducer,
  nativeLogDetail: nativeLogDetailReducer,
  webList: webListReducer,
  webLogDetail: webLogDetailReducer
});

let store = createStore(
  createRootReducer(history),
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(history),
      thunk
    )
  )
);

export default store;