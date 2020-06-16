import { SpotifyConfig } from "../config";
import firebase from './firebase';

var statusg;
var authenticate ;

function isAuthenticate() {
    let status = false;


    let final =  firebase.firestore().collection('authen')
        .get()
        .then(result => {
            if (result.docs.length <= 0) {
                return false;
            }
            else {
                result.docs.forEach(doc => {
                        fetch('https://api.spotify.com/v1/me', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${doc.data().access_token}`
                        }
                    })
                        .then(res => {
                            if (res.status !== 200) {
                                const encodeCredentials = btoa(`${SpotifyConfig.client_id}:${SpotifyConfig.client_secret}`);
                                return fetch('https://accounts.spotify.com/api/token', {
                                    method: 'POST',
                                    body: `grant_type=refresh_token&refresh_token=${doc.data().refresh_token}`,
                                    headers: {
                                        'Authorization': `Basic ${new Buffer.from(`${encodeCredentials}`)}`,
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }
                                }).then(data => {
                                    if (data.status !== 200) {
                                        return false
                                    } else {
                                        data.json().then(resp => {
                                            firebase.firestore().collection('authen')
                                            .get()
                                            .then(all => all.docs.forEach(doc => {
                                                firebase.firestore().collection('authen').doc(doc.id)
                                                    .update({ access_token: resp.access_token })
                                            }))
                                            //isAuthenticate();
                                        })
                                        return true
                                    }
                                });
                            }
                            if(res.status === 200) {
                                getAuth(true)
                            }
                            else {
                                getAuth(false);
                            }

                        })
                })
                return authenticate;
            }
        });



        final.then(function (fi) {
            getStatus(fi);
        })
    

    // async function getValue() {
    //     return await final.then(function (fi) {
    //         console.log(fi)
    //         return fi
    //     });
    // }


    return true ;

};



function getStatus(statusV) {
    statusg = statusV;
    return statusg;
}

function getAuth(auth) {
    authenticate = auth;
    return authenticate;
}


export default isAuthenticate;

