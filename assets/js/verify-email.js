// ==========================================================
// Kenya Gas
// verify-email.js
// ==========================================================

import { auth } from "./firebase.js";

import {
    sendEmailVerification,
    reload
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// DOM
// ==========================================================

const checkBtn =
    document.getElementById("checkVerification");

const resendBtn =
    document.getElementById("resendVerification");

const toastElement =
    document.getElementById("appToast");

const toastMessage =
    document.getElementById("toastMessage");


// ==========================================================
// TOAST
// ==========================================================

function showToast(message, success = true) {

    toastMessage.textContent = message;

    toastElement.classList.remove(
        "text-bg-success",
        "text-bg-danger",
        "text-bg-warning"
    );

    toastElement.classList.add(
        success
            ? "text-bg-success"
            : "text-bg-danger"
    );

    const toast =
        new bootstrap.Toast(toastElement);

    toast.show();

}


// ==========================================================
// LOADING
// ==========================================================

function setButtonLoading(button, loading, text) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {

        button.dataset.original =
            button.innerHTML;

        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            ${text}
        `;

    }

    else if (button.dataset.original) {

        button.innerHTML =
            button.dataset.original;

    }

}


// ==========================================================
// CHECK LOGIN
// ==========================================================

function requireLogin() {

    if (!auth.currentUser) {

        showToast(
            "Please log in first.",
            false
        );

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1500);

        return false;

    }

    return true;

}


// ==========================================================
// CHECK VERIFICATION
// ==========================================================

async function checkVerification() {

    if (!requireLogin()) return;

    setButtonLoading(

        checkBtn,

        true,

        "Checking..."

    );

    try {

        await reload(auth.currentUser);

        if (auth.currentUser.emailVerified) {

            showToast(
                "Email verified successfully!"
            );

            setTimeout(() => {

                window.location.href =
                    "customer-dashboard.html";

            }, 1500);

        }

        else {

            showToast(
                "Your email has not been verified yet.",
                false
            );

        }

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message,
            false
        );

    }

    finally {

        setButtonLoading(
            checkBtn,
            false
        );

    }

}


// ==========================================================
// RESEND EMAIL
// ==========================================================

async function resendVerificationEmail() {

    if (!requireLogin()) return;

    setButtonLoading(

        resendBtn,

        true,

        "Sending..."

    );

    try {

        await sendEmailVerification(
            auth.currentUser
        );

        showToast(
            "Verification email sent successfully."
        );

    }

    catch (error) {

        console.error(error);

        let message =
            "Unable to send verification email.";

        switch (error.code) {

            case "auth/too-many-requests":

                message =
                    "Too many requests. Please wait before trying again.";

                break;

            case "auth/network-request-failed":

                message =
                    "Network error. Check your internet connection.";

                break;

            default:

                message =
                    error.message;

        }

        showToast(
            message,
            false
        );

    }

    finally {

        setButtonLoading(
            resendBtn,
            false
        );

    }

}


// ==========================================================
// EVENTS
// ==========================================================

if (checkBtn) {

    checkBtn.addEventListener(
        "click",
        checkVerification
    );

}

if (resendBtn) {

    resendBtn.addEventListener(
        "click",
        resendVerificationEmail
    );

}


// ==========================================================
// AUTO REDIRECT IF VERIFIED
// ==========================================================

window.addEventListener(

    "load",

    async () => {

        if (!auth.currentUser) return;

        try {

            await reload(auth.currentUser);

            if (auth.currentUser.emailVerified) {

                window.location.href =
                    "customer-dashboard.html";

            }

        }

        catch (error) {

            console.error(error);

        }

    }

);


// ==========================================================
// END
// ==========================================================
