import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyB-cSazjO8YNUx_INqQC1xt1r-EJQU1PD8",
    authDomain: "todo-f6123.firebaseapp.com",
    databaseURL: "https://todo-f6123.firebaseio.com",
    projectId: "todo-f6123",
    storageBucket: "todo-f6123.appspot.com",
    messagingSenderId: "15763357581",
    appId: "1:15763357581:web:2d16546a9a0568be2387c4",
    measurementId: "G-R0972DXH50"
};

firebase.initializeApp(firebaseConfig);

export default firebase; 

