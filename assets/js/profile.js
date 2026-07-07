// ======================================================
// Kenya Gas Marketplace
// Customer Profile
// Part 1
// ======================================================

import { auth, db } from "./firebase.js";

import {

    onAuthStateChanged,

    signOut,

    updateProfile,

    sendEmailVerification,

    updatePassword,

    deleteUser

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    doc,

    getDoc,

    updateDoc,

    collection,

    query,

    where,

    orderBy,

    limit,

    getDocs,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// CURRENT USER
// ======================================================

let currentUser = null;

let currentUserData = null;

// ======================================================
// PROFILE HEADER
// ======================================================

const navbarCustomerName =
    document.getElementById("navbarCustomerName");

const profileImage =
    document.getElementById("profileImage");

const profileImageInput =
    document.getElementById("profileImageInput");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profilePhone =
    document.getElementById("profilePhone");

const profileVerified =
    document.getElementById("profileVerified");

const memberSince =
    document.getElementById("memberSince");

const accountStatus =
    document.getElementById("accountStatus");

// ======================================================
// ACCOUNT SUMMARY
// ======================================================

const summaryOrders =
    document.getElementById("summaryOrders");

const summaryPoints =
    document.getElementById("summaryPoints");

const summaryAddresses =
    document.getElementById("summaryAddresses");

const profileProgress =
    document.getElementById("profileProgress");

const profileCompletionText =
    document.getElementById("profileCompletionText");

// ======================================================
// PERSONAL INFORMATION
// ======================================================

const firstName =
    document.getElementById("firstName");

const lastName =
    document.getElementById("lastName");

const email =
    document.getElementById("email");

const phone =
    document.getElementById("phone");

const nationalId =
    document.getElementById("nationalId");

const gender =
    document.getElementById("gender");

const county =
    document.getElementById("county");

const town =
    document.getElementById("town");

const estate =
    document.getElementById("estate");

const landmark =
    document.getElementById("landmark");

const address =
    document.getElementById("address");

// ======================================================
// BUTTONS
// ======================================================

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const editProfileBtn =
    document.getElementById("editProfileBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const logoutAccountBtn =
    document.getElementById("logoutAccountBtn");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

const changePasswordSecurityBtn =
    document.getElementById("changePasswordSecurityBtn");

// ======================================================
// ADDRESS BUTTONS
// ======================================================

const addAddressBtn =
    document.getElementById("addAddressBtn");

const saveAddressBtn =
    document.getElementById("saveAddressBtn");

// ======================================================
// PREFERENCES
// ======================================================

const emailNotifications =
    document.getElementById("emailNotifications");

const smsNotifications =
    document.getElementById("smsNotifications");

const pushNotifications =
    document.getElementById("pushNotifications");

const promotionNotifications =
    document.getElementById("promotionNotifications");

const priceAlerts =
    document.getElementById("priceAlerts");

const preferredLanguage =
    document.getElementById("preferredLanguage");

const preferredCurrency =
    document.getElementById("preferredCurrency");

const preferredGasSize =
    document.getElementById("preferredGasSize");

const preferredDeliveryTime =
    document.getElementById("preferredDeliveryTime");

const darkMode =
    document.getElementById("darkMode");

const savePreferencesBtn =
    document.getElementById("savePreferencesBtn");

// ======================================================
// SECURITY
// ======================================================

const verifyEmailBtn =
    document.getElementById("verifyEmailBtn");

const verifyPhoneBtn =
    document.getElementById("verifyPhoneBtn");

const enable2FABtn =
    document.getElementById("enable2FABtn");

const linkGoogleBtn =
    document.getElementById("linkGoogleBtn");

// ======================================================
// ACCOUNT ACTIONS
// ======================================================

const downloadDataBtn =
    document.getElementById("downloadDataBtn");

const deleteAccountBtn =
    document.getElementById("deleteAccountBtn");

// ======================================================
// RECENT ORDERS
// ======================================================

const recentOrdersTable =
    document.getElementById("recentOrdersTable");

// ======================================================
// TOAST
// ======================================================

const profileToast =
    document.getElementById("profileToast");

const toastMessage =
    document.getElementById("toastMessage");
// ======================================================
// AUTHENTICATION
// ======================================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.href="login.html";

            return;

        }

        currentUser = user;

        await initializeProfile();

    }

);

// ======================================================
// INITIALIZE PROFILE
// ======================================================

