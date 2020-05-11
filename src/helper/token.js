import { SpotifyConfig } from "../config";
import firebase from './firebase';


function isAuthenticate() {

    let authenticate, refresh;

    let final = firebase.firestore().collection('authen')
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
                const encodeCredentials = btoa(`${SpotifyConfig.client_id}:${SpotifyConfig.client_secret}`);
                refresh = fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    body: `grant_type=refresh_token&refresh_token=${doc.data().refresh_token}`,
                    headers: {
                        'Authorization': `Basic ${new Buffer.from(`${encodeCredentials}`)}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(data => {
                    if(data.status !== 200) {
                        return undefined
                    } else {
                        return data.json()
                    }
                });
                console.log(refresh !== undefined? 'true': false)
                if(refresh !== undefined) {
                    refresh.then(resp => {
                        firebase.firestore().collection('authen')
                        .get()
                        .then(all => all.docs.forEach(doc => {
                            firebase.firestore().collection('authen').doc(doc.id)
                            .update({access_token: resp.access_token})
                        }))
                        isAuthenticate();
                    })
                } else {
                    return undefined;
                }
            }
            else return res.json()
            
        } )
     })
     return authenticate === undefined ? false:  true
    });
    return final.then(fi => {
        if(fi) return fi;
        else return undefined
    }) !== undefined ? true: false
};

export default isAuthenticate;
