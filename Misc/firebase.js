import firebase from 'firebase/app';
import 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPQ18ibbI04JPHAycqz-0Rx87RsScapZ4",
    authDomain: "tracka-e3607.firebaseapp.com",
    projectId: "tracka-e3607",
    storageBucket: "tracka-e3607.appspot.com",
    messagingSenderId: "595199512487",
    appId: "1:595199512487:web:ab48db73544efb60503082"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();

