// ==========================================================
// Kenya Gas Authentication System
// auth.js
// Part 1
// ==========================================================

import kenyaLocations from "./counties.js";

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================================
// DOM ELEMENTS
// ==========================================================

const registerForm = document.getElementById("registerForm");

const registerBtn = document.getElementById("registerBtn");

const registerSpinner =
    document.getElementById("registerSpinner");

const registerText =
    document.getElementById("registerText");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const passwordStrengthBar =
    document.getElementById("passwordStrengthBar");

const passwordStrengthText =
    document.getElementById("passwordStrengthText");

const passwordMatchMessage =
    document.getElementById("passwordMatchMessage");

const email =
    document.getElementById("email");

const phone =
    document.getElementById("phone");

const googleButton =
    document.getElementById("googleSignIn");


// ==========================================================
// TOAST NOTIFICATIONS
// ==========================================================

function showToast(message, success = true) {

    const toastElement =
        document.getElementById("appToast");

    const toastMessage =
        document.getElementById("toastMessage");

    toastMessage.textContent = message;

    toastElement.classList.remove(
        "text-bg-success",
        "text-bg-danger"
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
// LOADING BUTTON
// ==========================================================

function setLoading(state) {

    if (!registerBtn) return;

    registerBtn.disabled = state;

    if (state) {

        registerSpinner.classList.remove("d-none");

        registerText.textContent =
            "Creating Account...";

    } else {

        registerSpinner.classList.add("d-none");

        registerText.textContent =
            "Create Account";

    }

}


// ==========================================================
// PASSWORD VISIBILITY
// ==========================================================

function toggleVisibility(input, button) {

    if (!input || !button) return;

    if (input.type === "password") {

        input.type = "text";

        button.innerHTML =
            '<i class="bi bi-eye-slash"></i>';

    } else {

        input.type = "password";

        button.innerHTML =
            '<i class="bi bi-eye"></i>';

    }

}

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        toggleVisibility(password, togglePassword);

    });

}

if (toggleConfirmPassword) {

    toggleConfirmPassword.addEventListener("click", () => {

        toggleVisibility(
            confirmPassword,
            toggleConfirmPassword
        );

    });

}// ==========================================================
// VALIDATION
// Part 2
// ==========================================================

// ---------- Email ----------

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// ---------- Kenya Phone ----------

const phoneRegex =
    /^(\+254|254|0)7\d{8}$/;


// ---------- Strong Password ----------

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


// ==========================================================
// EMAIL VALIDATION
// ==========================================================

if (email) {

    email.addEventListener("input", () => {

        if (email.value.trim() === "") {

            email.classList.remove(
                "is-valid",
                "is-invalid"
            );

            return;

        }

        if (emailRegex.test(email.value.trim())) {

            email.classList.add("is-valid");

            email.classList.remove("is-invalid");

        } else {

            email.classList.add("is-invalid");

            email.classList.remove("is-valid");

        }

    });

}



// ==========================================================
// PHONE VALIDATION
// ==========================================================

if (phone) {

    phone.addEventListener("input", () => {

        const value = phone.value.trim();

        if (value === "") {

            phone.classList.remove(
                "is-valid",
                "is-invalid"
            );

            return;

        }

        if (phoneRegex.test(value)) {

            phone.classList.add("is-valid");

            phone.classList.remove("is-invalid");

        }

        else {

            phone.classList.add("is-invalid");

            phone.classList.remove("is-valid");

        }

    });

}



// ==========================================================
// PASSWORD STRENGTH
// ==========================================================

function calculateStrength(passwordValue) {

    let score = 0;

    if (passwordValue.length >= 8)
        score++;

    if (/[A-Z]/.test(passwordValue))
        score++;

    if (/[a-z]/.test(passwordValue))
        score++;

    if (/[0-9]/.test(passwordValue))
        score++;

    if (/[@$!%*?&]/.test(passwordValue))
        score++;

    return score;

}


