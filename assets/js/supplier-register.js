// ======================================================
// supplier-register.js
// Part 1
// Firebase Imports & DOM Elements
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

const form = document.getElementById(
    "supplierRegisterForm"
);

const registerBtn = document.getElementById(
    "registerSupplierBtn"
);

const registerText = document.getElementById(
    "registerSupplierText"
);

const registerLoading = document.getElementById(
    "registerSupplierLoading"
);

// ======================================================
// ACCOUNT
// ======================================================

const businessEmail = document.getElementById(
    "businessEmail"
);

const password = document.getElementById(
    "password"
);

const confirmPassword = document.getElementById(
    "confirmPassword"
);

// ======================================================
// BUSINESS DETAILS
// ======================================================

const businessName = document.getElementById(
    "businessName"
);

const businessType = document.getElementById(
    "businessType"
);

const ownerName = document.getElementById(
    "ownerName"
);

const businessPhone = document.getElementById(
    "businessPhone"
);

const alternativePhone = document.getElementById(
    "alternativePhone"
);

// ======================================================
// LOCATION
// ======================================================

const county = document.getElementById(
    "county"
);

const town = document.getElementById(
    "town"
);

const physicalAddress = document.getElementById(
    "physicalAddress"
);

const googleMapsLink = document.getElementById(
    "googleMapsLink"
);

const deliveryRadius = document.getElementById(
    "deliveryRadius"
);

const openingTime = document.getElementById(
    "openingTime"
);

const closingTime = document.getElementById(
    "closingTime"
);

const businessDescription = document.getElementById(
    "businessDescription"
);

// ======================================================
// VERIFICATION
// ======================================================

const nationalId = document.getElementById(
    "nationalId"
);

const kraPin = document.getElementById(
    "kraPin"
);

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

const mpesaType = document.getElementById(
    "mpesaType"
);

const mpesaNumber = document.getElementById(
    "mpesaNumber"
);

const bankName = document.getElementById(
    "bankName"
);

const bankAccount = document.getElementById(
    "bankAccount"
);

// ======================================================
// AGREEMENTS
// ======================================================

const agreeTerms = document.getElementById(
    "agreeTerms"
);

const agreePrivacy = document.getElementById(
    "agreePrivacy"
);

const supplierDeclaration =
document.getElementById(
    "supplierDeclaration"
);

const marketingConsent =
document.getElementById(
    "marketingConsent"
);

// ======================================================
// PASSWORD STRENGTH
// ======================================================

const passwordStrength =
document.getElementById(
    "passwordStrength"
);

const passwordStrengthText =
document.getElementById(
    "passwordStrengthText"
);

const passwordMatch =
document.getElementById(
    "passwordMatch"
);

// ======================================================
// PAGE READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Supplier Registration Ready"
        );

    }
);

// ======================================================
// LOAD COUNTIES
// ======================================================

