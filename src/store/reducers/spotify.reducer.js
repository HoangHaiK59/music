import { SpotifyConstants } from "../constants";

const initState = {
  user: {},
  authticate: false,
  error: {},
  isRefresh: false,
  track_id: ''
};

export const SpotifyReducer = (state = initState, action) => {
  switch (action.type) {
    case SpotifyConstants.AUTH_REQ:
      return { ...state, authticate: false };
    case SpotifyConstants.AUTH_SUC:
      return { ...state, authticate: true, user: action.user };
    case SpotifyConstants.AUTH_FAIL:
      return { ...state, error: action.error };
    case SpotifyConstants.REFRESH_TOKEN:
      return {...state, isRefresh: !state.isRefresh};
    case SpotifyConstants.CHANGE_TRACK_ID:
      return {...state, track_id: action.id}
    default:
      return state;
  }
};
