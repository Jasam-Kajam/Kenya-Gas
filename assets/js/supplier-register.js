// ======================================================
// Kenya Gas Marketplace
// Supplier Registration
// Section 1 - Imports & Initialization
// ======================================================

import { auth, db, storage } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

import {
    kenyaCounties,
    townsByCounty
} from "./counties.js";

// ======================================================
// FORM
// ======================================================

const form = document.getElementById("supplierRegisterForm");

if (!form) {
    console.error("supplierRegisterForm not found.");
    throw new Error("Registration form missing.");
}

// ======================================================
// BUTTONS
// ======================================================

const registerBtn =
    document.getElementById("registerSupplierBtn");

const registerText =
    document.getElementById("registerSupplierText");

const registerLoading =
    document.getElementById("registerSupplierLoading");

// ======================================================
// ACCOUNT
// ======================================================

const businessEmail =
    document.getElementById("businessEmail");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

// ======================================================
// BUSINESS
// ======================================================

const businessName =
    document.getElementById("businessName");

const businessType =
    document.getElementById("businessType");

const ownerName =
    document.getElementById("ownerName");

const businessPhone =
    document.getElementById("businessPhone");

const alternativePhone =
    document.getElementById("alternativePhone");

// ======================================================
// LOCATION
// ======================================================

const county =
    document.getElementById("county");

const town =
    document.getElementById("town");

const physicalAddress =
    document.getElementById("physicalAddress");

const googleMapsLink =
    document.getElementById("googleMapsLink");

const deliveryRadius =
    document.getElementById("deliveryRadius");

const openingTime =
    document.getElementById("openingTime");

const closingTime =
    document.getElementById("closingTime");

const businessDescription =
    document.getElementById("businessDescription");

// ======================================================
// VERIFICATION
// ======================================================

const nationalId =
    document.getElementById("nationalId");

const kraPin =
    document.getElementById("kraPin");

const businessRegistrationNumber =
    document.getElementById(
        "businessRegistrationNumber"
    );

const businessLicenseNumber =
    document.getElementById(
        "businessLicenseNumber"
    );

const businessLicenseFile =
    document.getElementById(
        "businessLicenseFile"
    );

const businessLogo =
    document.getElementById(
        "businessLogo"
    );

// ======================================================
// PAYMENT
// ======================================================

const mpesaType =
    document.getElementById("mpesaType");

const mpesaNumber =
    document.getElementById("mpesaNumber");

const bankName =
    document.getElementById("bankName");

const bankAccount =
    document.getElementById("bankAccount");

// ======================================================
// AGREEMENTS
// ======================================================

const agreeTerms =
    document.getElementById("agreeTerms");

const agreePrivacy =
    document.getElementById("agreePrivacy");

const supplierDeclaration =
    document.getElementById("supplierDeclaration");

const marketingConsent =
    document.getElementById("marketingConsent");

// ======================================================
// PASSWORD UI
// ======================================================

const passwordStrength =
    document.getElementById("passwordStrength");

const passwordStrengthText =
    document.getElementById("passwordStrengthText");

const passwordMatch =
    document.getElementById("passwordMatch");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

// ======================================================
// OPTIONAL UI
// ======================================================

const descriptionCount =
    document.getElementById("descriptionCount");

const otherBrand =
    document.getElementById("otherBrand");

// ======================================================
// PAGE READY
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log(
        "Supplier Registration Loaded"
    );

});

// ======================================================
// SECTION 2
// Counties, Password Utilities & Validation
// ======================================================

// ------------------------------------------------------
// LOAD COUNTIES
// ------------------------------------------------------

function loadCounties() {

    if (!county) return;

    county.innerHTML =
        '<option value="">Select County</option>';

    kenyaCounties.forEach(countyName => {

        const option =
            document.createElement("option");

        option.value = countyName;
        option.textContent = countyName;

        county.appendChild(option);

    });

}

// ------------------------------------------------------
// LOAD TOWNS
// ------------------------------------------------------