async function initializeProfile(){

    try{

        showLoading(true);

        await loadUserProfile();

        await loadRecentOrders();

        await loadUserPreferences();

        calculateProfileCompletion();

        registerEventListeners();

    }

    catch(error){

        console.error(

            "Profile initialization failed:",

            error

        );

        showToast(

            "Failed to load profile.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// REGISTER EVENTS
// ======================================================

function registerEventListeners(){

    // =====================================
    // SAVE PROFILE
    // =====================================

    if(saveProfileBtn){

        saveProfileBtn.addEventListener(

            "click",

            saveProfile

        );

    }

    // =====================================
    // PROFILE PHOTO
    // =====================================

    if(profileImageInput){

        profileImageInput.addEventListener(

            "change",

            uploadProfileImage

        );

    }

    // =====================================
    // ADD ADDRESS
    // =====================================

    if(addAddressBtn){

        addAddressBtn.addEventListener(

            "click",

            openAddressModal

        );

    }

    if(saveAddressBtn){

        saveAddressBtn.addEventListener(

            "click",

            saveAddress

        );

    }

    // =====================================
    // SAVE PREFERENCES
    // =====================================

    if(savePreferencesBtn){

        savePreferencesBtn.addEventListener(

            "click",

            savePreferences

        );

    }

    // =====================================
    // EMAIL VERIFICATION
    // =====================================

    if(verifyEmailBtn){

        verifyEmailBtn.addEventListener(

            "click",

            resendVerificationEmail

        );

    }

    // =====================================
    // PASSWORD
    // =====================================

    if(changePasswordBtn){

        changePasswordBtn.addEventListener(

            "click",

            changePassword

        );

    }

    if(changePasswordSecurityBtn){

        changePasswordSecurityBtn.addEventListener(

            "click",

            changePassword

        );

    }

    // =====================================
    // DOWNLOAD DATA
    // =====================================

    if(downloadDataBtn){

        downloadDataBtn.addEventListener(

            "click",

            downloadMyData

        );

    }

    // =====================================
    // DELETE ACCOUNT
    // =====================================

    if(deleteAccountBtn){

        deleteAccountBtn.addEventListener(

            "click",

            deleteMyAccount

        );

    }

    // =====================================
    // LOGOUT
    // =====================================

    if(logoutBtn){

        logoutBtn.addEventListener(

            "click",

            logout

        );

    }

    if(logoutAccountBtn){

        logoutAccountBtn.addEventListener(

            "click",

            logout

        );

    }

}

// ======================================================
// LOADING INDICATOR
// ======================================================

function showLoading(show){

    document.body.style.cursor =

        show

        ? "wait"

        : "default";

}

// ======================================================
// LOAD USER PROFILE
// ======================================================

async function loadUserProfile(){

    try{

        const userRef =

            doc(

                db,

                "users",

                currentUser.uid

            );

        const userSnap =

            await getDoc(userRef);

        if(!userSnap.exists()){

            showToast(

                "Profile not found.",

                "danger"

            );

            return;

        }

        currentUserData =

            userSnap.data();

        // =====================================
        // PROFILE HEADER
        // =====================================

        const fullName =

            `${currentUserData.firstName || ""} ${currentUserData.lastName || ""}`

            .trim();

        if(navbarCustomerName){

            navbarCustomerName.textContent =

                fullName || "Customer";

        }

        if(profileName){

            profileName.textContent =

                fullName || "Customer";

        }

        if(profileEmail){

            profileEmail.textContent =

                currentUserData.email ||

                currentUser.email;

        }

        if(profilePhone){

            profilePhone.textContent =

                currentUserData.phone ||

                "-";

        }

        if(profileImage){

            profileImage.src =

                currentUserData.profileImage ||

                "assets/images/default-user.png";

        }

        // =====================================
        // MEMBER SINCE
        // =====================================

        if(

            memberSince &&

            currentUser.metadata.creationTime

        ){

            memberSince.textContent =

                new Date(

                    currentUser.metadata.creationTime

                ).toLocaleDateString(

                    "en-KE",

                    {

                        year:"numeric",

                        month:"long"

                    }

                );

        }

        // =====================================
        // ACCOUNT STATUS
        // =====================================

        if(accountStatus){

            accountStatus.textContent =

                "Active";

        }

        if(profileVerified){

            profileVerified.className =

                currentUser.emailVerified

                ?

                "badge bg-success"

                :

                "badge bg-warning text-dark";

            profileVerified.textContent =

                currentUser.emailVerified

                ?

                "Verified Customer"

                :

                "Email Not Verified";

        }

        // =====================================
        // ACCOUNT SUMMARY
        // =====================================

        if(summaryPoints){

            summaryPoints.textContent =

                Number(

                    currentUserData.loyaltyPoints || 0

                ).toLocaleString();

        }

        if(summaryAddresses){

            summaryAddresses.textContent =

                Number(

                    currentUserData.savedAddresses || 0

                );

        }

        // =====================================
        // PERSONAL INFORMATION
        // =====================================

        if(firstName){

            firstName.value =

                currentUserData.firstName || "";

        }

        if(lastName){

            lastName.value =

                currentUserData.lastName || "";

        }

        if(email){

            email.value =

                currentUser.email ||

                "";

        }

        if(phone){

            phone.value =

                currentUserData.phone ||

                "";

        }

        if(nationalId){

            nationalId.value =

                currentUserData.nationalId ||

                "";

        }

        if(gender){

            gender.value =

                currentUserData.gender ||

                "";

        }

        if(county){

            county.value =

                currentUserData.county ||

                "";

        }

        // Trigger towns loading

        county.dispatchEvent(

            new Event("change")

        );

        if(town){

            setTimeout(()=>{

                town.value =

                    currentUserData.town ||

                    "";

            },300);

        }

        if(estate){

            estate.value =

                currentUserData.estate ||

                "";

        }

        if(landmark){

            landmark.value =

                currentUserData.landmark ||

                "";

        }

        if(address){

            address.value =

                currentUserData.address ||

                "";

        }

    }

    catch(error){

        console.error(

            "Error loading profile:",

            error

        );

        showToast(

            "Unable to load profile.",

            "danger"

        );

    }

}

// ======================================================
// SAVE PROFILE
// ======================================================

async function saveProfile(){

    if(!currentUser) return;

    try{

        const first =

            firstName.value.trim();

        const last =

            lastName.value.trim();

        if(first==="" || last===""){

            showToast(

                "First name and last name are required.",

                "warning"

            );

            return;

        }

        saveProfileBtn.disabled = true;

        saveProfileBtn.innerHTML =

            '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        // =====================================
        // UPDATE FIREBASE AUTH PROFILE
        // =====================================

        await updateProfile(

            currentUser,

            {

                displayName:

                    `${first} ${last}`

            }

        );

        // =====================================
        // UPDATE FIRESTORE
        // =====================================

        const userRef =

            doc(

                db,

                "users",

                currentUser.uid

            );

        await updateDoc(

            userRef,

            {

                firstName: first,

                lastName: last,

                phone:

                    phone.value.trim(),

                nationalId:

                    nationalId.value.trim(),

                gender:

                    gender.value,

                county:

                    county.value,

                town:

                    town.value,

                estate:

                    estate.value.trim(),

                landmark:

                    landmark.value.trim(),

                address:

                    address.value.trim(),

                updatedAt:

                    serverTimestamp()

            }

        );

        // =====================================
        // UPDATE LOCAL DATA
        // =====================================

        currentUserData = {

            ...currentUserData,

            firstName: first,

            lastName: last,

            phone:

                phone.value.trim(),

            nationalId:

                nationalId.value.trim(),

            gender:

                gender.value,

            county:

                county.value,

            town:

                town.value,

            estate:

                estate.value.trim(),

            landmark:

                landmark.value.trim(),

            address:

                address.value.trim()

        };

        // =====================================
        // UPDATE UI
        // =====================================

        const fullName =

            `${first} ${last}`;

        if(profileName){

            profileName.textContent =

                fullName;

        }

        if(navbarCustomerName){

            navbarCustomerName.textContent =

                fullName;

        }

        if(profilePhone){

            profilePhone.textContent =

                phone.value.trim() || "-";

        }

        calculateProfileCompletion();

        showToast(

            "Profile updated successfully."

        );

    }

    catch(error){

        console.error(

            "Save profile error:",

            error

        );

        showToast(

            "Failed to save profile.",

            "danger"

        );

    }

    finally{

        saveProfileBtn.disabled = false;

        saveProfileBtn.innerHTML =

            '<i class="bi bi-check-circle"></i> Save Changes';

    }

}

// ======================================================
// PROFILE COMPLETION
// ======================================================

function calculateProfileCompletion(){

    if(!currentUserData) return;

    const fields=[

        currentUserData.firstName,

        currentUserData.lastName,

        currentUser.email,

        currentUserData.phone,

        currentUserData.gender,

        currentUserData.county,

        currentUserData.town,

        currentUserData.estate,

        currentUserData.address,

        currentUserData.profileImage

    ];

    const completed =

        fields.filter(

            value =>

                value &&

                String(value).trim() !== ""

        ).length;

    const percentage =

        Math.round(

            completed /

            fields.length *

            100

        );

    if(profileProgress){

        profileProgress.style.width =

            percentage + "%";

        profileProgress.textContent =

            percentage + "%";

    }

    if(profileCompletionText){

        if(percentage===100){

            profileCompletionText.textContent =

                "Your profile is fully completed.";

        }

        else{

            profileCompletionText.textContent =

                `${percentage}% completed. Complete your profile for a better experience.`;

        }

    }

}

