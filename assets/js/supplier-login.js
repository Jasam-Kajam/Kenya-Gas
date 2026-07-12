// ======================================================
// supplier-login.js
// Part 1
// Firebase Imports & DOM Elements
// ======================================================

import {

    auth,
    db

} from "./firebase.js";

import {

    signInWithEmailAndPassword,

    GoogleAuthProvider,

    signInWithPopup,

    setPersistence,

    browserLocalPersistence,

    browserSessionPersistence,

    sendEmailVerification,

    signOut

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {

    doc,

    getDoc,

    updateDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ======================================================
// GOOGLE PROVIDER
// ======================================================

const provider = new GoogleAuthProvider();

provider.setCustomParameters({

    prompt: "select_account"

});

// ======================================================
// DOM ELEMENTS
// ======================================================

const form = document.getElementById(
    "supplierLoginForm"
);

const email = document.getElementById(
    "email"
);

const password = document.getElementById(
    "password"
);

const rememberMe = document.getElementById(
    "rememberMe"
);

const loginBtn = document.getElementById(
    "loginBtn"
);

const loginText = document.getElementById(
    "loginText"
);

const loginLoading = document.getElementById(
    "loginLoading"
);

const googleLoginBtn = document.getElementById(
    "googleLoginBtn"
);

const togglePassword = document.getElementById(
    "togglePassword"
);

// ======================================================
// SHOW/HIDE PASSWORD
// ======================================================

togglePassword.addEventListener(

    "click",

    ()=>{

        password.type =

            password.type === "password"

            ? "text"

            : "password";

        togglePassword.innerHTML =

            `<i class="bi bi-${
                password.type === "password"
                ? "eye"
                : "eye-slash"
            }"></i>`;

    }

);

// ======================================================
// BUTTON LOADING
// ======================================================

function setLoading(

    loading = true

){

    loginBtn.disabled = loading;

    googleLoginBtn.disabled = loading;

    loginText.classList.toggle(

        "d-none",

        loading

    );

    loginLoading.classList.toggle(

        "d-none",

        !loading

    );

}

// ======================================================
// ALERT
// ======================================================

function showAlert(

    message,

    type="danger"

){

    const oldAlert =

        document.getElementById(

            "loginAlert"

        );

    if(oldAlert){

        oldAlert.remove();

    }

    const alert =

        document.createElement("div");

    alert.id =

        "loginAlert";

    alert.className =

        `alert alert-${type}`;

    alert.innerHTML =

        `<i class="bi bi-info-circle-fill me-2"></i>${message}`;

    form.prepend(alert);

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

// ======================================================
// READY
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        console.log(

            "Supplier Login Ready"

        );

    }

);

// ======================================================
// LOGIN WITH EMAIL & PASSWORD
// ======================================================

form.addEventListener(

    "submit",

    async (e)=>{

        e.preventDefault();

        if(!form.checkValidity()){

            form.classList.add(

                "was-validated"

            );

            return;

        }

        try{

            setLoading(true);

            // =====================================
            // REMEMBER ME
            // =====================================

            await setPersistence(

                auth,

                rememberMe.checked

                ? browserLocalPersistence

                : browserSessionPersistence

            );

            // =====================================
            // SIGN IN
            // =====================================

            const userCredential =

                await signInWithEmailAndPassword(

                    auth,

                    email.value.trim(),

                    password.value

                );

            const user =

                userCredential.user;

            // =====================================
            // EMAIL VERIFIED?
            // =====================================

            if(

                !user.emailVerified

            ){

                await sendEmailVerification(

                    user

                );

                await signOut(auth);

                showAlert(

                    "Your email address has not been verified. A new verification email has been sent.",

                    "warning"

                );

                return;

            }

            // =====================================
            // GET SUPPLIER RECORD
            // =====================================

            const supplierRef =

                doc(

                    db,

                    "suppliers",

                    user.uid

                );

            const supplierSnap =

                await getDoc(

                    supplierRef

                );

            if(

                !supplierSnap.exists()

            ){

                await signOut(auth);

                showAlert(

                    "Supplier account not found."

                );

                return;

            }

            const supplier =

                supplierSnap.data();

            // =====================================
            // CHECK ROLE
            // =====================================

            if(

                supplier.accountType !==

                "supplier"

            ){

                await signOut(auth);

                showAlert(

                    "This account is not registered as a supplier."

                );

                return;

            }

            // =====================================
            // ACCOUNT APPROVAL
            // =====================================

            if(

                !supplier.approved

            ){

                await signOut(auth);

                showAlert(

                    "Your supplier account is still awaiting approval.",

                    "warning"

                );

                return;

            }

            // =====================================
            // ACCOUNT SUSPENDED
            // =====================================

            if(

                supplier.suspended

            ){

                await signOut(auth);

                showAlert(

                    "Your supplier account has been suspended. Please contact support."

                );

                return;

            }

            // =====================================
            // UPDATE LAST LOGIN
            // =====================================

            await updateDoc(

                supplierRef,

                {

                    lastLogin:

                        serverTimestamp()

                }

            );

                  // =====================================
            // LOGIN SUCCESS
            // =====================================

            showAlert(

                "Login successful. Redirecting to your dashboard...",

                "success"

            );

            setTimeout(

                ()=>{

                    window.location.href =

                        "supplier-dashboard.html";

                },

                1500

            );

        }

        catch(error){

            console.error(error);

            let message =

                "Unable to sign in.";

            switch(error.code){

                case "auth/invalid-credential":

                case "auth/wrong-password":

                case "auth/user-not-found":

                    message =

                        "Incorrect email or password.";

                    break;

                case "auth/invalid-email":

                    message =

                        "Please enter a valid email address.";

                    break;

                case "auth/too-many-requests":

                    message =

                        "Too many failed login attempts. Please try again later.";

                    break;

                case "auth/network-request-failed":

                    message =

                        "Network error. Check your internet connection.";

                    break;

                default:

                    message =

                        error.message;

            }

            showAlert(

                message,

                "danger"

            );

        }

        finally{

            setLoading(false);

        }

    }

);

// ======================================================
// GOOGLE SIGN-IN
// ======================================================

googleLoginBtn.addEventListener(

    "click",

    async ()=>{

        try{

            setLoading(true);

            const result =

                await signInWithPopup(

                    auth,

                    provider

                );

            const user =

                result.user;

            const supplierRef =

                doc(

                    db,

                    "suppliers",

                    user.uid

                );

            const supplierSnap =

                await getDoc(

                    supplierRef

                );

            if(

                !supplierSnap.exists()

            ){

                await signOut(auth);

                showAlert(

                    "No supplier account is linked to this Google account."

                );

                return;

            }

            const supplier =

                supplierSnap.data();

            if(

                !supplier.approved

            ){

                await signOut(auth);

                showAlert(

                    "Your supplier account is awaiting approval.",

                    "warning"

                );

                return;

            }

            if(

                supplier.suspended

            ){

                await signOut(auth);

                showAlert(

                    "Your supplier account has been suspended."

                );

                return;

            }

            await updateDoc(

                supplierRef,

                {

                    lastLogin:

                        serverTimestamp()

                }

            );

            showAlert(

                "Login successful. Redirecting...",

                "success"

            );

            setTimeout(

                ()=>{

                    window.location.href =

                        "supplier-dashboard.html";

                },

                1500

            );

        }

        catch(error){

            console.error(error);

            showAlert(

                "Google Sign-In failed. Please try again."

            );

        }

        finally{

            setLoading(false);

        }

    }

);

// ======================================================
// END OF supplier-login.js
// ======================================================
