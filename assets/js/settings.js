// ======================================================
// Kenya Gas Marketplace
// settings.js
// Part 1
// Firebase Imports + Variables + DOM Elements
// ======================================================


// ======================================================
// FIREBASE IMPORTS
// ======================================================

import {

    auth,
    db,
    storage

} from "./firebase.js";


// AUTH

import {

    onAuthStateChanged,
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendEmailVerification,
    reload,
    GoogleAuthProvider,
    linkWithPopup,
    signOut,
    deleteUser

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


// FIRESTORE

import {

    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// STORAGE

import {

    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";



// ======================================================
// GLOBAL VARIABLES
// ======================================================


let currentUser = null;


let currentUserData = {};


// Google Provider

const googleProvider =

    new GoogleAuthProvider();



// ======================================================
// DOM ELEMENTS
// ======================================================


// ===============================
// NAVBAR
// ===============================


const navbarCustomerName =

    document.getElementById(
        "navbarCustomerName"
    );


const navbarProfileImage =

    document.getElementById(
        "navbarProfileImage"
    );



// ===============================
// ACCOUNT INFORMATION
// ===============================


const accountForm =

    document.getElementById(
        "accountForm"
    );


const firstName =

    document.getElementById(
        "firstName"
    );


const lastName =

    document.getElementById(
        "lastName"
    );


const email =

    document.getElementById(
        "email"
    );


const phone =

    document.getElementById(
        "phone"
    );


const county =

    document.getElementById(
        "county"
    );


const town =

    document.getElementById(
        "town"
    );


const address =

    document.getElementById(
        "address"
    );



// ===============================
// PROFILE PHOTO
// ===============================


const profilePhoto =

    document.getElementById(
        "profilePhoto"
    );


const profilePhotoPreview =

    document.getElementById(
        "profilePhotoPreview"
    );


const removePhotoBtn =

    document.getElementById(
        "removePhotoBtn"
    );



// ===============================
// PASSWORD
// ===============================


const passwordForm =

    document.getElementById(
        "passwordForm"
    );


const currentPassword =

    document.getElementById(
        "currentPassword"
    );


const newPassword =

    document.getElementById(
        "newPassword"
    );


const confirmPassword =

    document.getElementById(
        "confirmPassword"
    );


const passwordStrength =

    document.getElementById(
        "passwordStrength"
    );



// ===============================
// GOOGLE / VERIFICATION
// ===============================


const linkGoogleBtn =

    document.getElementById(
        "linkGoogleBtn"
    );


const verifyEmailBtn =

    document.getElementById(
        "verifyEmailBtn"
    );


const verifyPhoneBtn =

    document.getElementById(
        "verifyPhoneBtn"
    );



// ===============================
// NOTIFICATION SETTINGS
// ===============================


const emailNotification =

    document.getElementById(
        "emailNotification"
    );


const smsNotification =

    document.getElementById(
        "smsNotification"
    );


const orderNotification =

    document.getElementById(
        "orderNotification"
    );


const deliveryNotification =

    document.getElementById(
        "deliveryNotification"
    );


const marketingNotification =

    document.getElementById(
        "marketingNotification"
    );



// ===============================
// PREFERENCES
// ===============================


const themePreference =

    document.getElementById(
        "themePreference"
    );


const languagePreference =

    document.getElementById(
        "languagePreference"
    );


const defaultLocation =

    document.getElementById(
        "defaultLocation"
    );



// ===============================
// PRIVACY
// ===============================


const profileVisibility =

    document.getElementById(
        "profileVisibility"
    );


const dataSharing =

    document.getElementById(
        "dataSharing"
    );



// ===============================
// ACTION BUTTONS
// ===============================


const saveAccountBtn =

    document.getElementById(
        "saveAccountBtn"
    );


const saveSettingsBtn =

    document.getElementById(
        "saveSettingsBtn"
    );


const changePasswordBtn =

    document.getElementById(
        "changePasswordBtn"
    );


const downloadDataBtn =

    document.getElementById(
        "downloadDataBtn"
    );


const resetSettingsBtn =

    document.getElementById(
        "resetSettingsBtn"
    );


const logoutBtn =

    document.getElementById(
        "logoutBtn"
    );


const logoutEverywhereBtn =

    document.getElementById(
        "logoutEverywhereBtn"
    );


const confirmDeleteAccountBtn =

    document.getElementById(
        "confirmDeleteAccountBtn"
    );



// ===============================
// TOAST
// ===============================


const settingsToast =

    document.getElementById(
        "settingsToast"
    );


const toastMessage =

    document.getElementById(
        "toastMessage"
    );



// ===============================
// LOADING
// ===============================


const loadingOverlay =

    document.getElementById(
        "loadingOverlay"
    );



// ======================================================
// PART 1 END
// ======================================================

// ======================================================
// PART 2
// LOAD USER PROFILE FROM FIRESTORE
// ======================================================



// ======================================================
// AUTH STATE LISTENER
// ======================================================


onAuthStateChanged(

    auth,

    async(user)=>{


        if(!user){


            window.location.href =
                "login.html";


            return;


        }



        currentUser = user;



        await loadUserProfile();



    }

);





// ======================================================
// LOAD USER PROFILE FUNCTION
// ======================================================


async function loadUserProfile(){


    if(!currentUser) return;



    showLoading(true);



    try{


        const userRef =

            doc(

                db,

                "users",

                currentUser.uid

            );



        const userSnap =

            await getDoc(

                userRef

            );




        if(!userSnap.exists()){


            showToast(

                "User profile not found.",

                "danger"

            );


            return;


        }




        currentUserData =

            userSnap.data();





        // ==================================================
        // NAVBAR USER NAME
        // ==================================================


        const fullName =


            `${

                currentUserData.firstName || ""

            }

            ${

                currentUserData.lastName || ""

            }`.trim();





        if(navbarCustomerName){


            navbarCustomerName.textContent =


                fullName ||


                currentUser.displayName ||


                "Customer";


        }






        // ==================================================
        // PROFILE PHOTO
        // ==================================================


        const photoURL =


            currentUserData.photoURL ||


            currentUser.photoURL ||


            "assets/images/default-user.png";





        if(profilePhotoPreview){


            profilePhotoPreview.src =

                photoURL;


        }





        if(navbarProfileImage){


            navbarProfileImage.src =

                photoURL;


        }







        // ==================================================
        // ACCOUNT INFORMATION
        // ==================================================


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

                currentUser.email || "";


        }





        if(phone){


            phone.value =

                currentUserData.phone || "";


        }





        if(address){


            address.value =

                currentUserData.address || "";


        }







        // ==================================================
        // COUNTY AND TOWN
        // ==================================================


        if(

            county &&

            currentUserData.county

        ){


            county.value =

                currentUserData.county;



            county.dispatchEvent(

                new Event("change")

            );


        }







        setTimeout(()=>{


            if(

                town &&

                currentUserData.town

            ){


                town.value =

                    currentUserData.town;


            }



        },300);








        // ==================================================
        // EMAIL VERIFICATION STATUS
        // ==================================================


        const accountStatus =


            document.getElementById(

                "accountStatus"

            );




        if(accountStatus){


            accountStatus.value =


                currentUser.emailVerified


                ?


                "Verified"


                :


                "Email Not Verified";



        }






        // ==================================================
        // DATE JOINED
        // ==================================================


        const dateJoined =


            document.getElementById(

                "dateJoined"

            );




        if(

            dateJoined &&

            currentUser.metadata.creationTime

        ){



            dateJoined.value =


                new Date(


                    currentUser.metadata.creationTime


                )


                .toLocaleDateString(

                    "en-KE"

                );



        }





        console.log(

            "User profile loaded successfully."

        );



    }

    catch(error){


        console.error(

            "Profile loading error:",

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
// PART 2 END
// ======================================================

// ======================================================
// PART 3
// SAVE ACCOUNT INFORMATION
// UPLOAD PROFILE PHOTO
// ======================================================



// ======================================================
// SAVE ACCOUNT INFORMATION
// ======================================================


async function saveAccountInformation(){


    if(!currentUser) return;



    showLoading(true);



    try{


        const first =

            firstName.value.trim();



        const last =

            lastName.value.trim();




        if(first === "" || last === ""){


            showToast(

                "First name and last name are required.",

                "warning"

            );


            return;


        }






        await updateDoc(

            doc(

                db,

                "users",

                currentUser.uid

            ),

            {


                firstName:first,


                lastName:last,


                phone:

                    phone.value.trim(),



                county:

                    county.value,



                town:

                    town.value,



                address:

                    address.value.trim(),



                updatedAt:

                    serverTimestamp()



            }

        );







        await updateProfile(

            currentUser,

            {


                displayName:

                    `${first} ${last}`



            }

        );







        // Update local data

        currentUserData.firstName = first;

        currentUserData.lastName = last;

        currentUserData.phone = phone.value.trim();

        currentUserData.county = county.value;

        currentUserData.town = town.value;

        currentUserData.address = address.value.trim();







        if(navbarCustomerName){


            navbarCustomerName.textContent =


                `${first} ${last}`;


        }







        showToast(

            "Account information updated successfully."

        );



    }

    catch(error){


        console.error(error);



        showToast(

            "Unable to update account.",

            "danger"

        );



    }

    finally{


        showLoading(false);


    }



}







// ======================================================
// ACCOUNT FORM SUBMIT
// ======================================================


if(accountForm){



    accountForm.addEventListener(


        "submit",


        (event)=>{


            event.preventDefault();



            saveAccountInformation();



        }


    );



}








// ======================================================
// PROFILE PHOTO PREVIEW
// ======================================================


if(profilePhoto){



    profilePhoto.addEventListener(


        "change",


        (event)=>{


            const file =

                event.target.files[0];



            if(!file) return;




            profilePhotoPreview.src =


                URL.createObjectURL(file);





            uploadProfilePhoto(file);



        }


    );



}







// ======================================================
// UPLOAD PROFILE PHOTO
// ======================================================


async function uploadProfilePhoto(file){



    if(!currentUser) return;



    showLoading(true);



    try{



        const imageRef =


            ref(

                storage,

                `profilePhotos/${currentUser.uid}`

            );





        await uploadBytes(

            imageRef,

            file

        );







        const photoURL =


            await getDownloadURL(

                imageRef

            );







        await updateDoc(

            doc(

                db,

                "users",

                currentUser.uid

            ),

            {


                photoURL:photoURL,


                updatedAt:

                    serverTimestamp()



            }

        );







        await updateProfile(

            currentUser,

            {


                photoURL:photoURL



            }

        );







        currentUserData.photoURL = photoURL;






        if(profilePhotoPreview){


            profilePhotoPreview.src = photoURL;


        }





        if(navbarProfileImage){


            navbarProfileImage.src = photoURL;


        }






        showToast(

            "Profile photo uploaded successfully."

        );



    }

    catch(error){



        console.error(error);



        showToast(

            "Photo upload failed.",

            "danger"

        );



    }

    finally{


        showLoading(false);


    }



}








// ======================================================
// REMOVE PROFILE PHOTO
// ======================================================


if(removePhotoBtn){



    removePhotoBtn.addEventListener(


        "click",


        async()=>{



            if(!currentUser) return;





            const confirmRemove =


                confirm(

                    "Remove profile photo?"

                );





            if(!confirmRemove) return;






            showLoading(true);





            try{



                const imageRef =


                    ref(

                        storage,

                        `profilePhotos/${currentUser.uid}`

                    );





                try{


                    await deleteObject(

                        imageRef

                    );


                }

                catch(error){


                    console.log(

                        "No stored image found."

                    );


                }







                await updateDoc(

                    doc(

                        db,

                        "users",

                        currentUser.uid

                    ),

                    {


                        photoURL:"",


                        updatedAt:

                            serverTimestamp()



                    }

                );







                await updateProfile(

                    currentUser,

                    {


                        photoURL:null



                    }

                );







                const defaultImage =


                    "assets/images/default-user.png";






                if(profilePhotoPreview){


                    profilePhotoPreview.src = defaultImage;


                }





                if(navbarProfileImage){


                    navbarProfileImage.src = defaultImage;


                }






                showToast(

                    "Profile photo removed."

                );



            }

            catch(error){


                console.error(error);



                showToast(

                    "Unable to remove photo.",

                    "danger"

                );


            }

            finally{


                showLoading(false);


            }



        }


    );



}



// ======================================================
// PART 3 END
// ======================================================

// ======================================================
// PART 4
// CHANGE PASSWORD + PASSWORD STRENGTH
// ======================================================



// ======================================================
// PASSWORD STRENGTH CHECKER
// ======================================================


function checkPasswordStrength(password){


    let score = 0;



    if(password.length >= 8)

        score++;




    if(/[A-Z]/.test(password))

        score++;




    if(/[a-z]/.test(password))

        score++;




    if(/[0-9]/.test(password))

        score++;




    if(/[^A-Za-z0-9]/.test(password))

        score++;







    if(!passwordStrength)

        return;







    switch(score){



        case 0:

        case 1:



            passwordStrength.style.width = "20%";

            passwordStrength.className =

                "progress-bar bg-danger";


            passwordStrength.textContent =

                "Very Weak";


            break;







        case 2:



            passwordStrength.style.width = "40%";


            passwordStrength.className =

                "progress-bar bg-warning";


            passwordStrength.textContent =

                "Weak";


            break;







        case 3:



            passwordStrength.style.width = "60%";


            passwordStrength.className =

                "progress-bar bg-info";


            passwordStrength.textContent =

                "Fair";


            break;







        case 4:



            passwordStrength.style.width = "80%";


            passwordStrength.className =

                "progress-bar bg-primary";


            passwordStrength.textContent =

                "Strong";


            break;







        case 5:



            passwordStrength.style.width = "100%";


            passwordStrength.className =

                "progress-bar bg-success";


            passwordStrength.textContent =

                "Very Strong";


            break;


    }



}







// Listen for typing


if(newPassword){


    newPassword.addEventListener(

        "input",

        ()=>{


            checkPasswordStrength(

                newPassword.value

            );


        }

    );


}








// ======================================================
// SHOW / HIDE PASSWORD
// ======================================================


document.querySelectorAll(

    ".toggle-password"

).forEach(button=>{



    button.addEventListener(

        "click",

        ()=>{



            const target =


                document.getElementById(

                    button.dataset.target

                );





            if(!target)

                return;







            if(target.type === "password"){



                target.type = "text";



                button.innerHTML =


                    '<i class="bi bi-eye-slash"></i>';



            }

            else{



                target.type = "password";



                button.innerHTML =


                    '<i class="bi bi-eye"></i>';



            }



        }


    );


});








// ======================================================
// CHANGE PASSWORD FUNCTION
// ======================================================


async function changePassword(){



    if(!currentUser)

        return;






    const oldPassword =


        currentPassword.value.trim();





    const newPass =


        newPassword.value.trim();





    const confirmPass =


        confirmPassword.value.trim();








    if(oldPassword === ""){



        showToast(

            "Enter your current password.",

            "warning"

        );


        return;


    }








    if(newPass.length < 8){



        showToast(

            "New password must contain at least 8 characters.",

            "warning"

        );


        return;


    }








    if(newPass !== confirmPass){



        showToast(

            "Passwords do not match.",

            "warning"

        );


        return;


    }








    showLoading(true);







    try{



        const credential =



            EmailAuthProvider.credential(



                currentUser.email,

                oldPassword



            );








        // Re-authenticate user


        await reauthenticateWithCredential(



            currentUser,

            credential



        );








        // Update password


        await updatePassword(



            currentUser,

            newPass



        );








        passwordForm.reset();





        if(passwordStrength){



            passwordStrength.style.width = "0%";



            passwordStrength.textContent = "";



            passwordStrength.className =

                "progress-bar";


        }







        showToast(

            "Password changed successfully."

        );



    }

    catch(error){



        console.error(error);





        let message =

            "Unable to change password.";








        if(

            error.code ===

            "auth/wrong-password"

        ){



            message =

                "Current password is incorrect.";


        }







        else if(

            error.code ===

            "auth/too-many-requests"

        ){



            message =

                "Too many attempts. Try again later.";


        }







        else if(

            error.code ===

            "auth/requires-recent-login"

        ){



            message =

                "Please login again before changing password.";


        }








        showToast(

            message,

            "danger"

        );



    }

    finally{



        showLoading(false);



    }



}








// ======================================================
// PASSWORD FORM SUBMIT
// ======================================================


if(passwordForm){



    passwordForm.addEventListener(



        "submit",



        (event)=>{



            event.preventDefault();



            changePassword();



        }



    );



}



// ======================================================
// PART 4 END
// ======================================================

// ======================================================
// PART 5
// GOOGLE LINKING + EMAIL VERIFICATION
// ======================================================



// ======================================================
// LINK GOOGLE ACCOUNT
// ======================================================


if(linkGoogleBtn){



    linkGoogleBtn.addEventListener(



        "click",



        async()=>{



            if(!currentUser){


                showToast(

                    "Please login first.",

                    "warning"

                );


                return;


            }





            showLoading(true);





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



                console.error(error);







                let message =

                    "Unable to link Google account.";








                if(

                    error.code ===

                    "auth/provider-already-linked"

                ){



                    message =

                        "Google account is already linked.";


                }








                else if(

                    error.code ===

                    "auth/popup-blocked"

                ){



                    message =

                        "Popup blocked. Allow popups and try again.";


                }








                else if(

                    error.code ===

                    "auth/credential-already-in-use"

                ){



                    message =

                        "This Google account is already connected to another user.";


                }







                showToast(

                    message,

                    "danger"

                );



            }

            finally{



                showLoading(false);



            }



        }


    );



}








// ======================================================
// SEND EMAIL VERIFICATION
// ======================================================


if(verifyEmailBtn){



    verifyEmailBtn.addEventListener(



        "click",



        async()=>{



            if(!currentUser)

                return;







            if(currentUser.emailVerified){



                showToast(

                    "Email is already verified."

                );


                return;


            }







            showLoading(true);







            try{



                await sendEmailVerification(



                    currentUser



                );







                showToast(

                    "Verification email sent. Check your inbox."

                );







            }

            catch(error){



                console.error(error);





                showToast(



                    error.message,

                    "danger"



                );


            }

            finally{



                showLoading(false);



            }



        }


    );



}








// ======================================================
// REFRESH EMAIL VERIFICATION STATUS
// ======================================================



async function refreshEmailVerification(){



    if(!currentUser)

        return;





    await reload(

        currentUser

    );





    updateEmailStatus();



}








// ======================================================
// UPDATE EMAIL STATUS DISPLAY
// ======================================================


function updateEmailStatus(){



    const emailStatus =



        document.getElementById(

            "emailStatus"

        );





    if(!emailStatus || !currentUser)

        return;







    if(currentUser.emailVerified){



        emailStatus.innerHTML =

            `

            <span class="text-success">

            <i class="bi bi-check-circle"></i>

            Email Verified

            </span>

            `;



    }

    else{



        emailStatus.innerHTML =

            `

            <span class="text-danger">

            <i class="bi bi-x-circle"></i>

            Email Not Verified

            </span>

            `;



    }



}








// ======================================================
// PHONE VERIFICATION PLACEHOLDER
// ======================================================


if(verifyPhoneBtn){



    verifyPhoneBtn.addEventListener(



        "click",



        ()=>{



            showToast(

                "Phone verification will be added using Firebase Phone Authentication."

            );



        }


    );



}








// ======================================================
// INITIAL EMAIL STATUS CHECK
// ======================================================


if(currentUser){



    updateEmailStatus();



}



// ======================================================
// PART 5 END
// ======================================================

// ======================================================
// PART 6
// NOTIFICATION SETTINGS
// ======================================================



// ======================================================
// DEFAULT NOTIFICATION SETTINGS
// ======================================================


const defaultNotifications = {


    email: true,


    sms: false,


    orders: true,


    delivery: true,


    marketing: false


};








// ======================================================
// LOAD NOTIFICATION SETTINGS
// ======================================================


async function loadNotificationSettings(){



    if(!currentUser)

        return;







    try{



        const notificationRef =



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "notifications"



            );








        const notificationSnap =



            await getDoc(



                notificationRef



            );








        let notifications =



            defaultNotifications;








        if(notificationSnap.exists()){



            notifications =



                notificationSnap.data();



        }









        if(emailNotification){



            emailNotification.checked =



                notifications.email;



        }







        if(smsNotification){



            smsNotification.checked =



                notifications.sms;



        }








        if(orderNotification){



            orderNotification.checked =



                notifications.orders;



        }








        if(deliveryNotification){



            deliveryNotification.checked =



                notifications.delivery;



        }








        if(marketingNotification){



            marketingNotification.checked =



                notifications.marketing;



        }








    }

    catch(error){



        console.error(

            "Notification loading error:",

            error

        );





        showToast(

            "Unable to load notification settings.",

            "danger"

        );



    }



}








// ======================================================
// SAVE NOTIFICATION SETTINGS
// ======================================================


async function saveNotificationSettings(){



    if(!currentUser)

        return;







    showLoading(true);







    try{





        const notifications = {



            email:

                emailNotification?.checked || false,





            sms:

                smsNotification?.checked || false,





            orders:

                orderNotification?.checked || false,





            delivery:

                deliveryNotification?.checked || false,





            marketing:

                marketingNotification?.checked || false,





            updatedAt:

                serverTimestamp()



        };








        await setDoc(



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "notifications"



            ),



            notifications,



            {

                merge:true

            }



        );








        showToast(

            "Notification settings saved successfully."

        );





    }

    catch(error){



        console.error(error);





        showToast(

            "Unable to save notification settings.",

            "danger"

        );



    }

    finally{



        showLoading(false);



    }



}








// ======================================================
// SAVE SETTINGS BUTTON
// ======================================================


if(saveSettingsBtn){



    saveSettingsBtn.addEventListener(



        "click",



        ()=>{



            saveNotificationSettings();



        }


    );



}








// ======================================================
// PART 6 END
// ======================================================

// ======================================================
// PART 7
// PREFERENCES & PRIVACY SETTINGS
// ======================================================



// ======================================================
// DEFAULT PREFERENCES
// ======================================================


const defaultPreferences = {


    theme: "light",


    language: "English",


    defaultLocation: ""

};





// ======================================================
// DEFAULT PRIVACY SETTINGS
// ======================================================


const defaultPrivacy = {


    profileVisible: true,


    dataSharing: false


};








// ======================================================
// LOAD PREFERENCE SETTINGS
// ======================================================


async function loadPreferenceSettings(){



    if(!currentUser)

        return;







    try{



        const preferenceRef =



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "preferences"



            );







        const preferenceSnap =



            await getDoc(

                preferenceRef

            );








        let preferences =



            defaultPreferences;








        if(preferenceSnap.exists()){



            preferences =



                preferenceSnap.data();



        }








        if(themePreference){



            themePreference.value =



                preferences.theme;



        }








        if(languagePreference){



            languagePreference.value =



                preferences.language;



        }








        if(defaultLocation){



            defaultLocation.value =



                preferences.defaultLocation;



        }







    }

    catch(error){



        console.error(

            "Preference loading error:",

            error

        );



        showToast(

            "Unable to load preferences.",

            "danger"

        );



    }



}








// ======================================================
// SAVE PREFERENCE SETTINGS
// ======================================================


async function savePreferenceSettings(){



    if(!currentUser)

        return;







    try{



        const preferences = {



            theme:

                themePreference?.value || "light",





            language:

                languagePreference?.value || "English",





            defaultLocation:

                defaultLocation?.value || "",





            updatedAt:

                serverTimestamp()



        };








        await setDoc(



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "preferences"



            ),



            preferences,



            {

                merge:true

            }



        );








        applyTheme(

            preferences.theme

        );








        showToast(

            "Preferences saved successfully."

        );



    }

    catch(error){



        console.error(error);





        showToast(

            "Unable to save preferences.",

            "danger"

        );



    }



}








