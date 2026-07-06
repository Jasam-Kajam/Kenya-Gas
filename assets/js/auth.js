// ==========================================================
// Kenya Gas Marketplace
// Authentication System
// auth.js
// Part 1
// ==========================================================

// ==========================================================
// IMPORTS
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

const registerForm =
    document.getElementById("registerForm");

const registerBtn =
    document.getElementById("registerBtn");

const registerSpinner =
    document.getElementById("registerSpinner");

const registerText =
    document.getElementById("registerText");

const firstName =
    document.getElementById("firstName");

const lastName =
    document.getElementById("lastName");

const email =
    document.getElementById("email");

const phone =
    document.getElementById("phone");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const countySelect =
    document.getElementById("county");

const townSelect =
    document.getElementById("town");

const googleButton =
    document.getElementById("googleSignIn");

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


// ==========================================================
// TOAST NOTIFICATIONS
// ==========================================================

function showToast(message, success = true) {

    const toastElement =
        document.getElementById("appToast");

    const toastMessage =
        document.getElementById("toastMessage");

    if (!toastElement || !toastMessage)
        return;

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
// REGISTER BUTTON LOADING
// ==========================================================

function setLoading(isLoading) {

    if (!registerBtn)
        return;

    registerBtn.disabled =
        isLoading;

    if (isLoading) {

        registerSpinner.classList.remove("d-none");

        registerText.textContent =
            "Creating Account...";

    }

    else {

        registerSpinner.classList.add("d-none");

        registerText.textContent =
            "Create Account";

    }

}


// ==========================================================
// PASSWORD VISIBILITY
// ==========================================================

function toggleVisibility(input, button) {

    if (!input || !button)
        return;

    if (input.type === "password") {

        input.type = "text";

        button.innerHTML =
            '<i class="bi bi-eye-slash"></i>';

    }

    else {

        input.type = "password";

        button.innerHTML =
            '<i class="bi bi-eye"></i>';

    }

}

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        toggleVisibility(
            password,
            togglePassword
        );

    });

}

if (toggleConfirmPassword) {

    toggleConfirmPassword.addEventListener("click", () => {

        toggleVisibility(

            confirmPassword,

            toggleConfirmPassword

        );

    });

}


// ==========================================================
// COUNTY & TOWN INITIALIZATION
// ==========================================================

function initializeLocations() {

    if (!countySelect || !townSelect) {

        console.error(
            "County or Town dropdown not found."
        );

        return;

    }

    countySelect.innerHTML =
        '<option value="">Select County</option>';

    townSelect.innerHTML =
        '<option value="">Select Town</option>';

    Object.keys(kenyaLocations)

        .sort()

        .forEach(county => {

            const option =
                document.createElement("option");

            option.value =
                county;

            option.textContent =
                county;

            countySelect.appendChild(option);

        });

    countySelect.addEventListener("change", () => {

        const selectedCounty =
            countySelect.value;

        townSelect.innerHTML =
            '<option value="">Select Town</option>';

        if (!selectedCounty)
            return;

        kenyaLocations[selectedCounty]

            .forEach(town => {

                const option =
                    document.createElement("option");

                option.value =
                    town;

                option.textContent =
                    town;

                townSelect.appendChild(option);

            });

    });

}

// ==========================================================
// END OF PART 1
// ==========================================================
// ==========================================================
// Kenya Gas Marketplace
// Authentication System
// auth.js
// Part 2
// Validation
// ==========================================================


// ==========================================================
// REGULAR EXPRESSIONS
// ==========================================================

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex =
    /^(\+254|254|0)7\d{8}$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


// ==========================================================
// EMAIL VALIDATION
// ==========================================================

function validateEmail() {

    if (!email)
        return false;

    const value =
        email.value.trim();

    if (value === "") {

        email.classList.remove(
            "is-valid",
            "is-invalid"
        );

        return false;

    }

    if (emailRegex.test(value)) {

        email.classList.add("is-valid");

        email.classList.remove("is-invalid");

        return true;

    }

    email.classList.add("is-invalid");

    email.classList.remove("is-valid");

    return false;

}

if (email) {

    email.addEventListener(
        "input",
        validateEmail
    );

}


// ==========================================================
// PHONE VALIDATION
// ==========================================================

