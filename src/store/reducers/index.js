import { SpotifyReducer } from "./spotify.reducer";
import { combineReducers } from "redux";

export const rootReducer = combineReducers({
  spotify: SpotifyReducer
});