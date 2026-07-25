// ======================================================
// Kenya Gas Marketplace
// Admin Login
// assets/js/admin-login.js
// Part 1 - Foundation
// ======================================================

// ======================================================
// Firebase
// ======================================================

import { app } from "./firebase.js";

import {

    getAuth,

    signInWithEmailAndPassword,

    sendPasswordResetEmail,

    onAuthStateChanged,

    setPersistence,

    browserLocalPersistence,

    browserSessionPersistence,

    signOut

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    getFirestore,

    doc,

    getDoc,

    setDoc,

    updateDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// Firebase Services
// ======================================================

const auth = getAuth(app);

const db = getFirestore(app);

// ======================================================
// Cached DOM Elements
// ======================================================

const adminLoginForm =
    document.getElementById("adminLoginForm");

const email =
    document.getElementById("email");

const password =
    document.getElementById("password");

const rememberMe =
    document.getElementById("rememberMe");

const loginBtn =
    document.getElementById("loginBtn");

const loginText =
    document.getElementById("loginText");

const loginSpinner =
    document.getElementById("loginSpinner");

const togglePassword =
    document.getElementById("togglePassword");

const forgotPasswordLink =
    document.getElementById("forgotPasswordLink");

const resetEmail =
    document.getElementById("resetEmail");

const sendResetBtn =
    document.getElementById("sendResetBtn");

const loginAlert =
    document.getElementById("loginAlert");

const successAlert =
    document.getElementById("successAlert");

const loadingOverlay =
    document.getElementById("loadingOverlay");

const offlineBanner =
    document.getElementById("offlineBanner");

// ======================================================
// Bootstrap Components
// ======================================================

const forgotPasswordModal =
    bootstrap.Modal.getOrCreateInstance(
        document.getElementById(
            "forgotPasswordModal"
        )
    );

const successToast =
    new bootstrap.Toast(
        document.getElementById(
            "successToast"
        )
    );

const errorToast =
    new bootstrap.Toast(
        document.getElementById(
            "errorToast"
        )
    );

// ======================================================
// Utility Functions
// ======================================================

function showLoader() {

    loadingOverlay.classList.remove("d-none");

}

function hideLoader() {

    loadingOverlay.classList.add("d-none");

}

function disableLoginButton() {

    loginBtn.disabled = true;

    loginSpinner.classList.remove("d-none");

    loginText.textContent = "Signing In...";

}

function enableLoginButton() {

    loginBtn.disabled = false;

    loginSpinner.classList.add("d-none");

    loginText.textContent = "Login";

}

function showSuccessToast(message) {

    document.getElementById(

        "successToastMessage"

    ).textContent = message;

    successToast.show();

}

function showErrorToast(message) {

    document.getElementById(

        "errorToastMessage"

    ).textContent = message;

    errorToast.show();

}

function hideAlerts() {

    loginAlert.classList.add("d-none");

    successAlert.classList.add("d-none");

}

// ======================================================
// Authentication State
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    try {

        const adminRef = doc(

            db,

            "admins",

            user.uid

        );

        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            await signOut(auth);

            return;

        }

        window.location.href =

            "admin-dashboard.html";

    }

    catch (error) {

        console.error(error);

    }

});

// ======================================================
// Network Status
// ======================================================

function updateNetworkStatus() {

    if (navigator.onLine) {

        offlineBanner.classList.add("d-none");

    }

    else {

        offlineBanner.classList.remove("d-none");

    }

}

window.addEventListener(

    "online",

    updateNetworkStatus

);

window.addEventListener(

    "offline",

    updateNetworkStatus

);

updateNetworkStatus();


// ======================================================
// Kenya Gas Marketplace
// Admin Login
// Part 2 - Administrator Login
// ======================================================

// ======================================================
// Login Form
// ======================================================

adminLoginForm?.addEventListener(

    "submit",

    loginAdministrator

);

// ======================================================
// Administrator Login
// ======================================================