function updateStrengthMeter() {

    if (!password) return;

    const score =
        calculateStrength(password.value);

    let width = 0;

    let colour = "";

    let text = "";

    switch (score) {

        case 0:
        case 1:

            width = 20;

            colour = "bg-danger";

            text = "Very Weak";

            break;

        case 2:

            width = 40;

            colour = "bg-warning";

            text = "Weak";

            break;

        case 3:

            width = 60;

            colour = "bg-info";

            text = "Fair";

            break;

        case 4:

            width = 80;

            colour = "bg-primary";

            text = "Good";

            break;

        case 5:

            width = 100;

            colour = "bg-success";

            text = "Strong";

            break;

    }

    passwordStrengthBar.className =
        "progress-bar " + colour;

    passwordStrengthBar.style.width =
        width + "%";

    passwordStrengthText.textContent =
        "Password Strength: " + text;

}


if (password) {

    password.addEventListener(
        "input",
        updateStrengthMeter
    );

}



// ==========================================================
// PASSWORD MATCH
// ==========================================================

function checkPasswordMatch() {

    if (
        password.value === "" &&
        confirmPassword.value === ""
    ) {

        passwordMatchMessage.textContent = "";

        return;

    }

    if (
        password.value ===
        confirmPassword.value
    ) {

        passwordMatchMessage.textContent =
            "✓ Passwords match";

        passwordMatchMessage.className =
            "text-success fw-semibold";

    }

    else {

        passwordMatchMessage.textContent =
            "✗ Passwords do not match";

        passwordMatchMessage.className =
            "text-danger fw-semibold";

    }

}


if (password)
    password.addEventListener(
        "input",
        checkPasswordMatch
    );

if (confirmPassword)
    confirmPassword.addEventListener(
        "input",
        checkPasswordMatch
    );



// ==========================================================
// TERMS VALIDATION
// ==========================================================

function validateTerms() {

    const terms =
        document.getElementById("terms");

    if (!terms.checked) {

        showToast(
            "Please accept the Terms & Conditions.",
            false
        );

        return false;

    }

    return true;

}



// ==========================================================
// FORM VALIDATION
// ==========================================================

function validateRegistrationForm() {

    if (!emailRegex.test(email.value.trim())) {

        showToast(
            "Please enter a valid email address.",
            false
        );

        return false;

    }

    if (!phoneRegex.test(phone.value.trim())) {

        showToast(
            "Please enter a valid Kenyan phone number.",
            false
        );

        return false;

    }

    if (!passwordRegex.test(password.value)) {

        showToast(
            "Your password is too weak.",
            false
        );

        return false;

    }

    if (
        password.value !==
        confirmPassword.value
    ) {

        showToast(
            "Passwords do not match.",
            false
        );

        return false;

    }

    if (!validateTerms())
        return false;

    return true;

}
// ==========================================================
// REGISTRATION
// Part 3
// ==========================================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        registerUser
    );

}