function validatePhone() {

    if (!phone)
        return false;

    const value =
        phone.value.trim();

    if (value === "") {

        phone.classList.remove(
            "is-valid",
            "is-invalid"
        );

        return false;

    }

    if (phoneRegex.test(value)) {

        phone.classList.add("is-valid");

        phone.classList.remove("is-invalid");

        return true;

    }

    phone.classList.add("is-invalid");

    phone.classList.remove("is-valid");

    return false;

}

if (phone) {

    phone.addEventListener(
        "input",
        validatePhone
    );

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

    if (!password)
        return;

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

    if (!password || !confirmPassword)
        return false;

    if (

        password.value === "" &&

        confirmPassword.value === ""

    ) {

        passwordMatchMessage.textContent = "";

        return false;

    }

    if (

        password.value ===

        confirmPassword.value

    ) {

        passwordMatchMessage.textContent =
            "✓ Passwords match";

        passwordMatchMessage.className =
            "text-success fw-semibold";

        return true;

    }

    passwordMatchMessage.textContent =
        "✗ Passwords do not match";

    passwordMatchMessage.className =
        "text-danger fw-semibold";

    return false;

}

if (password) {

    password.addEventListener(
        "input",
        checkPasswordMatch
    );

}

if (confirmPassword) {

    confirmPassword.addEventListener(
        "input",
        checkPasswordMatch
    );

}


// ==========================================================
// TERMS VALIDATION
// ==========================================================