async function loginAdministrator(event) {

    event.preventDefault();

    hideAlerts();

    const adminEmail =
        email.value.trim().toLowerCase();

    const adminPassword =
        password.value.trim();

    if (!adminEmail || !adminPassword) {

        showErrorToast(
            "Please enter your email and password."
        );

        return;

    }

    try {

        showLoader();

        disableLoginButton();

        // =====================================
        // Remember Me
        // =====================================

        await setPersistence(

            auth,

            rememberMe.checked

                ? browserLocalPersistence

                : browserSessionPersistence

        );

        // =====================================
        // Firebase Authentication
        // =====================================

        const credential =

            await signInWithEmailAndPassword(

                auth,

                adminEmail,

                adminPassword

            );

        const user = credential.user;

        // =====================================
        // Verify Administrator
        // =====================================

        const adminRef = doc(

            db,

            "admins",

            user.uid

        );

        const adminSnap =

            await getDoc(adminRef);

        if (!adminSnap.exists()) {

            await signOut(auth);

            throw new Error(

                "Administrator account not found."

            );

        }

        const adminData =
            adminSnap.data();

        // =====================================
        // Active Account
        // =====================================

        if (adminData.active === false) {

            await signOut(auth);

            throw new Error(

                "Your administrator account has been disabled."

            );

        }

        // =====================================
        // Role Verification
        // =====================================

        const allowedRoles = [

            "admin",

            "super_admin"

        ];

        if (

            !allowedRoles.includes(

                adminData.role

            )

        ) {

            await signOut(auth);

            throw new Error(

                "You do not have administrator privileges."

            );

        }

        // =====================================
        // Email Verification (Optional)
        // =====================================

        if (

            adminData.requireVerifiedEmail === true &&

            !user.emailVerified

        ) {

            await signOut(auth);

            throw new Error(

                "Please verify your email address first."

            );

        }

        // =====================================
        // Update Login Details
        // =====================================

        await updateDoc(

            adminRef,

            {

                lastLogin:

                    serverTimestamp(),

                online: true,

                lastIPAddress:

                    null,

                lastLoginDevice:

                    navigator.userAgent

            }

        );

        // =====================================
        // Login History
        // =====================================

        await setDoc(

            doc(

                db,

                "adminLogs",

                crypto.randomUUID()

            ),

            {

                adminId:

                    user.uid,

                administrator:

                    adminData.fullName ||

                    adminData.name ||

                    user.email,

                action:

                    "LOGIN",

                email:

                    user.email,

                role:

                    adminData.role,

                browser:

                    navigator.userAgent,

                createdAt:

                    serverTimestamp()

            }

        );

        successAlert.classList.remove(

            "d-none"

        );

        successAlert.textContent =

            "Login successful. Redirecting...";

        showSuccessToast(

            "Welcome back, " +

            (

                adminData.fullName ||

                "Administrator"

            )

        );

        setTimeout(() => {

            window.location.href =

                "admin-dashboard.html";

        }, 1200);

    }

    catch (error) {

        console.error(error);

        let message =

            error.message;

        switch (error.code) {

            case "auth/invalid-email":

                message =

                    "Invalid email address.";

                break;

            case "auth/user-disabled":

                message =

                    "Administrator account disabled.";

                break;

            case "auth/user-not-found":

                message =

                    "Administrator not found.";

                break;

            case "auth/wrong-password":

            case "auth/invalid-credential":

                message =

                    "Incorrect email or password.";

                break;

            case "auth/too-many-requests":

                message =

                    "Too many login attempts. Try again later.";

                break;

            case "auth/network-request-failed":

                message =

                    "Network error. Check your internet connection.";

                break;

        }

        loginAlert.textContent =

            message;

        loginAlert.classList.remove(

            "d-none"

        );

        showErrorToast(message);

    }

    finally {

        hideLoader();

        enableLoginButton();

    }

}

// ======================================================
// Kenya Gas Marketplace
// Admin Login
// Part 3 - Password Tools
// ======================================================

// ======================================================
// Password Visibility
// ======================================================

togglePassword?.addEventListener(

    "click",

    () => {

        const hidden =

            password.type === "password";

        password.type =

            hidden

                ? "text"

                : "password";

        togglePassword.classList.toggle(

            "bi-eye"

        );

        togglePassword.classList.toggle(

            "bi-eye-slash"

        );

    }

);

// ======================================================
// Forgot Password
// ======================================================

forgotPasswordLink?.addEventListener(

    "click",

    event => {

        event.preventDefault();

        resetEmail.value =

            email.value.trim();

        forgotPasswordModal.show();

    }

);

// ======================================================
// Send Password Reset Email
// ======================================================

