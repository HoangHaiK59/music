import { SpotifyConstants } from "../constants";

const initState = {
  user: {},
  authticate: false,
  error: {}
};

export const SpotifyReducer = (state = initState, action) => {
  switch (action.type) {
    case SpotifyConstants.AUTH_REQ:
      return { ...state, authticate: false };
    case SpotifyConstants.AUTH_SUC:
      return { ...state, authticate: true, user: action.user };
    case SpotifyConstants.AUTH_FAIL:
      return { ...state, error: action.error };
    default:
      return state;
  }
};