// ======================================================
// LOAD PRIVACY SETTINGS
// ======================================================


async function loadPrivacySettings(){



    if(!currentUser)

        return;







    try{



        const privacyRef =



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "privacy"



            );







        const privacySnap =



            await getDoc(

                privacyRef

            );








        let privacy =



            defaultPrivacy;








        if(privacySnap.exists()){



            privacy =



                privacySnap.data();



        }








        if(profileVisibility){



            profileVisibility.checked =



                privacy.profileVisible;



        }








        if(dataSharing){



            dataSharing.checked =



                privacy.dataSharing;



        }







    }

    catch(error){



        console.error(

            "Privacy loading error:",

            error

        );



        showToast(

            "Unable to load privacy settings.",

            "danger"

        );



    }



}








// ======================================================
// SAVE PRIVACY SETTINGS
// ======================================================


async function savePrivacySettings(){



    if(!currentUser)

        return;







    try{



        const privacy = {



            profileVisible:

                profileVisibility?.checked || false,





            dataSharing:

                dataSharing?.checked || false,





            updatedAt:

                serverTimestamp()



        };








        await setDoc(



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "privacy"



            ),



            privacy,



            {

                merge:true

            }



        );








        showToast(

            "Privacy settings saved."

        );



    }

    catch(error){



        console.error(error);





        showToast(

            "Unable to save privacy settings.",

            "danger"

        );



    }



}








