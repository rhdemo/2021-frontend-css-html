import { createStore } from "/node_modules/redux/es/redux.mjs";
import { appReducer } from "./reducers/reducer.js";

const store = createStore(appReducer);

export default store;