sendResetBtn?.addEventListener(

    "click",

    sendPasswordReset

);

async function sendPasswordReset() {

    const emailAddress =

        resetEmail.value

            .trim()

            .toLowerCase();

    if (!emailAddress) {

        showErrorToast(

            "Enter your administrator email."

        );

        resetEmail.focus();

        return;

    }

    try {

        sendResetBtn.disabled = true;

        sendResetBtn.innerHTML =

            `

<span class="spinner-border spinner-border-sm me-2"></span>

Sending...

`;

        await sendPasswordResetEmail(

            auth,

            emailAddress

        );

        forgotPasswordModal.hide();

        showSuccessToast(

            "Password reset email sent successfully."

        );

    }

    catch (error) {

        console.error(error);

        let message =

            "Unable to send password reset email.";

        switch (error.code) {

            case "auth/user-not-found":

                message =

                    "Administrator account not found.";

                break;

            case "auth/invalid-email":

                message =

                    "Invalid email address.";

                break;

            case "auth/network-request-failed":

                message =

                    "Network error. Check your connection.";

                break;

        }

        showErrorToast(message);

    }

    finally {

        sendResetBtn.disabled = false;

        sendResetBtn.innerHTML =

            "Send Reset Link";

    }

}

// ======================================================
// Enter Key Support
// ======================================================

document.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "Enter" &&

            document.activeElement !==

            resetEmail

        ) {

            adminLoginForm.requestSubmit();

        }

    }

);

// ======================================================
// Escape Key
// ======================================================

document.addEventListener(

    "keydown",

    event => {

        if (event.key === "Escape") {

            forgotPasswordModal.hide();

        }

    }

);

// ======================================================
// Email Formatting
// ======================================================

email?.addEventListener(

    "blur",

    () => {

        email.value =

            email.value

                .trim()

                .toLowerCase();

    }

);

// ======================================================
// Password Validation
// ======================================================

password?.addEventListener(

    "input",

    () => {

        if (

            password.value.length >= 6

        ) {

            password.classList.remove(

                "is-invalid"

            );

        }

    }

);

// ======================================================
// Clear Login Errors
// ======================================================

[email, password].forEach(field => {

    field?.addEventListener(

        "input",

        () => {

            loginAlert.classList.add(

                "d-none"

            );

        }

    );

});

// ======================================================
// Autofocus
// ======================================================

window.addEventListener(

    "load",

    () => {

        email.focus();

    }

);

// ======================================================
// Kenya Gas Marketplace
// Admin Login
// Part 4 - Session Management
// ======================================================

// ======================================================
// Session Configuration
// ======================================================

const SESSION_TIMEOUT =

    30 * 60 * 1000;

let inactivityTimer = null;

// ======================================================
// Auto Redirect
// ======================================================