// ======================================================
// APPLY THEME
// ======================================================


function applyTheme(theme){



    if(theme === "dark"){



        document.body.classList.add(

            "dark-mode"

        );



    }

    else{



        document.body.classList.remove(

            "dark-mode"

        );



    }



}








// ======================================================
// SAVE SETTINGS BUTTON
// ======================================================


if(saveSettingsBtn){



    saveSettingsBtn.addEventListener(



        "click",



        async()=>{



            await savePreferenceSettings();



            await savePrivacySettings();



        }



    );



}








// ======================================================
// PART 7 END
// ======================================================


// ======================================================
// PART 8
// DOWNLOAD DATA
// RESET SETTINGS
// LOGOUT
// ======================================================



// ======================================================
// DOWNLOAD USER DATA
// ======================================================


async function downloadUserData(){



    if(!currentUser)

        return;







    showLoading(true);







    try{



        const userRef =



            doc(



                db,

                "users",

                currentUser.uid



            );







        const userSnap =



            await getDoc(

                userRef

            );







        if(!userSnap.exists()){



            showToast(

                "No user data found.",

                "warning"

            );


            return;


        }







        const userData = {



            account:

                userSnap.data(),





            email:

                currentUser.email,





            uid:

                currentUser.uid,





            exportDate:

                new Date()

                .toISOString()



        };







        const jsonData =



            JSON.stringify(

                userData,

                null,

                2

            );








        const blob =



            new Blob(

                [jsonData],

                {

                    type:

                    "application/json"

                }

            );








        const url =



            URL.createObjectURL(

                blob

            );







        const link =



            document.createElement(

                "a"

            );







        link.href = url;





        link.download =

            "kenya-gas-user-data.json";







        document.body.appendChild(

            link

        );







        link.click();







        document.body.removeChild(

            link

        );







        URL.revokeObjectURL(

            url

        );







        showToast(

            "Your data has been downloaded."

        );





    }

    catch(error){



        console.error(error);





        showToast(

            "Unable to download data.",

            "danger"

        );



    }

    finally{



        showLoading(false);



    }



}








