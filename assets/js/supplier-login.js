/* ==========================================================
   Kenya Gas Marketplace
   Supplier Login
   Part 1
========================================================== */

/* ==========================
   FIREBASE
========================== */

import { auth, db } from "./firebase.js";

import {

    signInWithEmailAndPassword,

    GoogleAuthProvider,

    signInWithPopup,

    browserLocalPersistence,

    browserSessionPersistence,

    setPersistence,

    onAuthStateChanged,

    sendEmailVerification,

    signOut

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    doc,

    getDoc,

    setDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================
   DOM ELEMENTS
========================== */

const form =
    document.getElementById("supplierLoginForm");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const rememberMe =
    document.getElementById("rememberMe");

const loginBtn =
    document.getElementById("loginBtn");

const loginBtnText =
    document.getElementById("loginBtnText");

const loginSpinner =
    document.getElementById("loginSpinner");

const togglePassword =
    document.getElementById("togglePassword");

const togglePasswordIcon =
    document.getElementById("togglePasswordIcon");

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

const alertContainer =
    document.getElementById("alertContainer");

const loadingOverlay =
    document.getElementById("loadingOverlay");

/* ==========================
   GLOBAL VARIABLES
========================== */

const googleProvider =
    new GoogleAuthProvider();

let isSubmitting = false;

/* ==========================
   ALERTS
========================== */

function showAlert(message, type = "danger") {

    alertContainer.innerHTML = `

        <div class="alert alert-${type} alert-dismissible fade show">

            ${message}

            <button

                type="button"

                class="btn-close"

                data-bs-dismiss="alert">

            </button>

        </div>

    `;

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

function clearAlert() {

    alertContainer.innerHTML = "";

}

/* ==========================
   BUTTON LOADING
========================== */

function showLoading() {

    isSubmitting = true;

    loginBtn.disabled = true;

    loginBtnText.style.display = "none";

    loginSpinner.style.display = "inline-flex";

}

function hideLoading() {

    isSubmitting = false;

    loginBtn.disabled = false;

    loginBtnText.style.display = "inline";

    loginSpinner.style.display = "none";

}

/* ==========================
   PAGE LOADER
========================== */

function hidePageLoader() {

    if (!loadingOverlay) return;

    loadingOverlay.classList.add("hidden");

    setTimeout(() => {

        loadingOverlay.remove();

    }, 400);

}

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Login
   Part 2
========================================================== */

/* ==========================
   PASSWORD VISIBILITY
========================== */

function togglePasswordVisibility() {

    if (password.type === "password") {

        password.type = "text";

        togglePasswordIcon.classList.remove("bi-eye");
        togglePasswordIcon.classList.add("bi-eye-slash");

    } else {

        password.type = "password";

        togglePasswordIcon.classList.remove("bi-eye-slash");
        togglePasswordIcon.classList.add("bi-eye");

    }

}

togglePassword.addEventListener(

    "click",

    togglePasswordVisibility

);

/* ==========================
   REMEMBER ME
========================== */

const REMEMBER_EMAIL_KEY =
    "kgm_supplier_email";

function saveRememberedEmail() {

    if (rememberMe.checked) {

        localStorage.setItem(

            REMEMBER_EMAIL_KEY,

            email.value.trim()

        );

    } else {

        localStorage.removeItem(

            REMEMBER_EMAIL_KEY

        );

    }

}

function loadRememberedEmail() {

    const savedEmail =

        localStorage.getItem(

            REMEMBER_EMAIL_KEY

        );

    if (!savedEmail) return;

    email.value = savedEmail;

    rememberMe.checked = true;

}

/* ==========================
   EMAIL INPUT
========================== */

email.addEventListener(

    "change",

    saveRememberedEmail

);

rememberMe.addEventListener(

    "change",

    saveRememberedEmail

);

/* ==========================
   EMAIL VALIDATION
========================== */

function isValidEmail(emailAddress) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(emailAddress);

}

/* ==========================
   FORM VALIDATION
========================== */

function validateLoginForm() {

    clearAlert();

    if (

        email.value.trim() === ""

    ) {

        showAlert(

            "Please enter your email address."

        );

        email.focus();

        return false;

    }

    if (

        !isValidEmail(

            email.value.trim()

        )

    ) {

        showAlert(

            "Please enter a valid email address."

        );

        email.focus();

        return false;

    }

    if (

        password.value.trim() === ""

    ) {

        showAlert(

            "Please enter your password."

        );

        password.focus();

        return false;

    }

    return true;

}

/* ==========================
   ENTER KEY SUPPORT
========================== */

password.addEventListener(

    "keypress",

    event => {

        if (

            event.key === "Enter"

        ) {

            form.requestSubmit();

        }

    }

);

/* ==========================
   LOAD SAVED EMAIL
========================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadRememberedEmail();

    }

);

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Login
   Part 3
========================================================== */

/* ==========================
   LOGIN
========================== */

form.addEventListener("submit", loginSupplier);

async function loginSupplier(e) {

    e.preventDefault();

    if (isSubmitting) return;

    if (!validateLoginForm()) return;

    try {

        showLoading();

        /* --------------------------
           Session Persistence
        -------------------------- */

        await setPersistence(

            auth,

            rememberMe.checked
                ? browserLocalPersistence
                : browserSessionPersistence

        );

        /* --------------------------
           Sign In
        -------------------------- */

        const credential =
            await signInWithEmailAndPassword(

                auth,

                email.value.trim(),

                password.value

            );

        const user = credential.user;

        saveRememberedEmail();

        /* --------------------------
           Email Verification
        -------------------------- */

        if (!user.emailVerified) {

            await sendEmailVerification(user);

            await signOut(auth);

            hideLoading();

            showAlert(

                "Your email address has not been verified. A new verification email has been sent. Please verify your email before signing in.",

                "warning"

            );

            return;

        }

        /* --------------------------
           Supplier Document
        -------------------------- */

        const supplierRef =
            doc(db, "suppliers", user.uid);

        const supplierSnap =
            await getDoc(supplierRef);

        if (!supplierSnap.exists()) {

            await setDoc(

                supplierRef,

                {

                    uid: user.uid,

                    fullName:
                        user.displayName || "",

                    email:
                        user.email,

                    verified: true,

                    approvalStatus:
                        "Pending Review",

                    sellerStatus:
                        "Inactive",

                    createdAt:
                        serverTimestamp(),

                    lastLogin:
                        serverTimestamp()

                }

            );

        } else {

            await setDoc(

                supplierRef,

                {

                    lastLogin:
                        serverTimestamp()

                },

                {

                    merge: true

                }

            );

        }

        /* --------------------------
           Success
        -------------------------- */

        hideLoading();

        showAlert(

            "Login successful. Redirecting to your supplier dashboard...",

            "success"

        );

        setTimeout(() => {

            window.location.href =
                "supplier-dashboard.html";

        }, 1200);

    }

    catch (error) {

        console.error(error);

        hideLoading();

        let message =
            "Unable to sign in.";

        switch (error.code) {

            case "auth/invalid-credential":

            case "auth/wrong-password":

            case "auth/user-not-found":

                message =
                    "Incorrect email or password.";

                break;

            case "auth/invalid-email":

                message =
                    "Invalid email address.";

                break;

            case "auth/too-many-requests":

                message =
                    "Too many failed attempts. Please try again later.";

                break;

            case "auth/network-request-failed":

                message =
                    "Network error. Please check your internet connection.";

                break;

        }

        showAlert(message);

    }

}

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Login
   Part 4
========================================================== */

/* ==========================
   GOOGLE SIGN IN
========================== */

googleLoginBtn.addEventListener("click", signInWithGoogle);

async function signInWithGoogle() {

    if (isSubmitting) return;

    try {

        showLoading();

        googleProvider.setCustomParameters({

            prompt: "select_account"

        });

        const result = await signInWithPopup(

            auth,

            googleProvider

        );

        const user = result.user;

        /* --------------------------
           Supplier Document
        -------------------------- */

        const supplierRef = doc(

            db,

            "suppliers",

            user.uid

        );

        const supplierSnap = await getDoc(

            supplierRef

        );

        if (!supplierSnap.exists()) {

            await setDoc(

                supplierRef,

                {

                    uid: user.uid,

                    firstName:
                        user.displayName
                            ? user.displayName.split(" ")[0]
                            : "",

                    lastName:
                        user.displayName
                            ? user.displayName.split(" ").slice(1).join(" ")
                            : "",

                    fullName:
                        user.displayName || "",

                    email:
                        user.email || "",

                    phone:
                        user.phoneNumber || "",

                    photoURL:
                        user.photoURL || "",

                    provider:
                        "google",

                    verified: true,

                    verificationStatus:
                        "Verified",

                    approvalStatus:
                        "Pending Review",

                    sellerStatus:
                        "Inactive",

                    receiveUpdates: true,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp(),

                    lastLogin:
                        serverTimestamp()

                }

            );

        } else {

            await setDoc(

                supplierRef,

                {

                    lastLogin:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                },

                {

                    merge: true

                }

            );

        }

        hideLoading();

        showAlert(

            "Google sign-in successful. Redirecting...",

            "success"

        );

        setTimeout(() => {

            window.location.href =
                "supplier-dashboard.html";

        }, 1000);

    }

    catch (error) {

        console.error(error);

        hideLoading();

        let message =
            "Google sign-in failed.";

        switch (error.code) {

            case "auth/popup-closed-by-user":

                message =
                    "Google sign-in was cancelled.";

                break;

            case "auth/popup-blocked":

                message =
                    "Popup was blocked. Please allow popups and try again.";

                break;

            case "auth/network-request-failed":

                message =
                    "Network error. Check your internet connection.";

                break;

            case "auth/account-exists-with-different-credential":

                message =
                    "An account already exists with this email using another sign-in method.";

                break;

        }

        showAlert(message);

    }

}

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Login
   Part 5
========================================================== */

/* ==========================
   AUTH STATE LISTENER
========================== */

onAuthStateChanged(auth, async (user) => {

    hidePageLoader();

    if (!user) {

        return;

    }

    try {

        const supplierRef = doc(
            db,
            "suppliers",
            user.uid
        );

        const supplierSnap = await getDoc(
            supplierRef
        );

        if (!supplierSnap.exists()) {

            return;
        }

        const supplier = supplierSnap.data();

        /* --------------------------
           Email Verification
        -------------------------- */

        if (!user.emailVerified &&
            supplier.provider !== "google") {

            await signOut(auth);

            showAlert(

                "Please verify your email before signing in.",

                "warning"

            );

            return;

        }

        /* --------------------------
           Update Last Login
        -------------------------- */

        await setDoc(

            supplierRef,

            {

                lastLogin: serverTimestamp(),

                updatedAt: serverTimestamp()

            },

            {

                merge: true

            }

        );

        /* --------------------------
           Already Logged In
        -------------------------- */

        showAlert(

            "Welcome back! Redirecting to your dashboard...",

            "success"

        );

        setTimeout(() => {

            window.location.href =
                "supplier-dashboard.html";

        }, 1000);

    }

    catch (error) {

        console.error(

            "Auth State Error:",

            error

        );

    }

});

/* ==========================
   PAGE INITIALIZATION
========================== */

window.addEventListener(

    "load",

    () => {

        hidePageLoader();

    }

);

/* ==========================
   FAILSAFE LOADER
========================== */

setTimeout(() => {

    hidePageLoader();

}, 3000);

/* ==========================
   AUTO FOCUS EMAIL
========================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        if (

            email.value.trim() === ""

        ) {

            email.focus();

        }

    }

);

/* ==========================
   CLEAR ALERT WHEN TYPING
========================== */

email.addEventListener(

    "input",

    clearAlert

);

password.addEventListener(

    "input",

    clearAlert

);

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Login
   Part 6
========================================================== */

/* ==========================
   LOGOUT HELPER
========================== */

async function logoutSupplier() {

    try {

        await signOut(auth);

        showAlert(

            "You have been signed out.",

            "success"

        );

        setTimeout(() => {

            window.location.href =
                "supplier-login.html";

        }, 1000);

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================
   NETWORK STATUS
========================== */

window.addEventListener(

    "offline",

    () => {

        showAlert(

            "No internet connection. Please check your network.",

            "warning"

        );

    }

);

window.addEventListener(

    "online",

    () => {

        showAlert(

            "Internet connection restored.",

            "success"

        );

    }

);

/* ==========================
   FIREBASE ERROR HELPER
========================== */

function getFirebaseError(error) {

    switch (error.code) {

        case "auth/invalid-credential":

            return "Incorrect email or password.";

        case "auth/user-not-found":

            return "Supplier account not found.";

        case "auth/wrong-password":

            return "Incorrect password.";

        case "auth/invalid-email":

            return "Invalid email address.";

        case "auth/email-already-in-use":

            return "Email address already exists.";

        case "auth/user-disabled":

            return "This supplier account has been disabled.";

        case "auth/too-many-requests":

            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":

            return "Network error. Check your internet connection.";

        case "auth/popup-blocked":

            return "Google popup was blocked by your browser.";

        case "auth/popup-closed-by-user":

            return "Google sign-in was cancelled.";

        case "auth/account-exists-with-different-credential":

            return "An account already exists using another sign-in method.";

        default:

            return error.message ||
                "An unexpected error occurred.";

    }

}

/* ==========================
   SESSION INFORMATION
========================== */

function getCurrentSupplier() {

    return auth.currentUser;

}

function isLoggedIn() {

    return auth.currentUser !== null;

}

/* ==========================
   CLEAR FORM
========================== */

function clearLoginForm() {

    form.reset();

    password.type = "password";

    togglePasswordIcon.classList.remove(

        "bi-eye-slash"

    );

    togglePasswordIcon.classList.add(

        "bi-eye"

    );

}

/* ==========================
   BEFORE PAGE UNLOAD
========================== */

window.addEventListener(

    "beforeunload",

    () => {

        hideLoading();

    }

);

/* ==========================
   GLOBAL ERROR HANDLER
========================== */

window.addEventListener(

    "error",

    (event) => {

        console.error(

            "Application Error:",

            event.error

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    (event) => {

        console.error(

            "Unhandled Promise:",

            event.reason

        );

    }

);

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Login
   Part 7 (FINAL)
========================================================== */

/* ==========================
   INITIALIZATION
========================== */

function initializeSupplierLogin() {

    console.log(
        "✅ Supplier Login Initialized"
    );

    clearAlert();

    hideLoading();

    hidePageLoader();

    loadRememberedEmail();

    if (email.value.trim() === "") {

        email.focus();

    } else {

        password.focus();

    }

}

/* ==========================
   DOM READY
========================== */

document.addEventListener(

    "DOMContentLoaded",

    initializeSupplierLogin

);

/* ==========================
   ESC KEY CLOSE ALERT
========================== */

document.addEventListener(

    "keydown",

    event => {

        if (event.key === "Escape") {

            clearAlert();

        }

    }

);

/* ==========================
   CLEAR ALERTS ON INPUT
========================== */

form.querySelectorAll(

    "input"

).forEach(input => {

    input.addEventListener(

        "input",

        clearAlert

    );

});

/* ==========================
   DISABLE LOGIN BUTTON
   WHEN OFFLINE
========================== */

function updateConnectionStatus() {

    if (navigator.onLine) {

        loginBtn.disabled = false;

        if (!isSubmitting) {

            hideLoading();

        }

    } else {

        loginBtn.disabled = true;

        showAlert(

            "No internet connection. Please reconnect to continue.",

            "warning"

        );

    }

}

window.addEventListener(

    "online",

    updateConnectionStatus

);

window.addEventListener(

    "offline",

    updateConnectionStatus

);

/* ==========================
   HIDE PAGE LOADER
========================== */

window.addEventListener(

    "load",

    () => {

        hidePageLoader();

        updateConnectionStatus();

    }

);

/* ==========================
   FAILSAFE
========================== */

setTimeout(() => {

    hidePageLoader();

}, 2500);

/* ==========================
   END OF FILE
========================== */

console.log(
    "✅ supplier-login.js loaded successfully"
);
