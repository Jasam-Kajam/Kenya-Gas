// assets/js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCRm2KV_UTnd9YC2n7qS3ue4d9EfFhCv08",
    authDomain: "kenyagas-46f74.firebaseapp.com",
    projectId: "kenyagas-46f74",
    storageBucket: "kenyagas-46f74.firebasestorage.app",
    messagingSenderId: "788150431037",
    appId: "1:788150431037:web:a3364a333bc7e09995e954",
    measurementId: "G-ELBF8JH72C"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

import {

    getStorage

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

export {

    auth,

    db,

    storage,

    googleProvider

};