// ======================================================
// DOWNLOAD BUTTON
// ======================================================


if(downloadDataBtn){



    downloadDataBtn.addEventListener(



        "click",



        ()=>{



            downloadUserData();



        }


    );



}








// ======================================================
// RESET SETTINGS
// ======================================================


async function resetSettings(){



    if(!currentUser)

        return;







    const confirmReset =



        confirm(

            "Reset all settings to default?"

        );







    if(!confirmReset)

        return;







    showLoading(true);







    try{



        await setDoc(



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "notifications"



            ),



            defaultNotifications



        );








        await setDoc(



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "preferences"



            ),



            defaultPreferences



        );








        await setDoc(



            doc(



                db,

                "users",

                currentUser.uid,

                "settings",

                "privacy"



            ),



            defaultPrivacy



        );








        loadNotificationSettings();



        loadPreferenceSettings();



        loadPrivacySettings();








        showToast(

            "Settings reset successfully."

        );



    }

    catch(error){



        console.error(error);





        showToast(

            "Unable to reset settings.",

            "danger"

        );



    }

    finally{



        showLoading(false);



    }



}








// ======================================================
// RESET BUTTON
// ======================================================


if(resetSettingsBtn){



    resetSettingsBtn.addEventListener(



        "click",



        ()=>{



            resetSettings();



        }


    );



}