async function redirectAuthenticatedAdmin(user) {

    try {

        const adminRef = doc(

            db,

            "admins",

            user.uid

        );

        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            await signOut(auth);

            return;

        }

        const admin = adminSnap.data();

        if (

            admin.active === false ||

            !["admin", "super_admin"].includes(admin.role)

        ) {

            await signOut(auth);

            return;

        }

        window.location.replace(

            "admin-dashboard.html"

        );

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================================
// Session Activity
// ======================================================

function resetSessionTimer() {

    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(

        expireAdministratorSession,

        SESSION_TIMEOUT

    );

}

document.addEventListener(

    "mousemove",

    resetSessionTimer

);

document.addEventListener(

    "keydown",

    resetSessionTimer

);

document.addEventListener(

    "click",

    resetSessionTimer

);

document.addEventListener(

    "touchstart",

    resetSessionTimer

);

// ======================================================
// Session Expiry
// ======================================================

async function expireAdministratorSession() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        await signOut(auth);

        showErrorToast(

            "Your login session has expired."

        );

        setTimeout(() => {

            window.location.reload();

        }, 1500);

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================================
// Update Administrator Status
// ======================================================

async function updateAdminOnlineStatus(

    online = true

) {

    const user = auth.currentUser;

    if (!user) return;

    try {

        await updateDoc(

            doc(

                db,

                "admins",

                user.uid

            ),

            {

                online,

                lastSeen:

                    serverTimestamp()

            }

        );

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================================
// Browser Close
// ======================================================

window.addEventListener(

    "beforeunload",

    async () => {

        try {

            await updateAdminOnlineStatus(

                false

            );

        }

        catch (error) {

            console.error(error);

        }

    }

);

// ======================================================
// Visibility Tracking
// ======================================================

document.addEventListener(

    "visibilitychange",

    () => {

        if (

            document.visibilityState ===

            "visible"

        ) {

            resetSessionTimer();

        }

    }

);

// ======================================================
// Authentication Observer
// ======================================================

onAuthStateChanged(

    auth,

    async user => {

        if (!user) return;

        resetSessionTimer();

        await updateAdminOnlineStatus(

            true

        );

        await redirectAuthenticatedAdmin(

            user

        );

    }

);

// ======================================================
// Login Statistics
// ======================================================

async function recordLoginStatistics() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        await setDoc(

            doc(

                db,

                "adminStatistics",

                user.uid

            ),

            {

                lastLogin:

                    serverTimestamp(),

                browser:

                    navigator.userAgent,

                language:

                    navigator.language,

                platform:

                    navigator.platform,

                online: true

            },

            {

                merge: true

            }

        );

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================================
// Initialize Session
// ======================================================

resetSessionTimer();

console.log(

    "Administrator session initialized."

);

// ======================================================
// Kenya Gas Marketplace
// Admin Login
// Part 5 - Security & Protection
// ======================================================

// ======================================================
// Security Configuration
// ======================================================

const MAX_LOGIN_ATTEMPTS = 5;

const LOCKOUT_DURATION = 15 * 60 * 1000;

let loginAttempts = Number(

    localStorage.getItem("adminLoginAttempts") || 0

);

let lockoutUntil = Number(

    localStorage.getItem("adminLockoutUntil") || 0

);

// ======================================================
// Check Lockout
// ======================================================

function isLoginLocked() {

    const now = Date.now();

    if (lockoutUntil > now) {

        const minutes = Math.ceil(

            (lockoutUntil - now) / 60000

        );

        showErrorToast(

            `Too many failed login attempts. Try again in ${minutes} minute(s).`

        );

        return true;

    }

    if (lockoutUntil <= now) {

        loginAttempts = 0;

        lockoutUntil = 0;

        localStorage.removeItem(

            "adminLoginAttempts"

        );

        localStorage.removeItem(

            "adminLockoutUntil"

        );

    }

    return false;

}

// ======================================================
// Failed Login
// ======================================================

function recordFailedLogin() {

    loginAttempts++;

    localStorage.setItem(

        "adminLoginAttempts",

        loginAttempts

    );

    if (

        loginAttempts >= MAX_LOGIN_ATTEMPTS

    ) {

        lockoutUntil =

            Date.now() +

            LOCKOUT_DURATION;

        localStorage.setItem(

            "adminLockoutUntil",

            lockoutUntil

        );

    }

}

// ======================================================
// Successful Login
// ======================================================

function clearFailedLogins() {

    loginAttempts = 0;

    lockoutUntil = 0;

    localStorage.removeItem(

        "adminLoginAttempts"

    );

    localStorage.removeItem(

        "adminLockoutUntil"

    );

}

// ======================================================
// Device Information
// ======================================================

function getDeviceInformation() {

    return {

        browser:

            navigator.userAgent,

        language:

            navigator.language,

        platform:

            navigator.platform,

        online:

            navigator.onLine,

        screen:

            `${screen.width}x${screen.height}`,

        timezone:

            Intl.DateTimeFormat()

            .resolvedOptions()

            .timeZone

    };

}

// ======================================================
// Audit Log
// ======================================================

async function writeSecurityLog(

    action,

    emailAddress,

    success,

    reason = ""

) {

    try {

        await setDoc(

            doc(

                db,

                "adminSecurityLogs",

                crypto.randomUUID()

            ),

            {

                action,

                email:

                    emailAddress,

                success,

                reason,

                device:

                    getDeviceInformation(),

                createdAt:

                    serverTimestamp()

            }

        );

    }

    catch (error) {

        console.error(

            "Security Log:",

            error

        );

    }

}

// ======================================================
// Login Guard
// ======================================================

function validateLoginRequest() {

    if (isLoginLocked()) {

        return false;

    }

    if (!navigator.onLine) {

        showErrorToast(

            "No internet connection."

        );

        return false;

    }

    return true;

}

// ======================================================
// Security Monitor
// ======================================================

function initializeSecurity() {

    if (isLoginLocked()) {

        loginBtn.disabled = true;

        const timer = setInterval(() => {

            if (!isLoginLocked()) {

                clearInterval(timer);

                loginBtn.disabled = false;

            }

        }, 1000);

    }

}

initializeSecurity();

// ======================================================
// Browser Developer Tools Detection
// ======================================================

let devToolsOpened = false;

setInterval(() => {

    if (

        window.outerWidth -

        window.innerWidth >

        160 ||

        window.outerHeight -

        window.innerHeight >

        160

    ) {

        if (!devToolsOpened) {

            devToolsOpened = true;

            console.warn(

                "Developer tools detected."

            );

        }

    }

    else {

        devToolsOpened = false;

    }

}, 2000);

// ======================================================
// Disable Right Click (Optional)
// ======================================================

document.addEventListener(

    "contextmenu",

    event => {

        event.preventDefault();

    }

);

// ======================================================
// Disable Common Inspect Shortcuts
// ======================================================

document.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "F12" ||

            (

                event.ctrlKey &&

                event.shiftKey &&

                [

                    "I",

                    "J",

                    "C"

                ].includes(

                    event.key.toUpperCase()

                )

            )

        ) {

            event.preventDefault();

        }

    }

);