function loadTowns(selectedCounty) {

    if (!town) return;

    town.innerHTML =
        '<option value="">Select Town</option>';

    if (!selectedCounty) return;

    const towns =
        townsByCounty[selectedCounty] || [];

    towns.forEach(townName => {

        const option =
            document.createElement("option");

        option.value = townName;
        option.textContent = townName;

        town.appendChild(option);

    });

}

county?.addEventListener("change", e => {

    loadTowns(e.target.value);

});

// ------------------------------------------------------
// DESCRIPTION COUNTER
// ------------------------------------------------------

if (businessDescription && descriptionCount) {

    descriptionCount.textContent =

        `${businessDescription.value.length}/500`;

    businessDescription.addEventListener(

        "input",

        () => {

            descriptionCount.textContent =

                `${businessDescription.value.length}/500`;

        }

    );

}

// ------------------------------------------------------
// SHOW / HIDE PASSWORD
// ------------------------------------------------------

togglePassword?.addEventListener(

    "click",

    () => {

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

toggleConfirmPassword?.addEventListener(

    "click",

    () => {

        confirmPassword.type =

            confirmPassword.type === "password"

            ? "text"
            : "password";

        toggleConfirmPassword.innerHTML =

            `<i class="bi bi-${
                confirmPassword.type === "password"
                ? "eye"
                : "eye-slash"
            }"></i>`;

    }

);

// ------------------------------------------------------
// PASSWORD STRENGTH
// ------------------------------------------------------

function updatePasswordStrength() {

    if (!passwordStrength) return;

    const value = password.value;

    let score = 0;

    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const width = score * 20;

    passwordStrength.style.width = width + "%";

    if (score <= 2) {

        passwordStrength.className =
            "progress-bar bg-danger";

        passwordStrengthText.textContent =
            "Weak";

    }

    else if (score <= 4) {

        passwordStrength.className =
            "progress-bar bg-warning";

        passwordStrengthText.textContent =
            "Medium";

    }

    else {

        passwordStrength.className =
            "progress-bar bg-success";

        passwordStrengthText.textContent =
            "Strong";

    }

}

password?.addEventListener(

    "input",

    updatePasswordStrength

);

// ------------------------------------------------------
// PASSWORD MATCH
// ------------------------------------------------------

function checkPasswordMatch() {

    if (!passwordMatch) return;

    if (confirmPassword.value === "") {

        passwordMatch.innerHTML = "";

        return;

    }

    if (password.value === confirmPassword.value) {

        passwordMatch.innerHTML =

            '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Passwords match</span>';

    }

    else {

        passwordMatch.innerHTML =

            '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Passwords do not match</span>';

    }

}

password?.addEventListener(

    "input",

    checkPasswordMatch

);

confirmPassword?.addEventListener(

    "input",

    checkPasswordMatch

);

// ------------------------------------------------------
// VALIDATION HELPERS
// ------------------------------------------------------

const phoneRegex =
    /^(\+254|254|0)7\d{8}$/;

const kraRegex =
    /^[A-Za-z]\d{9}[A-Za-z]$/;

const idRegex =
    /^\d{7,8}$/;

function isValidPhone(phone) {

    return phoneRegex.test(

        phone.trim()

    );

}

function isValidKra(pin) {

    return kraRegex.test(

        pin.trim().toUpperCase()

    );

}

function isValidNationalId(id) {

    return idRegex.test(

        id.trim()

    );

}

// ------------------------------------------------------
// FILE VALIDATION
// ------------------------------------------------------

const MAX_FILE_SIZE =
    5 * 1024 * 1024;

const allowedDocuments = [

    "application/pdf",

    "image/jpeg",

    "image/png",

    "image/jpg"

];

const allowedImages = [

    "image/jpeg",

    "image/png",

    "image/jpg",

    "image/webp"

];

function validateFile(file, types) {

    if (!file) {

        return {

            valid: false,

            message: "Please select a file."

        };

    }

    if (!types.includes(file.type)) {

        return {

            valid: false,

            message: "Unsupported file format."

        };

    }

    if (file.size > MAX_FILE_SIZE) {

        return {

            valid: false,

            message: "File must be under 5MB."

        };

    }

    return {

        valid: true

    };

}

// ------------------------------------------------------
// BUTTON LOADING
// ------------------------------------------------------

function setLoading(loading = true) {

    registerBtn.disabled = loading;

    registerText.classList.toggle(

        "d-none",

        loading

    );

    registerLoading.classList.toggle(

        "d-none",

        !loading

    );

}

// ------------------------------------------------------
// ALERT
// ------------------------------------------------------

function showAlert(message, type = "danger") {

    document

        .querySelectorAll(".register-alert")

        .forEach(alert => alert.remove());

    const alert =

        document.createElement("div");

    alert.className =

        `alert alert-${type} register-alert`;

    alert.innerHTML =

        `<i class="bi bi-info-circle-fill me-2"></i>${message}`;

    form.prepend(alert);

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// ------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------

loadCounties();

// ======================================================
// SECTION 3
// Firebase Storage & Data Collection
// ======================================================

// ------------------------------------------------------
// UPLOAD BUSINESS LICENSE
// ------------------------------------------------------

async function uploadBusinessLicense(userId) {

    const file = businessLicenseFile.files[0];

    if (!file) return "";

    const extension = file.name.split(".").pop();

    const storageRef = ref(
        storage,
        `suppliers/${userId}/documents/license_${Date.now()}.${extension}`
    );

    await uploadBytes(storageRef, file);

    return await getDownloadURL(storageRef);

}

// ------------------------------------------------------
// UPLOAD BUSINESS LOGO
// ------------------------------------------------------

async function uploadBusinessLogo(userId) {

    if (!businessLogo.files.length) return "";

    const file = businessLogo.files[0];

    const extension = file.name.split(".").pop();

    const storageRef = ref(
        storage,
        `suppliers/${userId}/logo/logo_${Date.now()}.${extension}`
    );

    await uploadBytes(storageRef, file);

    return await getDownloadURL(storageRef);

}

// ------------------------------------------------------
// GET CHECKBOX VALUES
// ------------------------------------------------------

function getCheckedValues(prefix) {

    const values = [];

    document.querySelectorAll(
        `input[id^="${prefix}"]:checked`
    ).forEach(item => {

        values.push(item.value);

    });

    return values;

}

// ------------------------------------------------------
// LPG BRANDS
// ------------------------------------------------------

function getSelectedBrands() {

    const brands = getCheckedValues("brand");

    if (
        otherBrand &&
        otherBrand.value.trim() !== ""
    ) {

        brands.push(
            otherBrand.value.trim()
        );

    }

    return brands;

}

// ------------------------------------------------------
// CYLINDER SIZES
// ------------------------------------------------------

function getCylinderSizes() {

    return getCheckedValues("size");

}

// ------------------------------------------------------
// OPERATING DAYS
// ------------------------------------------------------

function getOperatingDays() {

    return getCheckedValues("day");

}

// ------------------------------------------------------
// SERVICES
// ------------------------------------------------------

function getAdditionalServices() {

    return getCheckedValues("service");

}

// ------------------------------------------------------
// SUPPLIER CODE
// ------------------------------------------------------

function generateSupplierCode() {

    return "SUP-" +

        Math.floor(

            10000000 +

            Math.random() * 90000000

        );

}

// ------------------------------------------------------
// BUILD SUPPLIER OBJECT
// ------------------------------------------------------

function buildSupplierData(

    user,

    logoUrl,

    licenseUrl

) {

    return {

        uid: user.uid,

        supplierCode:
            generateSupplierCode(),

        accountType:
            "supplier",

        approved:
            false,

        verified:
            false,

        suspended:
            false,

        profileComplete:
            true,

        businessName:
            businessName.value.trim(),

        businessType:
            businessType.value,

        ownerName:
            ownerName.value.trim(),

        email:
            businessEmail.value.trim(),

        phone:
            businessPhone.value.trim(),

        alternativePhone:
            alternativePhone.value.trim(),

        county:
            county.value,

        town:
            town.value,

        physicalAddress:
            physicalAddress.value.trim(),

        googleMaps:
            googleMapsLink.value.trim(),

        deliveryRadius:
            Number(deliveryRadius.value || 0),

        openingTime:
            openingTime.value,

        closingTime:
            closingTime.value,

        description:
            businessDescription.value.trim(),

        nationalId:
            nationalId.value.trim(),

        kraPin:
            kraPin.value.trim().toUpperCase(),

        businessRegistrationNumber:
            businessRegistrationNumber.value.trim(),

        businessLicenseNumber:
            businessLicenseNumber.value.trim(),

        businessLicenseUrl:
            licenseUrl,

        businessLogoUrl:
            logoUrl,

        mpesaType:
            mpesaType.value,

        mpesaNumber:
            mpesaNumber.value.trim(),

        bankName:
            bankName.value.trim(),

        bankAccount:
            bankAccount.value.trim(),

        brands:
            getSelectedBrands(),

        cylinderSizes:
            getCylinderSizes(),

        operatingDays:
            getOperatingDays(),

        additionalServices:
            getAdditionalServices(),

        rating: 0,

        totalReviews: 0,

        totalOrders: 0,

        totalSales: 0,

        walletBalance: 0,

        marketingConsent:
            marketingConsent.checked,

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };

}

// ------------------------------------------------------
// COMPLETE FORM VALIDATION
// ------------------------------------------------------

function validateForm() {

    if (!form.checkValidity()) {

        form.classList.add("was-validated");

        showAlert(
            "Please complete all required fields."
        );

        return false;

    }

    if (!isValidPhone(businessPhone.value)) {

        showAlert(
            "Please enter a valid Kenyan phone number."
        );

        return false;

    }

    if (
        alternativePhone.value &&
        !isValidPhone(alternativePhone.value)
    ) {

        showAlert(
            "Alternative phone number is invalid."
        );

        return false;

    }

    if (!isValidKra(kraPin.value)) {

        showAlert(
            "Invalid KRA PIN."
        );

        return false;

    }

    if (!isValidNationalId(nationalId.value)) {

        showAlert(
            "Invalid National ID."
        );

        return false;

    }

    if (password.value !== confirmPassword.value) {

        showAlert(
            "Passwords do not match."
        );

        return false;

    }

    const licenseCheck = validateFile(
        businessLicenseFile.files[0],
        allowedDocuments
    );

    if (!licenseCheck.valid) {

        showAlert(licenseCheck.message);

        return false;

    }

    if (businessLogo.files.length) {

        const logoCheck = validateFile(
            businessLogo.files[0],
            allowedImages
        );

        if (!logoCheck.valid) {

            showAlert(logoCheck.message);

            return false;

        }

    }

    if (!agreeTerms.checked) {

        showAlert(
            "You must accept the Terms and Conditions."
        );

        return false;

    }

    if (!agreePrivacy.checked) {

        showAlert(
            "You must accept the Privacy Policy."
        );

        return false;

    }

    if (!supplierDeclaration.checked) {

        showAlert(
            "Please confirm the supplier declaration."
        );

        return false;

    }

    return true;

}

// ======================================================
// SECTION 4
// Supplier Registration
// ======================================================

form.addEventListener(

    "submit",

    async (e) => {

        e.preventDefault();

        if (!validateForm()) {

            return;

        }

        try {

            setLoading(true);

            // --------------------------------------
            // CREATE FIREBASE ACCOUNT
            // --------------------------------------

            const userCredential =

                await createUserWithEmailAndPassword(

                    auth,

                    businessEmail.value.trim(),

                    password.value

                );

            const user = userCredential.user;

            // --------------------------------------
            // UPDATE PROFILE
            // --------------------------------------

            await updateProfile(

                user,

                {

                    displayName:

                        businessName.value.trim()

                }

            );

            // --------------------------------------
            // SEND EMAIL VERIFICATION
            // --------------------------------------

            await sendEmailVerification(user);

            // --------------------------------------
            // UPLOAD FILES
            // --------------------------------------

            let logoUrl = "";

            let licenseUrl = "";

            if (

                businessLogo.files.length

            ) {

                logoUrl =

                    await uploadBusinessLogo(

                        user.uid

                    );

            }

            if (

                businessLicenseFile.files.length

            ) {

                licenseUrl =

                    await uploadBusinessLicense(

                        user.uid

                    );

            }

            // --------------------------------------
            // BUILD SUPPLIER DATA
            // --------------------------------------

            const supplierData =

                buildSupplierData(

                    user,

                    logoUrl,

                    licenseUrl

                );

            // --------------------------------------
            // SAVE SUPPLIER
            // --------------------------------------

            await setDoc(

                doc(

                    db,

                    "suppliers",

                    user.uid

                ),

                supplierData

            );

            // --------------------------------------
            // SAVE USER RECORD
            // --------------------------------------

            await setDoc(

                doc(

                    db,

                    "users",

                    user.uid

                ),

                {

                    uid: user.uid,

                    role: "supplier",

                    supplierId: user.uid,

                    email: businessEmail.value.trim(),

                    fullName: ownerName.value.trim(),

                    phone: businessPhone.value.trim(),

                    approved: false,

                    emailVerified: false,

                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp()

                }

            );

            // --------------------------------------
            // CREATE WALLET
            // --------------------------------------

            await setDoc(

                doc(

                    db,

                    "wallets",

                    user.uid

                ),

                {

                    supplierId: user.uid,

                    balance: 0,

                    pendingBalance: 0,

                    totalWithdrawn: 0,

                    totalEarned: 0,

                    currency: "KES",

                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp()

                }

            );

            // --------------------------------------
            // CREATE ANALYTICS
            // --------------------------------------

            await setDoc(

                doc(

                    db,

                    "analytics",

                    user.uid

                ),

                {

                    supplierId: user.uid,

                    profileViews: 0,

                    productViews: 0,

                    ordersReceived: 0,

                    completedOrders: 0,

                    cancelledOrders: 0,

                    totalRevenue: 0,

                    monthlyRevenue: 0,

                    averageRating: 0,

                    totalCustomers: 0,

                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp()

                }

            );

            // --------------------------------------
            // CREATE NOTIFICATION
            // --------------------------------------

            await setDoc(

                doc(

                    db,

                    "notifications",

                    crypto.randomUUID()

                ),

                {

                    userId: user.uid,

                    type: "welcome",

                    title: "Welcome to Kenya Gas Marketplace",

                    message:
                        "Your supplier account has been created successfully. Please verify your email. Your account will be reviewed before approval.",

                    read: false,

                    createdAt: serverTimestamp()

                }

            );

                    // --------------------------------------
            // SUCCESS
            // --------------------------------------

            showAlert(

                "Registration successful! Please verify your email before logging in. Your supplier account will be reviewed within 24–48 hours.",

                "success"

            );

            form.reset();

            form.classList.remove("was-validated");

            // Reset UI

            if (passwordStrength) {

                passwordStrength.style.width = "0%";

                passwordStrength.className = "progress-bar";

            }

            if (passwordStrengthText) {

                passwordStrengthText.textContent =
                    "Password Strength";

            }

            if (passwordMatch) {

                passwordMatch.innerHTML = "";

            }

            if (descriptionCount) {

                descriptionCount.textContent = "0/500";

            }

            loadCounties();

            if (town) {

                town.innerHTML =
                    '<option value="">Select County First</option>';

            }

            setTimeout(() => {

                window.location.href =
                    "supplier-login.html";

            }, 3000);

        }

        catch (error) {

            console.error(error);

            let message =
                "Registration failed. Please try again.";

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

                case "storage/unauthorized":

                    message =
                        "You do not have permission to upload files.";

                    break;

                case "storage/canceled":

                    message =
                        "File upload was cancelled.";

                    break;

                case "storage/quota-exceeded":

                    message =
                        "Storage quota exceeded.";

                    break;

                case "permission-denied":

                    message =
                        "Firestore permission denied. Check your Firebase Security Rules.";

                    break;

                default:

                    if (error.message) {

                        message = error.message;

                    }

            }

            showAlert(

                message,

                "danger"

            );

        }

        finally {

            setLoading(false);

        }

    }

);

// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadCounties();

        console.log(

            "Supplier Registration Ready"

        );

    }

);

// ======================================================
// END OF FILE
// ======================================================