// ======================================================
// LOGOUT CURRENT DEVICE
// ======================================================


async function logoutUser(){



    try{



        await signOut(

            auth

        );







        localStorage.clear();





        sessionStorage.clear();







        window.location.href =

            "login.html";



    }

    catch(error){



        console.error(error);





        showToast(

            "Logout failed.",

            "danger"

        );



    }



}








// ======================================================
// LOGOUT BUTTONS
// ======================================================


if(logoutBtn){



    logoutBtn.addEventListener(



        "click",



        ()=>{


            logoutUser();



        }


    );



}







if(logoutAccountBtn){



    logoutAccountBtn.addEventListener(



        "click",



        ()=>{


            logoutUser();



        }


    );



}








// ======================================================
// LOGOUT EVERYWHERE PLACEHOLDER
// ======================================================


async function logoutEverywhere(){



    if(!currentUser)

        return;







    try{



        await signOut(

            auth

        );







        localStorage.clear();



        sessionStorage.clear();







        showToast(

            "All sessions signed out."

        );







        setTimeout(()=>{



            window.location.href =

                "login.html";



        },1000);





    }

    catch(error){



        console.error(error);





        showToast(

            "Unable to logout sessions.",

            "danger"

        );



    }



}








if(logoutEverywhereBtn){



    logoutEverywhereBtn.addEventListener(



        "click",



        ()=>{



            logoutEverywhere();



        }


    );



}