// ======================================================
// Security Banner
// ======================================================

console.log(

    "%cKenya Gas Marketplace",

    "color:#198754;font-size:18px;font-weight:bold;"

);

console.log(

    "%cAdministrator Login Protected",

    "color:#0d6efd;font-size:14px;"

);

// ======================================================
// Kenya Gas Marketplace
// Admin Login
// Part 6 - UI Helpers & Enhancements
// ======================================================

// ======================================================
// Friendly Firebase Error Messages
// ======================================================

function getFirebaseErrorMessage(code) {

    switch (code) {

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "Administrator account not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/user-disabled":
            return "Your administrator account has been disabled.";

        case "auth/network-request-failed":
            return "Unable to reach the server. Check your internet connection.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        default:
            return "An unexpected error occurred. Please try again.";
    }

}

// ======================================================
// Button Helpers
// ======================================================

function setButtonLoading(

    button,

    text = "Processing..."

) {

    if (!button) return;

    button.disabled = true;

    button.dataset.originalText =

        button.innerHTML;

    button.innerHTML = `

<span
class="spinner-border spinner-border-sm me-2">
</span>

${text}

`;

}

function restoreButton(button) {

    if (!button) return;

    button.disabled = false;

    button.innerHTML =

        button.dataset.originalText;

}

// ======================================================
// Form Validation
// ======================================================

function validateLoginForm() {

    const adminEmail =

        email.value.trim();

    const adminPassword =

        password.value.trim();

    if (!adminEmail) {

        email.focus();

        showErrorToast(

            "Email address is required."

        );

        return false;

    }

    if (!adminPassword) {

        password.focus();

        showErrorToast(

            "Password is required."

        );

        return false;

    }

    return true;

}

// ======================================================
// Auto Clear Alerts
// ======================================================

function clearMessages() {

    loginAlert.classList.add("d-none");

    successAlert.classList.add("d-none");

}

[email, password].forEach(input => {

    input?.addEventListener(

        "input",

        clearMessages

    );

});

// ======================================================
// Focus Effects
// ======================================================

document.querySelectorAll(

    ".form-control"

).forEach(field => {

    field.addEventListener(

        "focus",

        () => {

            field.classList.add(

                "border-primary"

            );

        }

    );

    field.addEventListener(

        "blur",

        () => {

            field.classList.remove(

                "border-primary"

            );

        }

    );

});

// ======================================================
// Online / Offline Notifications
// ======================================================

window.addEventListener(

    "online",

    () => {

        showSuccessToast(

            "Connection restored."

        );

    }

);

window.addEventListener(

    "offline",

    () => {

        showErrorToast(

            "You are offline."

        );

    }

);

// ======================================================
// Password Auto Complete
// ======================================================

password.setAttribute(

    "autocomplete",

    "current-password"

);

email.setAttribute(

    "autocomplete",

    "email"

);