function loadCounties() {

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

// ======================================================
// LOAD TOWNS
// ======================================================

function loadTowns(selectedCounty) {

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

county.addEventListener(

    "change",

    e => {

        loadTowns(e.target.value);

    }

);

// ======================================================
// DESCRIPTION CHARACTER COUNTER
// ======================================================

const descriptionCount =
document.getElementById(
    "descriptionCount"
);

businessDescription.addEventListener(

    "input",

    () => {

        descriptionCount.textContent =

            `${businessDescription.value.length} / 500`;

    }

);

// ======================================================
// SHOW / HIDE PASSWORD
// ======================================================

const togglePassword =
document.getElementById(
    "togglePassword"
);

const toggleConfirmPassword =
document.getElementById(
    "toggleConfirmPassword"
);

togglePassword.addEventListener(

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

toggleConfirmPassword.addEventListener(

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

// ======================================================
// PASSWORD STRENGTH
// ======================================================

password.addEventListener(

    "input",

    () => {

        const value =
            password.value;

        let score = 0;

        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        const percent =
            score * 20;

        passwordStrength.style.width =
            percent + "%";

        if (score <= 2) {

            passwordStrength.className =
                "progress-bar bg-danger";

            passwordStrengthText.textContent =
                "Weak Password";

        }

        else if (score <= 4) {

            passwordStrength.className =
                "progress-bar bg-warning";

            passwordStrengthText.textContent =
                "Medium Password";

        }

        else {

            passwordStrength.className =
                "progress-bar bg-success";

            passwordStrengthText.textContent =
                "Strong Password";

        }

    }

);

// ======================================================
// PASSWORD MATCH
// ======================================================

function checkPasswordMatch() {

    if (confirmPassword.value === "") {

        passwordMatch.textContent = "";

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

password.addEventListener(
    "input",
    checkPasswordMatch
);

confirmPassword.addEventListener(
    "input",
    checkPasswordMatch
);

// ======================================================
// INITIALIZE PAGE
// ======================================================

loadCounties();

// ======================================================
// LOAD COUNTIES
// ======================================================

function loadCounties() {

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

// ======================================================
// LOAD TOWNS
// ======================================================

function loadTowns(selectedCounty) {

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

county.addEventListener(

    "change",

    e => {

        loadTowns(e.target.value);

    }

);

// ======================================================
// DESCRIPTION CHARACTER COUNTER
// ======================================================

const descriptionCount =
document.getElementById(
    "descriptionCount"
);

businessDescription.addEventListener(

    "input",

    () => {

        descriptionCount.textContent =

            `${businessDescription.value.length} / 500`;

    }

);

// ======================================================
// SHOW / HIDE PASSWORD
// ======================================================

const togglePassword =
document.getElementById(
    "togglePassword"
);

const toggleConfirmPassword =
document.getElementById(
    "toggleConfirmPassword"
);

togglePassword.addEventListener(

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

toggleConfirmPassword.addEventListener(

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

// ======================================================
// PASSWORD STRENGTH
// ======================================================

password.addEventListener(

    "input",

    () => {

        const value =
            password.value;

        let score = 0;

        if (value.length >= 8) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[a-z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        const percent =
            score * 20;

        passwordStrength.style.width =
            percent + "%";

        if (score <= 2) {

            passwordStrength.className =
                "progress-bar bg-danger";

            passwordStrengthText.textContent =
                "Weak Password";

        }

        else if (score <= 4) {

            passwordStrength.className =
                "progress-bar bg-warning";

            passwordStrengthText.textContent =
                "Medium Password";

        }

        else {

            passwordStrength.className =
                "progress-bar bg-success";

            passwordStrengthText.textContent =
                "Strong Password";

        }

    }

);

// ======================================================
// PASSWORD MATCH
// ======================================================

function checkPasswordMatch() {

    if (confirmPassword.value === "") {

        passwordMatch.textContent = "";

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

password.addEventListener(
    "input",
    checkPasswordMatch
);

confirmPassword.addEventListener(
    "input",
    checkPasswordMatch
);

// ======================================================
// INITIALIZE PAGE
// ======================================================

loadCounties();

// ======================================================
// FIREBASE STORAGE UPLOADS
// ======================================================

async function uploadBusinessLicense(userId){

    const file =
        businessLicenseFile.files[0];

    if(!file) return "";

    const extension =
        file.name.split(".").pop();

    const fileName =

        `license_${Date.now()}.${extension}`;

    const storageRef = ref(

        storage,

        `suppliers/${userId}/documents/${fileName}`

    );

    await uploadBytes(

        storageRef,

        file

    );

    return await getDownloadURL(

        storageRef

    );

}

// ======================================================
// UPLOAD BUSINESS LOGO
// ======================================================

async function uploadBusinessLogo(userId){

    if(

        businessLogo.files.length===0

    ){

        return "";

    }

    const file =
        businessLogo.files[0];

    const extension =
        file.name.split(".").pop();

    const fileName =

        `logo_${Date.now()}.${extension}`;

    const storageRef = ref(

        storage,

        `suppliers/${userId}/logo/${fileName}`

    );

    await uploadBytes(

        storageRef,

        file

    );

    return await getDownloadURL(

        storageRef

    );

}

// ======================================================
// COLLECT LPG BRANDS
// ======================================================

function getSelectedBrands(){

    const brands = [];

    document.querySelectorAll(

        'input[type="checkbox"][id^="brand"]:checked'

    ).forEach(

        checkbox=>{

            brands.push(

                checkbox.value

            );

        }

    );

    if(

        otherBrand.value.trim()

    ){

        brands.push(

            otherBrand.value.trim()

        );

    }

    return brands;

}

// ======================================================
// COLLECT CYLINDER SIZES
// ======================================================

function getCylinderSizes(){

    const sizes = [];

    document.querySelectorAll(

        'input[type="checkbox"][id^="size"]:checked'

    ).forEach(

        checkbox=>{

            sizes.push(

                checkbox.value

            );

        }

    );

    return sizes;

}

// ======================================================
// COLLECT OPERATING DAYS
// ======================================================

function getOperatingDays(){

    const days = [];

    const map = {

        mon:"Monday",

        tue:"Tuesday",

        wed:"Wednesday",

        thu:"Thursday",

        fri:"Friday",

        sat:"Saturday",

        sun:"Sunday"

    };

    Object.keys(map).forEach(

        id=>{

            const checkbox =

                document.getElementById(id);

            if(

                checkbox &&

                checkbox.checked

            ){

                days.push(

                    map[id]

                );

            }

        }

    );

    return days;

}

// ======================================================
// COLLECT ADDITIONAL SERVICES
// ======================================================

function getAdditionalServices(){

    const services = [];

    if(

        document.getElementById(

            "serviceInstallation"

        ).checked

    ){

        services.push(

            "Gas Installation"

        );

    }

    if(

        document.getElementById(

            "serviceRegulator"

        ).checked

    ){

        services.push(

            "Regulator Replacement"

        );

    }

    if(

        document.getElementById(

            "serviceInspection"

        ).checked

    ){

        services.push(

            "Gas Leak Inspection"

        );

    }

    return services;

}

// ======================================================
// GENERATE SUPPLIER ID
// ======================================================

function generateSupplierCode(){

    return "SUP-" +

        Date.now()

        .toString()

        .slice(-8);

}

// ======================================================
// REGISTER SUPPLIER
// ======================================================

form.addEventListener(

    "submit",

    async (e)=>{

        e.preventDefault();

        if(

            !validateForm()

        ){

            return;

        }

        try{

            setLoading(true);

            // =====================================
            // CREATE AUTH ACCOUNT
            // =====================================

            const userCredential =

                await createUserWithEmailAndPassword(

                    auth,

                    businessEmail.value.trim(),

                    password.value

                );

            const user =

                userCredential.user;

            // =====================================
            // UPDATE DISPLAY NAME
            // =====================================

            await updateProfile(

                user,

                {

                    displayName:

                        businessName.value.trim()

                }

            );

            // =====================================
            // SEND EMAIL VERIFICATION
            // =====================================

            await sendEmailVerification(

                user

            );

            // =====================================
            // UPLOAD FILES
            // =====================================

            const licenseUrl =

                await uploadBusinessLicense(

                    user.uid

                );

            const logoUrl =

                await uploadBusinessLogo(

                    user.uid

                );

            // =====================================
            // CREATE SUPPLIER OBJECT
            // =====================================

            const supplierData = {

                uid: user.uid,

                supplierCode:
                    generateSupplierCode(),

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
                    Number(deliveryRadius.value),

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

                deliveryAvailable:
                    document.getElementById(
                        "deliveryAvailable"
                    ).value,

                deliveryCharge:
                    Number(
                        document.getElementById(
                            "deliveryCharge"
                        ).value
                    ),

                deliveryCoverage:
                    document.getElementById(
                        "deliveryCoverage"
                    ).value.trim(),

                marketingConsent:
                    marketingConsent.checked,

                accountType:
                    "supplier",

                verified:
                    false,

                approved:
                    false,

                suspended:
                    false,

                profileComplete:
                    true,

                rating:
                    0,

                totalReviews:
                    0,

                totalOrders:
                    0,

                totalSales:
                    0,

                walletBalance:
                    0,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };

            // =====================================
            // SAVE TO FIRESTORE
            // =====================================

            await setDoc(

                doc(

                    db,

                    "suppliers",

                    user.uid

                ),

                supplierData

            );

            // =====================================
            // CREATE USER RECORD
            // =====================================

            await setDoc(

                doc(

                    db,

                    "users",

                    user.uid

                ),

                {

                    uid:
                        user.uid,

                    name:
                        ownerName.value.trim(),

                    email:
                        businessEmail.value.trim(),

                    phone:
                        businessPhone.value.trim(),

                    role:
                        "supplier",

                    supplierId:
                        user.uid,

                    approved:
                        false,

                    createdAt:
                        serverTimestamp()

                }

            );

                    // =====================================
            // CREATE SUPPLIER WALLET
            // =====================================

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

            // =====================================
            // CREATE ANALYTICS DOCUMENT
            // =====================================

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

            // =====================================
            // CREATE FIRST NOTIFICATION
            // =====================================

            await setDoc(

                doc(

                    db,

                    "notifications",

                    crypto.randomUUID()

                ),

                {

                    userId: user.uid,

                    type: "welcome",

                    title: "Welcome to Kenya Gas Marketplace!",

                    message:
                    "Your supplier account has been created successfully. Please verify your email address. Your business will be reviewed within 24–48 hours before activation.",

                    read: false,

                    createdAt: serverTimestamp()

                }

            );

            // =====================================
            // SUCCESS MESSAGE
            // =====================================

            showAlert(

                "Registration successful! Please verify your email before logging in. Your supplier account is now awaiting approval.",

                "success"

            );

            form.reset();

            form.classList.remove(

                "was-validated"

            );

            passwordStrength.style.width = "0%";

            passwordStrength.className = "progress-bar";

            passwordStrengthText.textContent =

                "Password strength";

            passwordMatch.textContent = "";

            descriptionCount.textContent =

                "0 / 500";

            loadCounties();

            town.innerHTML =

                '<option value="">Select county first</option>';

            setTimeout(

                ()=>{

                    window.location.href =

                    "supplier-login.html";

                },

                3000

            );

        }

        catch(error){

            console.error(error);

            let message =

                "Registration failed. Please try again.";

            switch(error.code){

                case "auth/email-already-in-use":

                    message =

                    "An account with this email already exists.";

                    break;

                case "auth/invalid-email":

                    message =

                    "The email address is invalid.";

                    break;

                case "auth/weak-password":

                    message =

                    "Choose a stronger password.";

                    break;

                case "storage/unauthorized":

                    message =

                    "Unable to upload your documents.";

                    break;

                case "permission-denied":

                    message =

                    "Firestore permission denied. Check your security rules.";

                    break;

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
// END OF supplier-register.js
// ======================================================