async function registerUser(e) {

    e.preventDefault();

    if (!validateRegistrationForm()) {

        return;

    }

    setLoading(true);

    try {

        const firstName =
            document.getElementById("firstName")
            .value
            .trim();

        const lastName =
            document.getElementById("lastName")
            .value
            .trim();

        const phoneNumber =
            phone.value.trim();

        const emailAddress =
            email.value.trim();

        const county =
            document.getElementById("county")
            .value;

        const town =
            document.getElementById("town")
            .value;

        const userCredential =
            await createUserWithEmailAndPassword(

                auth,

                emailAddress,

                password.value

            );

        const user =
            userCredential.user;

        // Update display name

        await updateProfile(user, {

            displayName:
                `${firstName} ${lastName}`

        });

        // Send verification email

        await sendEmailVerification(user);

        // Save customer profile

        await setDoc(

            doc(db, "users", user.uid),

            {

                uid: user.uid,

                firstName,

                lastName,

                fullName:
                    `${firstName} ${lastName}`,

                email:
                    emailAddress,

                phone:
                    phoneNumber,

                county,

                town,

                role: "customer",

                verified:
                    user.emailVerified,

                profilePhoto: "",

                status: "active",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }

        );

        showToast(

            "🎉 Account created successfully! Please verify your email before logging in."

        );

        registerForm.reset();

        passwordStrengthBar.style.width = "0%";

        passwordStrengthBar.className =
            "progress-bar";

        passwordStrengthText.textContent =
            "Password strength";

        passwordMatchMessage.textContent = "";

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 3500);

    }

    catch (error) {

        console.error(error);

        let message =
            "Registration failed.";

        switch (error.code) {

            case "auth/email-already-in-use":

                message =
                    "An account with this email already exists.";

                break;

            case "auth/invalid-email":

                message =
                    "Invalid email address.";

                break;

            case "auth/weak-password":

                message =
                    "Password is too weak.";

                break;

            case "auth/network-request-failed":

                message =
                    "Network error. Check your internet connection.";

                break;

            case "auth/too-many-requests":

                message =
                    "Too many attempts. Please try again later.";

                break;

            default:

                message =
                    error.message;

        }

        showToast(message, false);

    }

    finally {

        setLoading(false);

    }

}// ==========================================================
// GOOGLE SIGN-IN
// Part 4
// ==========================================================

const googleProvider = new GoogleAuthProvider();

if (googleButton) {

    googleButton.addEventListener(
        "click",
        signInWithGoogle
    );

}

async function signInWithGoogle() {

    setLoading(true);

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        const user =
            result.user;

        const names =
            user.displayName
                ? user.displayName.split(" ")
                : ["", ""];

        const firstName =
            names[0] || "";

        const lastName =
            names.slice(1).join(" ");

        await setDoc(

            doc(db, "users", user.uid),

            {

                uid: user.uid,

                firstName,

                lastName,

                fullName:
                    user.displayName || "",

                email:
                    user.email,

                phone:
                    user.phoneNumber || "",

                county: "",

                town: "",

                profilePhoto:
                    user.photoURL || "",

                role: "customer",

                verified:
                    user.emailVerified,

                provider: "google",

                status: "active",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );

        showToast(
            "Welcome to Kenya Gas!"
        );

        setTimeout(() => {

            window.location.href =
                "customer-dashboard.html";

        }, 1500);

    }

    catch (error) {

        console.error(error);

        showToast(

            error.message,

            false

        );

    }

    finally {

        setLoading(false);

    }

}



// ==========================================================
// AUTH STATE
// ==========================================================

onAuthStateChanged(

    auth,

    (user) => {

        if (!user) return;

        const page =
            window.location.pathname
            .split("/")
            .pop();

        if (

            page === "login.html" ||

            page === "register.html"

        ) {

            if (user.emailVerified) {

                window.location.href =
                    "customer-dashboard.html";

            }

        }

    }

);



// ==========================================================
// INITIALIZE PAGE
// ==========================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        if (password) {

            updateStrengthMeter();

        }

        if (

            password &&

            confirmPassword

        ) {

            checkPasswordMatch();

        }

    }

);

const countySelect = document.getElementById("county");
const townSelect = document.getElementById("town");

// Populate counties
countySelect.innerHTML = '<option value="">Select County</option>';

Object.keys(kenyaLocations)
    .sort()
    .forEach(county => {

        const option = document.createElement("option");

        option.value = county;

        option.textContent = county;

        countySelect.appendChild(option);

    });

// Populate towns
countySelect.addEventListener("change", () => {

    const selectedCounty = countySelect.value;

    townSelect.innerHTML =
        '<option value="">Select Town</option>';

    if (!selectedCounty) return;

    kenyaLocations[selectedCounty].forEach(town => {

        const option = document.createElement("option");

        option.value = town;

        option.textContent = town;

        townSelect.appendChild(option);

    });

});

// ==========================================================
// END OF FILE
// ==========================================================
