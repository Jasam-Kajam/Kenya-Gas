// ======================================================
// Kenya Gas Marketplace
// Customer Profile
// Part 1
// ======================================================

import {

    auth,

    db,

    storage

} from "./firebase.js";

import {

    ref,

    uploadBytes,

    getDownloadURL

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


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

// ======================================================
// PROFILE IMAGE UPLOAD
// ======================================================

async function uploadProfileImage(event){

    if(!currentUser) return;

    const file =

        event.target.files[0];

    if(!file) return;

    // =====================================
    // VALIDATE IMAGE
    // =====================================

    if(

        !file.type.startsWith("image/")

    ){

        showToast(

            "Please select an image.",

            "warning"

        );

        return;

    }

    if(

        file.size >

        5 * 1024 * 1024

    ){

        showToast(

            "Image must be under 5 MB.",

            "warning"

        );

        return;

    }

    try{

        showToast(

            "Uploading profile photo...",

            "info"

        );

        profileImage.style.opacity =

            ".5";

        // =====================================
        // STORAGE PATH
        // =====================================

        const imageRef =

            ref(

                storage,

                `profile-images/${currentUser.uid}`

            );

        // =====================================
        // UPLOAD
        // =====================================

        await uploadBytes(

            imageRef,

            file

        );

        // =====================================
        // GET URL
        // =====================================

        const imageURL =

            await getDownloadURL(

                imageRef

            );

        // =====================================
        // SAVE TO FIRESTORE
        // =====================================

        await updateDoc(

            doc(

                db,

                "users",

                currentUser.uid

            ),

            {

                profileImage:

                    imageURL,

                updatedAt:

                    serverTimestamp()

            }

        );

        currentUserData.profileImage =

            imageURL;

        profileImage.src =

            imageURL;

        calculateProfileCompletion();

        showToast(

            "Profile photo updated."

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Image upload failed.",

            "danger"

        );

    }

    finally{

        profileImage.style.opacity =

            "1";

    }

}

// ======================================================
// ADDRESS MANAGEMENT
// ======================================================

let selectedAddressType = "home";

// ======================================================
// LOAD ADDRESSES
// ======================================================

function loadAddresses(){

    if(!currentUserData) return;

    const addresses =

        currentUserData.addresses || {};

    const home =
        document.getElementById("homeAddress");

    const work =
        document.getElementById("workAddress");

    const other =
        document.getElementById("otherAddress");

    if(home){

        home.textContent =

            addresses.home?.details ||

            "No address saved.";

    }

    if(work){

        work.textContent =

            addresses.work?.details ||

            "No address saved.";

    }

    if(other){

        other.textContent =

            addresses.other?.details ||

            "No address saved.";

    }

}

// ======================================================
// OPEN ADDRESS MODAL
// ======================================================

function openAddressModal(type="home"){

    selectedAddressType = type;

    const addresses =

        currentUserData.addresses || {};

    const current =

        addresses[type] || {};

    document.getElementById(

        "addressType"

    ).value = type;

    document.getElementById(

        "addressTitle"

    ).value =

        current.title ||

        type;

    document.getElementById(

        "addressDetails"

    ).value =

        current.details ||

        "";

    document.getElementById(

        "defaultAddress"

    ).checked =

        current.default ||

        false;

    const modal =

        new bootstrap.Modal(

            document.getElementById(

                "addressModal"

            )

        );

    modal.show();

}

// ======================================================
// SAVE ADDRESS
// ======================================================

async function saveAddress(){

    try{

        const type =

            document.getElementById(

                "addressType"

            ).value;

        const title =

            document.getElementById(

                "addressTitle"

            ).value.trim();

        const details =

            document.getElementById(

                "addressDetails"

            ).value.trim();

        const isDefault =

            document.getElementById(

                "defaultAddress"

            ).checked;

        if(details===""){

            showToast(

                "Address cannot be empty.",

                "warning"

            );

            return;

        }

        const addresses =

            currentUserData.addresses || {};

        if(isDefault){

            Object.keys(addresses).forEach(key=>{

                if(addresses[key]){

                    addresses[key].default = false;

                }

            });

        }

        addresses[type]={

            title,

            details,

            default:isDefault

        };

        await updateDoc(

            doc(

                db,

                "users",

                currentUser.uid

            ),

            {

                addresses,

                updatedAt:

                    serverTimestamp()

            }

        );

        currentUserData.addresses =

            addresses;

        loadAddresses();

        bootstrap.Modal.getInstance(

            document.getElementById(

                "addressModal"

            )

        ).hide();

        showToast(

            "Address saved successfully."

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Failed to save address.",

            "danger"

        );

    }

}

// ======================================================
// EDIT ADDRESS BUTTONS
// ======================================================

document.querySelectorAll(

    ".edit-address"

).forEach(button=>{

    button.addEventListener(

        "click",

        ()=>{

            openAddressModal(

                button.dataset.type

            );

        }

    );

});

// ======================================================
// DELETE ADDRESS
// ======================================================

document.querySelectorAll(

    ".delete-address"

).forEach(button=>{

    button.addEventListener(

        "click",

        async()=>{

            const type =

                button.dataset.type;

            if(

                !confirm(

                    "Delete this address?"

                )

            ) return;

            try{

                const addresses =

                    currentUserData.addresses || {};

                delete addresses[type];

                await updateDoc(

                    doc(

                        db,

                        "users",

                        currentUser.uid

                    ),

                    {

                        addresses,

                        updatedAt:

                            serverTimestamp()

                    }

                );

                currentUserData.addresses =

                    addresses;

                loadAddresses();

                showToast(

                    "Address deleted."

                );

            }

            catch(error){

                console.error(error);

                showToast(

                    "Unable to delete address.",

                    "danger"

                );

            }

        }

    );

});

// ======================================================
// LOAD RECENT ORDERS
// ======================================================

async function loadRecentOrders(){

    if(!currentUser) return;

    try{

        const ordersRef =

            collection(

                db,

                "orders"

            );

        const ordersQuery =

            query(

                ordersRef,

                where(

                    "customerId",

                    "==",

                    currentUser.uid

                ),

                orderBy(

                    "createdAt",

                    "desc"

                ),

                limit(5)

            );

        const snapshot =

            await getDocs(

                ordersQuery

            );

        let totalOrders = 0;

        let lastOrder = null;

        recentOrdersTable.innerHTML = "";

        if(snapshot.empty){

            recentOrdersTable.innerHTML =

            `

            <tr>

                <td colspan="4"

                class="text-center text-muted py-4">

                    No recent orders found.

                </td>

            </tr>

            `;

        }

        snapshot.forEach(docSnap=>{

            totalOrders++;

            const order =

                docSnap.data();

            if(!lastOrder){

                lastOrder = order;

            }

            const tr =

                document.createElement("tr");

            const created =

                order.createdAt

                ?

                order.createdAt

                .toDate()

                .toLocaleDateString(

                    "en-KE"

                )

                :

                "-";

            tr.innerHTML =

            `

            <td>

                #${docSnap.id.substring(0,8)}

                <br>

                <small class="text-muted">

                ${created}

                </small>

            </td>

            <td>

                ${order.supplierName || "-"}

            </td>

            <td>

                <span class="badge bg-success">

                    ${order.status || "Pending"}

                </span>

            </td>

            <td>

                KES ${Number(

                    order.totalPrice || 0

                ).toLocaleString("en-KE")}

            </td>

            `;

            recentOrdersTable.appendChild(

                tr

            );

        });

        // =====================================
        // SUMMARY
        // =====================================

        if(summaryOrders){

            summaryOrders.textContent =

                totalOrders;

        }

        // =====================================
        // LAST ORDER
        // =====================================

        if(

            lastOrder &&

            document.getElementById(

                "lastOrderDate"

            )

        ){

            document.getElementById(

                "lastOrderDate"

            ).textContent =

                lastOrder.createdAt

                ?

                lastOrder.createdAt

                .toDate()

                .toLocaleString(

                    "en-KE"

                )

                :

                "-";

        }

        // =====================================
        // ACCOUNT CREATED
        // =====================================

        if(

            document.getElementById(

                "accountCreated"

            )

        ){

            document.getElementById(

                "accountCreated"

            ).textContent =

                new Date(

                    currentUser.metadata.creationTime

                ).toLocaleDateString(

                    "en-KE"

                );

        }

        // =====================================
        // LAST LOGIN
        // =====================================

        if(

            document.getElementById(

                "activityLastLogin"

            )

        ){

            document.getElementById(

                "activityLastLogin"

            ).textContent =

                new Date(

                    currentUser.metadata.lastSignInTime

                ).toLocaleString(

                    "en-KE"

                );

        }

        // =====================================
        // PROFILE UPDATED
        // =====================================

        if(

            document.getElementById(

                "lastProfileUpdate"

            )

        ){

            if(

                currentUserData.updatedAt

            ){

                document.getElementById(

                    "lastProfileUpdate"

                ).textContent =

                    currentUserData.updatedAt

                    .toDate()

                    .toLocaleDateString(

                        "en-KE"

                    );

            }

            else{

                document.getElementById(

                    "lastProfileUpdate"

                ).textContent =

                    "Never";

            }

        }

        // =====================================
        // LOYALTY
        // =====================================

        if(

            document.getElementById(

                "activityPoints"

            )

        ){

            document.getElementById(

                "activityPoints"

            ).textContent =

                `${Number(

                    currentUserData.loyaltyPoints || 0

                ).toLocaleString()} Points`;

        }

    }

    catch(error){

        console.error(

            "Recent orders:",

            error

        );

        showToast(

            "Unable to load recent orders.",

            "danger"

        );

    }

}

// ======================================================
// LOAD USER PREFERENCES
// ======================================================

async function loadUserPreferences(){

    if(!currentUserData) return;

    const preferences =

        currentUserData.preferences || {};

    if(emailNotifications){

        emailNotifications.checked =

            preferences.emailNotifications ?? true;

    }

    if(smsNotifications){

        smsNotifications.checked =

            preferences.smsNotifications ?? true;

    }

    if(pushNotifications){

        pushNotifications.checked =

            preferences.pushNotifications ?? true;

    }

    if(promotionNotifications){

        promotionNotifications.checked =

            preferences.promotionNotifications ?? false;

    }

    if(priceAlerts){

        priceAlerts.checked =

            preferences.priceAlerts ?? true;

    }

    if(preferredLanguage){

        preferredLanguage.value =

            preferences.language || "English";

    }

    if(preferredCurrency){

        preferredCurrency.value =

            preferences.currency || "KES";

    }

    if(preferredGasSize){

        preferredGasSize.value =

            preferences.gasSize || "";

    }

    if(preferredDeliveryTime){

        preferredDeliveryTime.value =

            preferences.deliveryTime || "";

    }

    if(darkMode){

        darkMode.checked =

            preferences.darkMode ?? false;

    }

}

// ======================================================
// SAVE USER PREFERENCES
// ======================================================

async function savePreferences(){

    if(!currentUser) return;

    try{

        savePreferencesBtn.disabled = true;

        savePreferencesBtn.innerHTML =

            '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        const preferences = {

            emailNotifications:

                emailNotifications?.checked ?? true,

            smsNotifications:

                smsNotifications?.checked ?? true,

            pushNotifications:

                pushNotifications?.checked ?? true,

            promotionNotifications:

                promotionNotifications?.checked ?? false,

            priceAlerts:

                priceAlerts?.checked ?? true,

            language:

                preferredLanguage?.value || "English",

            currency:

                preferredCurrency?.value || "KES",

            gasSize:

                preferredGasSize?.value || "",

            deliveryTime:

                preferredDeliveryTime?.value || "",

            darkMode:

                darkMode?.checked ?? false

        };

        await updateDoc(

            doc(

                db,

                "users",

                currentUser.uid

            ),

            {

                preferences,

                updatedAt:

                    serverTimestamp()

            }

        );

        currentUserData.preferences =

            preferences;

        applyPreferences(preferences);

        showToast(

            "Preferences saved successfully."

        );

    }

    catch(error){

        console.error(

            "Preferences error:",

            error

        );

        showToast(

            "Unable to save preferences.",

            "danger"

        );

    }

    finally{

        savePreferencesBtn.disabled = false;

        savePreferencesBtn.innerHTML =

            '<i class="bi bi-check-circle"></i> Save Preferences';

    }

}

