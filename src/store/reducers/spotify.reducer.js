import { SpotifyConstants } from "../constants";

const initState = {
  user: {},
  authenticate: false,
  track_uri: '',
  linked_from_uri: '',
  playing: false,
  access_token: '',
  context_uri: '',
  repeat_track: false,
  position_ms: 0
};

export const SpotifyReducer = (state = initState, action) => {
  switch (action.type) {
    case SpotifyConstants.LOGIN:
      return { ...state, authenticate: true };
    case SpotifyConstants.LOGOUT:
      return { ...state, authenticate: false };
    case SpotifyConstants.REFRESH_TOKEN:
      return {...state, isRefresh: !state.isRefresh};
    case SpotifyConstants.CHANGE_TRACK_URI:
      return {...state, track_uri: action.track_uri, linked_from_uri: action.linked_from_uri, repeat_track: false};
    case SpotifyConstants.CHANGE_PLAYING:
      return {...state, playing: action.playing};
    case SpotifyConstants.CHANGE_ACCESS_TOKEN:
      return {...state, access_token: action.access_token, authenticate: true};
    case SpotifyConstants.CHANGE_CONTEXT_URI:
      return {...state, context_uri: action.context_uri, playing: action.playing};
    case SpotifyConstants.REPEAT_TRACK:
      return {...state, repeat_track: action.repeat_track};
    case SpotifyConstants.POSITION_MS:
      return {...state, position_ms: action.position_ms};
    case SpotifyConstants.USER:
      return {...state, user: action.user};
    default:
      return state;
  }
};
