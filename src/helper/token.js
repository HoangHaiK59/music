import { SpotifyConfig } from "../config";
import firebase from './firebase';

let refreshToken = localStorage.getItem('refresh_token');

export const refreshAccessToken = () => {
    const encodeCredentials = btoa(`${SpotifyConfig.client_id}:${SpotifyConfig.client_secret}`);
    return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        headers: {
            'Authorization': `Basic ${new Buffer.from(`${encodeCredentials}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

let authenticate;

function isAuthenticate() {

    firebase.firestore().collection('authen')
    .get()
    .then(result => {
        result.docs.forEach(doc => {
        authenticate =  fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${doc.data().access_token}`
            }
        })
        .then(res => {
            if(res.status !== 200) {
                return null
            }
            else return res.json()
            
        } )

     })});
     return authenticate !== null ? true : false
};

export default isAuthenticate;