function validateTerms() {

    const terms =
        document.getElementById("terms");

    if (!terms)
        return false;

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
// COMPLETE FORM VALIDATION
// ==========================================================

function validateRegistrationForm() {

    if (!firstName.value.trim()) {

        showToast(
            "Please enter your first name.",
            false
        );

        firstName.focus();

        return false;

    }

    if (!lastName.value.trim()) {

        showToast(
            "Please enter your last name.",
            false
        );

        lastName.focus();

        return false;

    }

    if (!validateEmail()) {

        showToast(
            "Please enter a valid email address.",
            false
        );

        email.focus();

        return false;

    }

    if (!validatePhone()) {

        showToast(
            "Please enter a valid Kenyan phone number.",
            false
        );

        phone.focus();

        return false;

    }

    if (!countySelect.value) {

        showToast(
            "Please select your county.",
            false
        );

        countySelect.focus();

        return false;

    }

    if (!townSelect.value) {

        showToast(
            "Please select your town.",
            false
        );

        townSelect.focus();

        return false;

    }

    if (!passwordRegex.test(password.value)) {

        showToast(
            "Password does not meet the required strength.",
            false
        );

        password.focus();

        return false;

    }

    if (!checkPasswordMatch()) {

        showToast(
            "Passwords do not match.",
            false
        );

        confirmPassword.focus();

        return false;

    }

    if (!validateTerms())
        return false;

    return true;

}


// ==========================================================
// END OF PART 2
// ==========================================================

// ==========================================================
// Kenya Gas Marketplace
// Authentication System
// auth.js
// Part 3
// Firebase Registration
// ==========================================================


// ==========================================================
// REGISTER EVENT
// ==========================================================

if (registerForm) {

    registerForm.addEventListener(

        "submit",

        registerUser

    );

}


// ==========================================================
// REGISTER USER
// ==========================================================

async function registerUser(e) {

    e.preventDefault();

    if (!validateRegistrationForm())
        return;

    setLoading(true);

    try {

        const userCredential =

            await createUserWithEmailAndPassword(

                auth,

                email.value.trim(),

                password.value

            );

        const user =
            userCredential.user;


        // =====================================
        // UPDATE FIREBASE PROFILE
        // =====================================

        await updateProfile(user, {

            displayName:

                `${firstName.value.trim()} ${lastName.value.trim()}`

        });


        // =====================================
        // SEND EMAIL VERIFICATION
        // =====================================

        await sendEmailVerification(user);


        // =====================================
        // SAVE USER TO FIRESTORE
        // =====================================

        await setDoc(

            doc(db, "users", user.uid),

            {

                uid:
                    user.uid,

                firstName:
                    firstName.value.trim(),

                lastName:
                    lastName.value.trim(),

                fullName:
                    `${firstName.value.trim()} ${lastName.value.trim()}`,

                email:
                    email.value.trim(),

                phone:
                    phone.value.trim(),

                county:
                    countySelect.value,

                town:
                    townSelect.value,

                estate:
                    document.getElementById("estate")?.value || "",

                building:
                    document.getElementById("building")?.value || "",

                houseNumber:
                    document.getElementById("houseNumber")?.value || "",

                landmark:
                    document.getElementById("landmark")?.value || "",

                latitude:
                    document.getElementById("latitude")?.value || "",

                longitude:
                    document.getElementById("longitude")?.value || "",

                gender:
                    document.getElementById("gender")?.value || "",

                dob:
                    document.getElementById("dob")?.value || "",

                referralCode:
                    document.getElementById("referralCode")?.value || "",

                smsUpdates:
                    document.getElementById("smsUpdates")?.checked || false,

                emailPromotions:
                    document.getElementById("emailPromotions")?.checked || false,

                profilePhoto: "",

                provider: "email",

                role: "customer",

                status: "active",

                verified:
                    user.emailVerified,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }

        );


        // =====================================
        // SUCCESS
        // =====================================

        showToast(

            "🎉 Registration successful! Please verify your email before logging in."

        );


        registerForm.reset();


        if (passwordStrengthBar) {

            passwordStrengthBar.style.width = "0%";

            passwordStrengthBar.className =

                "progress-bar";

        }


        if (passwordStrengthText) {

            passwordStrengthText.textContent =

                "Password Strength";

        }


        if (passwordMatchMessage) {

            passwordMatchMessage.textContent = "";

        }


        initializeLocations();


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

                    "Your password is too weak.";

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
// END OF PART 3
// ==========================================================

// ==========================================================
// Kenya Gas Marketplace
// Authentication System
// auth.js
// Part 4
// ==========================================================


// ==========================================================
// GOOGLE SIGN IN
// ==========================================================

const googleProvider =
    new GoogleAuthProvider();


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

        const first =
            names[0];

        const last =
            names.slice(1).join(" ");


        await setDoc(

            doc(db, "users", user.uid),

            {

                uid:
                    user.uid,

                firstName:
                    first,

                lastName:
                    last,

                fullName:
                    user.displayName || "",

                email:
                    user.email || "",

                phone:
                    user.phoneNumber || "",

                county: "",

                town: "",

                estate: "",

                building: "",

                houseNumber: "",

                landmark: "",

                latitude: "",

                longitude: "",

                profilePhoto:
                    user.photoURL || "",

                provider:
                    "google",

                verified:
                    user.emailVerified,

                role:
                    "customer",

                status:
                    "active",

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
// CURRENT LOCATION
// ==========================================================

const detectLocation =
    document.getElementById("detectLocation");


if (detectLocation) {

    detectLocation.addEventListener(

        "click",

        () => {

            if (!navigator.geolocation) {

                showToast(

                    "Your browser does not support GPS.",

                    false

                );

                return;

            }

            detectLocation.disabled = true;

            detectLocation.innerHTML =

                '<span class="spinner-border spinner-border-sm"></span> Detecting...';

            navigator.geolocation.getCurrentPosition(

                position => {

                    document.getElementById("latitude").value =

                        position.coords.latitude;

                    document.getElementById("longitude").value =

                        position.coords.longitude;

                    const preview =

                        document.getElementById("locationPreview");

                    const text =

                        document.getElementById("locationText");

                    preview.classList.remove("d-none");

                    text.innerHTML =

                        `
Latitude: ${position.coords.latitude}<br>
Longitude: ${position.coords.longitude}
`;

                    detectLocation.disabled = false;

                    detectLocation.innerHTML =

                        '<i class="bi bi-crosshair"></i> Use My Current Location';

                    showToast(

                        "Location detected successfully."

                    );

                },

                error => {

                    detectLocation.disabled = false;

                    detectLocation.innerHTML =

                        '<i class="bi bi-crosshair"></i> Use My Current Location';

                    showToast(

                        error.message,

                        false

                    );

                }

            );

        }

    );

}



// ==========================================================
// AUTH STATE
// ==========================================================

onAuthStateChanged(

    auth,

    user => {

        if (!user)
            return;

        const page =

            window.location.pathname

                .split("/")

                .pop();

        if (

            page === "register.html" ||

            page === "login.html"

        ) {

            if (user.emailVerified) {

                window.location.href =

                    "customer-dashboard.html";

            }

        }

    }

);



// ==========================================================
// PAGE INITIALIZATION
// ==========================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initializeLocations();

        updateStrengthMeter();

        checkPasswordMatch();

        console.log(

            "Kenya Gas Authentication Loaded Successfully"

        );

    }

);



// ==========================================================
// END OF FILE
// ==========================================================