// ======================================================
// PART 8 END
// ======================================================

// ======================================================
// PART 9
// DELETE ACCOUNT + HELPER FUNCTIONS
// ======================================================



// ======================================================
// DELETE USER ACCOUNT
// ======================================================


async function deleteAccount(){



    if(!currentUser)

        return;







    const confirmDelete =



        confirm(

            "This will permanently delete your account. Continue?"

        );







    if(!confirmDelete)

        return;







    showLoading(true);







    try{



        // ==========================================
        // DELETE PROFILE PHOTO
        // ==========================================


        try{



            const imageRef =



                ref(



                    storage,

                    `profilePhotos/${currentUser.uid}`



                );







            await deleteObject(

                imageRef

            );



        }

        catch(error){



            console.log(

                "No profile image found."

            );



        }







        // ==========================================
        // DELETE FIRESTORE DATA
        // ==========================================


        await deleteDoc(



            doc(



                db,

                "users",

                currentUser.uid



            )



        );








        // ==========================================
        // DELETE AUTH ACCOUNT
        // ==========================================


        await deleteUser(

            currentUser

        );








        localStorage.clear();



        sessionStorage.clear();








        showToast(

            "Account deleted successfully."

        );







        setTimeout(()=>{



            window.location.href =

                "register.html";



        },1500);





    }

    catch(error){



        console.error(

            "Delete account error:",

            error

        );







        if(

            error.code ===

            "auth/requires-recent-login"

        ){



            showToast(

                "Please login again before deleting your account.",

                "warning"

            );



        }

        else{



            showToast(

                error.message,

                "danger"

            );



        }



    }

    finally{



        showLoading(false);



    }



}