// ======================================================
// APPLY USER PREFERENCES
// ======================================================

function applyPreferences(preferences){

    if(!preferences) return;

    // =====================================
    // DARK MODE
    // =====================================

    if(preferences.darkMode){

        document.body.classList.add(

            "dark-mode"

        );

    }

    else{

        document.body.classList.remove(

            "dark-mode"

        );

    }

    // =====================================
    // LANGUAGE
    // Future translation support
    // =====================================

    document.documentElement.lang =

        preferences.language === "Swahili"

        ? "sw"

        : "en";

}

// ======================================================
// SECURITY
// ======================================================

import {

    sendPasswordResetEmail,

    linkWithPopup,

    GoogleAuthProvider

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

// ======================================================
// VERIFY EMAIL
// ======================================================

async function resendVerificationEmail(){

    if(!currentUser) return;

    try{

        if(currentUser.emailVerified){

            showToast(

                "Your email is already verified.",

                "info"

            );

            return;

        }

        await sendEmailVerification(currentUser);

        showToast(

            "Verification email sent successfully."

        );

    }

    catch(error){

        console.error(

            "Verification email error:",

            error

        );

        showToast(

            "Unable to send verification email.",

            "danger"

        );

    }

}

// ======================================================
// CHANGE PASSWORD
// ======================================================

async function changePassword(){

    if(!currentUser) return;

    try{

        await sendPasswordResetEmail(

            auth,

            currentUser.email

        );

        showToast(

            "Password reset email sent."

        );

    }

    catch(error){

        console.error(

            "Password reset error:",

            error

        );

        showToast(

            "Unable to send password reset email.",

            "danger"

        );

    }

}

// ======================================================
// LINK GOOGLE ACCOUNT
// ======================================================

// ======================================================
// LINK GOOGLE ACCOUNT
// ======================================================

async function linkGoogleAccount(){

    if(!currentUser) return;

    try{

        await linkWithPopup(

            currentUser,

            googleProvider

        );

        showToast(

            "Google account linked successfully."

        );

    }

    catch(error){

        console.error(

            "Google linking error:",

            error

        );

        showToast(

            "Unable to link Google account.",

            "danger"

        );

    }

}
// ======================================================
// ENABLE 2FA
// ======================================================

function enableTwoFactor(){

    showToast(

        "Two-factor authentication will be available in a future update.",

        "info"

    );

}

// ======================================================
// LOGOUT
// ======================================================

async function logout(){

    try{

        await signOut(auth);

        showToast(

            "Logged out successfully."

        );

        setTimeout(()=>{

            window.location.href =

                "login.html";

        },1000);

    }

    catch(error){

        console.error(

            "Logout error:",

            error

        );

        showToast(

            "Unable to logout.",

            "danger"

        );

    }

}

// ======================================================
// DOWNLOAD MY DATA
// ======================================================

function downloadMyData(){

    if(!currentUserData){

        showToast(

            "Nothing to download.",

            "warning"

        );

        return;

    }

    const data = {

        uid: currentUser.uid,

        email: currentUser.email,

        profile: currentUserData,

        exportedAt:

            new Date().toISOString()

    };

    const blob =

        new Blob(

            [

                JSON.stringify(

                    data,

                    null,

                    2

                )

            ],

            {

                type:

                "application/json"

            }

        );

    const url =

        URL.createObjectURL(blob);

    const a =

        document.createElement("a");

    a.href = url;

    a.download =

        "kenya-gas-profile.json";

    a.click();

    URL.revokeObjectURL(url);

    showToast(

        "Account data downloaded."

    );

}

// ======================================================
// DELETE ACCOUNT
// ======================================================

async function deleteMyAccount(){

    if(!currentUser) return;

    const confirmed =

        confirm(

            "Are you sure you want to permanently delete your account?"

        );

    if(!confirmed) return;

    try{

        await deleteUser(

            currentUser

        );

        showToast(

            "Account deleted."

        );

        setTimeout(()=>{

            window.location.href =

                "index.html";

        },1500);

    }

    catch(error){

        console.error(

            "Delete account error:",

            error

        );

        showToast(

            "For security, please sign in again before deleting your account.",

            "danger"

        );

    }

}

// ======================================================
// TOAST
// ======================================================

function showToast(

    message,

    type="success"

){

    if(

        !profileToast ||

        !toastMessage

    ){

        alert(message);

        return;

    }

    toastMessage.textContent =

        message;

    profileToast.classList.remove(

        "text-bg-success",

        "text-bg-danger",

        "text-bg-warning",

        "text-bg-info"

    );

    switch(type){

        case "danger":

            profileToast.classList.add(

                "text-bg-danger"

            );

            break;

        case "warning":

            profileToast.classList.add(

                "text-bg-warning"

            );

            break;

        case "info":

            profileToast.classList.add(

                "text-bg-info"

            );

            break;

        default:

            profileToast.classList.add(

                "text-bg-success"

            );

    }

    new bootstrap.Toast(

        profileToast

    ).show();

}

// ======================================================
// PAGE READY
// ======================================================

console.log(

    "Profile module loaded successfully."

);
