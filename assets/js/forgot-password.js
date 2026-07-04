// ==========================================================
// Kenya Gas
// forgot-password.js
// ==========================================================

import { auth } from "./firebase.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// DOM ELEMENTS
// ==========================================================

const form = document.getElementById("forgotPasswordForm");

const emailInput = document.getElementById("resetEmail");

const resetBtn = document.getElementById("resetBtn");

const resetSpinner = document.getElementById("resetSpinner");

const resetText = document.getElementById("resetText");

const toastElement = document.getElementById("appToast");

const toastMessage = document.getElementById("toastMessage");


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

function setLoading(state) {

    resetBtn.disabled = state;

    if (state) {

        resetSpinner.classList.remove("d-none");

        resetText.textContent =
            "Sending...";

    }

    else {

        resetSpinner.classList.add("d-none");

        resetText.textContent =
            "Send Reset Link";

    }

}


// ==========================================================
// EMAIL VALIDATION
// ==========================================================

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {

    return emailRegex.test(email);

}


// ==========================================================
// PASSWORD RESET
// ==========================================================

async function resetPassword(e) {

    e.preventDefault();

    const email =
        emailInput.value.trim();

    if (!validateEmail(email)) {

        showToast(
            "Please enter a valid email address.",
            false
        );

        return;

    }

    setLoading(true);

    try {

        await sendPasswordResetEmail(

            auth,

            email

        );

        showToast(

            "Password reset email sent successfully. Please check your inbox."

        );

        form.reset();

    }

    catch (error) {

        console.error(error);

        let message =
            "Unable to send password reset email.";

        switch (error.code) {

            case "auth/user-not-found":

                message =
                    "No account exists with that email.";

                break;

            case "auth/invalid-email":

                message =
                    "Invalid email address.";

                break;

            case "auth/network-request-failed":

                message =
                    "Network error. Check your internet connection.";

                break;

            case "auth/too-many-requests":

                message =
                    "Too many requests. Please try again later.";

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

        setLoading(false);

    }

}


// ==========================================================
// EVENTS
// ==========================================================

if (form) {

    form.addEventListener(

        "submit",

        resetPassword

    );

}


// ==========================================================
// LIVE EMAIL VALIDATION
// ==========================================================

emailInput.addEventListener(

    "input",

    () => {

        if (

            emailInput.value === ""

        ) {

            emailInput.classList.remove(

                "is-valid",

                "is-invalid"

            );

            return;

        }

        if (

            validateEmail(

                emailInput.value.trim()

            )

        ) {

            emailInput.classList.add(

                "is-valid"

            );

            emailInput.classList.remove(

                "is-invalid"

            );

        }

        else {

            emailInput.classList.add(

                "is-invalid"

            );

            emailInput.classList.remove(

                "is-valid"

            );

        }

    }

);


// ==========================================================
// END
// ==========================================================