// ======================================================
// DELETE BUTTON
// ======================================================


if(confirmDeleteAccountBtn){



    confirmDeleteAccountBtn.addEventListener(



        "click",



        ()=>{



            deleteAccount();



        }


    );



}








// ======================================================
// SHOW LOADING
// ======================================================


function showLoading(status){



    if(!loadingOverlay)

        return;







    if(status){



        loadingOverlay.classList.add(

            "active"

        );



    }

    else{



        loadingOverlay.classList.remove(

            "active"

        );



    }



}








// ======================================================
// SHOW TOAST MESSAGE
// ======================================================


function showToast(

    message,

    type="success"

){



    if(!settingsToast || !toastMessage){



        alert(message);



        return;



    }







    toastMessage.textContent =

        message;







    settingsToast.className =



        `toast ${type} show`;








    setTimeout(()=>{



        settingsToast.className =

            "toast";



    },3000);



}








// ======================================================
// FORMAT DATE HELPER
// ======================================================


function formatDate(timestamp){



    if(!timestamp)

        return "";







    if(timestamp.toDate){



        return timestamp

            .toDate()

            .toLocaleDateString(

                "en-KE"

            );



    }







    return new Date(timestamp)

        .toLocaleDateString(

            "en-KE"

        );



}








// ======================================================
// VALIDATE EMAIL
// ======================================================