// ======================================================
// Accessibility
// ======================================================

email.setAttribute(

    "aria-label",

    "Administrator Email"

);

password.setAttribute(

    "aria-label",

    "Administrator Password"

);

loginBtn.setAttribute(

    "aria-label",

    "Administrator Login"

);

// ======================================================
// Smooth Form Animation
// ======================================================

window.addEventListener(

    "load",

    () => {

        document.querySelector(

            ".login-card"

        ).animate(

            [

                {

                    opacity: 0,

                    transform:

                    "translateY(40px)"

                },

                {

                    opacity: 1,

                    transform:

                    "translateY(0)"

                }

            ],

            {

                duration: 600,

                easing: "ease"

            }

        );

    }

);

// ======================================================
// Browser Information
// ======================================================

console.table({

    Browser:

        navigator.userAgent,

    Language:

        navigator.language,

    Platform:

        navigator.platform,

    Online:

        navigator.onLine

});

// ======================================================
// Initialize UI
// ======================================================

clearMessages();

updateNetworkStatus();

console.log(

    "Admin Login UI Ready."

);

// ======================================================
// Kenya Gas Marketplace
// Admin Login
// assets/js/admin-login.js
// Part 7 - Final Initialization
// ======================================================

// ======================================================
// Register Page Events
// ======================================================

function registerEventListeners() {

    // Login Form

    adminLoginForm?.addEventListener(

        "submit",

        loginAdministrator

    );

    // Forgot Password

    forgotPasswordLink?.addEventListener(

        "click",

        event => {

            event.preventDefault();

            resetEmail.value =

                email.value.trim();

            forgotPasswordModal.show();

        }

    );

    sendResetBtn?.addEventListener(

        "click",

        sendPasswordReset

    );

    // Password Visibility

    togglePassword?.addEventListener(

        "click",

        () => {

            const hidden =

                password.type === "password";

            password.type =

                hidden

                    ? "text"

                    : "password";

            togglePassword.classList.toggle(

                "bi-eye"

            );

            togglePassword.classList.toggle(

                "bi-eye-slash"

            );

        }

    );

}

// ======================================================
// Session Cleanup
// ======================================================

window.addEventListener(

    "beforeunload",

    async () => {

        try {

            const user = auth.currentUser;

            if (!user) return;

            await updateDoc(

                doc(

                    db,

                    "admins",

                    user.uid

                ),

                {

                    online: false,

                    lastSeen:

                        serverTimestamp()

                }

            );

        }

        catch (error) {

            console.error(error);

        }

    }

);

// ======================================================
// Auto Refresh Network Status
// ======================================================

setInterval(

    updateNetworkStatus,

    10000

);

// ======================================================
// Page Visibility
// ======================================================

document.addEventListener(

    "visibilitychange",

    () => {

        if (

            document.visibilityState ===

            "visible"

        ) {

            updateNetworkStatus();

            resetSessionTimer();

        }

    }

);

// ======================================================
// Browser Information
// ======================================================

console.group(

    "Kenya Gas Marketplace"

);

console.log(

    "Module : Admin Login"

);

console.log(

    "Firebase Auth : Ready"

);

console.log(

    "Firestore : Ready"

);

console.log(

    "Bootstrap : Ready"

);

console.log(

    "Version : 1.0.0"

);

console.groupEnd();

// ======================================================
// Footer Year
// ======================================================

const copyright =

    document.getElementById(

        "copyrightYear"

    );

if (copyright) {

    copyright.textContent =

        new Date().getFullYear();

}

// ======================================================
// Initialization
// ======================================================

async function initializeAdminLogin() {

    try {

        showLoader();

        hideAlerts();

        registerEventListeners();

        updateNetworkStatus();

        clearMessages();

        resetSessionTimer();

        initializeSecurity();

        enableLoginButton();

        email.focus();

        console.log(

            "Admin Login Initialized Successfully."

        );

    }

    catch (error) {

        console.error(

            "Initialization Error:",

            error

        );

        showErrorToast(

            "Failed to initialize login page."

        );

    }

    finally {

        hideLoader();

    }

}

// ======================================================
// DOM Ready
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeAdminLogin

);

// ======================================================
// End of File
// ======================================================

console.log(

    "Kenya Gas Marketplace",

    "Admin Login Loaded Successfully"

);
