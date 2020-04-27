import { SpotifyConstants } from "../constants";

const initState = {
  user: {},
  authticate: false,
  error: {},
  track_uri: '',
  linked_from_uri: '',
  playing: false,
  access_token: '',
  context_uri: ''
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
    case SpotifyConstants.CHANGE_TRACK_URI:
      return {...state, track_uri: action.track_uri, linked_from_uri: action.linked_from_uri};
    case SpotifyConstants.CHANGE_PLAYING:
      return {...state, playing: action.playing};
    case SpotifyConstants.CHANGE_ACCESS_TOKEN:
      return {...state, access_token: action.access_token};
    case SpotifyConstants.CHANGE_CONTEXT_URI:
      return {...state, context_uri: action.context_uri}
    default:
      return state;
  }
};