function validateEmail(emailAddress){



    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(

            emailAddress

        );



}








// ======================================================
// CLEAN TEXT INPUT
// ======================================================


function cleanInput(value){



    return value

        .trim()

        .replace(

            /[<>]/g,

            ""

        );



}








// ======================================================
// PART 9 END
// ======================================================

// ======================================================
// PART 10
// EVENT LISTENERS + INITIALIZATION
// ======================================================



// ======================================================
// PAGE INITIALIZATION
// ======================================================


async function initializeSettingsPage(){



    try{



        showLoading(true);







        if(!currentUser){



            console.log(

                "Waiting for authentication..."

            );


            return;


        }








        await loadUserProfile();



        await loadNotificationSettings();



        await loadPreferenceSettings();



        await loadPrivacySettings();








        updateEmailStatus();








        console.log(

            "Settings initialized successfully."

        );



    }

    catch(error){



        console.error(

            "Initialization error:",

            error

        );





        showToast(

            "Unable to initialize settings.",

            "danger"

        );



    }

    finally{



        showLoading(false);



    }



}








// ======================================================
// AUTH INITIALIZATION
// ======================================================


onAuthStateChanged(



    auth,



    async(user)=>{



        if(!user){



            window.location.href =

                "login.html";



            return;



        }







        currentUser = user;








        await initializeSettingsPage();



    }



);








// ======================================================
// SAVE ACCOUNT BUTTON
// ======================================================


if(saveAccountBtn){



    saveAccountBtn.addEventListener(



        "click",



        ()=>{



            saveAccountInformation();



        }



    );



}








// ======================================================
// CHANGE PASSWORD BUTTON
// ======================================================


if(changePasswordBtn){



    changePasswordBtn.addEventListener(



        "click",



        ()=>{



            changePassword();



        }



    );



}








// ======================================================
// EMAIL VERIFICATION REFRESH BUTTON
// ======================================================


const refreshEmailBtn =



    document.getElementById(

        "refreshEmailBtn"

    );






if(refreshEmailBtn){



    refreshEmailBtn.addEventListener(



        "click",



        async()=>{



            await reload(

                currentUser

            );







            updateEmailStatus();







            showToast(

                "Email status updated."

            );



        }



    );



}








// ======================================================
// PROFILE PHOTO PREVIEW CLEANUP
// ======================================================


window.addEventListener(



    "beforeunload",



    ()=>{



        if(profilePhotoPreview){



            URL.revokeObjectURL(

                profilePhotoPreview.src

            );



        }



    }



);








// ======================================================
// PASSWORD TOGGLE INITIALIZATION
// ======================================================


function initializePasswordToggles(){



    document

    .querySelectorAll(

        ".toggle-password"

    )

    .forEach(button=>{



        button.addEventListener(



            "click",



            ()=>{



                const input =



                    document.getElementById(

                        button.dataset.target

                    );







                if(!input)

                    return;







                if(input.type === "password"){



                    input.type =

                        "text";



                    button.innerHTML =



                    '<i class="bi bi-eye-slash"></i>';



                }

                else{



                    input.type =

                        "password";



                    button.innerHTML =



                    '<i class="bi bi-eye"></i>';



                }



            }



        );



    });



}








// ======================================================
// DOM READY
// ======================================================


document.addEventListener(



    "DOMContentLoaded",



    ()=>{



        initializePasswordToggles();



        console.log(

            "DOM ready."

        );



    }



);








// ======================================================
// FINAL STARTUP MESSAGE
// ======================================================


console.log(

    "Kenya Gas Marketplace Settings.js loaded successfully."

);



// ======================================================
// PART 10 END
// ======================================================
