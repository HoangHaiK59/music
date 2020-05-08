import firebase from '../../helper/firebase';
import { SpotifyConstants } from '../constants';

const LOGOUT = () => {
    return {type: SpotifyConstants.LOGOUT}
}

const logout = () => {
    return dispatch => {
        dispatch(LOGOUT());
        firebase.firestore().collection('authen')
        .get().then(docs => docs.forEach(doc => firebase.firestore().collection('authen').doc(doc.id).delete().catch(error => console.log(error))))
    }
}

const getAcessToken = () => {

    return firebase.firestore().collection('authen').get();
}


export const actions = {
    logout,
    getAcessToken
}