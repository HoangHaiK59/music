import { SpotifyConstants } from "../constants";
import { axiosInstance } from "../../helper/axios";
import { history } from "../../helper/history";
// import querystring from "querystring";
// import { SpotifyConfig } from "../../config";

const AuthReq = () => ({ type: SpotifyConstants.AUTH_REQ });

const AuthSuc = user => ({ type: SpotifyConstants.AUTH_SUC, user: user });

const AuthFail = error => ({ type: SpotifyConstants.AUTH_FAIL, error: error });

const SpotifyAuth = () => {
  return dispatch => {
    dispatch(AuthReq());

    axiosInstance.get('http://localhost:8000/login')
    .then(
      res => {
        console.log(res);
        if(res.status === 200) {
          axiosInstance.get(res.data)
          .then(response => {
            if(response.status === 200) {
              dispatch(AuthSuc(response.data));
              history.push('/home');
            }
          })
        }
      }
    )
    .catch(error => dispatch(AuthFail(error)))

}};

export const SpotifyAction = {
  SpotifyAuth
};
