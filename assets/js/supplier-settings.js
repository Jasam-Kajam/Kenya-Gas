// ==========================================
// Kenya Gas Marketplace
// Supplier Settings
// assets/js/supplier-settings.js
// ==========================================


import {

    auth,
    db

} from "./firebase.js";


import {

    onAuthStateChanged,
    updatePassword,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {

    doc,
    getDoc,
    setDoc,
    deleteDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";





let currentSupplier = null;






// Elements


const accountForm =
document.getElementById(
"accountSettingsForm"
);



const passwordForm =
document.getElementById(
"passwordForm"
);



const deleteBtn =
document.getElementById(
"deleteAccountBtn"
);








// ==========================================
// Check Supplier Login
// ==========================================


onAuthStateChanged(
auth,
async(user)=>{


if(user){


currentSupplier = user;


loadSupplierSettings();



}

else{


window.location.href =
"login.html";


}


});









// ==========================================
// Load Supplier Data
// ==========================================


async function loadSupplierSettings(){


try{


const supplierRef =
doc(
db,
"suppliers",
currentSupplier.uid
);



const supplierSnap =
await getDoc(
supplierRef
);




document.getElementById(
"supplierEmail"
).value =
currentSupplier.email;





if(supplierSnap.exists()){


const data =
supplierSnap.data();



document.getElementById(
"supplierName"
).value =
data.name || "";



document.getElementById(
"supplierPhone"
).value =
data.phone || "";



document.getElementById(
"mpesaNumber"
).value =
data.mpesa || "";




}



}

catch(error){


console.error(error);


}



}









// ==========================================
// Save Account Settings
// ==========================================


accountForm.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



try{


await setDoc(

doc(
db,
"suppliers",
currentSupplier.uid
),

{


name:

document.getElementById(
"supplierName"
).value,



phone:

document.getElementById(
"supplierPhone"
).value,



mpesa:

document.getElementById(
"mpesaNumber"
).value,


email:

currentSupplier.email



},

{

merge:true

}

);




alert(
"Settings saved successfully"
);



}

catch(error){


console.error(error);


alert(
"Failed saving settings"
);



}


});









// ==========================================
// Change Password
// ==========================================


passwordForm.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



const currentPassword =
document.getElementById(
"currentPassword"
).value;



const newPassword =
document.getElementById(
"newPassword"
).value;





try{


const credential =
EmailAuthProvider.credential(

currentSupplier.email,

currentPassword

);





await reauthenticateWithCredential(

currentSupplier,

credential

);





await updatePassword(

currentSupplier,

newPassword

);





alert(
"Password updated successfully"
);



passwordForm.reset();



}

catch(error){


console.error(error);


alert(
"Password update failed: "
+
error.message
);



}



});









// ==========================================
// Notification Settings
// ==========================================


document
.getElementById(
"orderNotifications"
)
.addEventListener(
"change",
saveNotifications
);



document
.getElementById(
"emailNotifications"
)
.addEventListener(
"change",
saveNotifications
);







async function saveNotifications(){


try{


await setDoc(

doc(
db,
"suppliers",
currentSupplier.uid
),

{


notifications:{


orders:

document.getElementById(
"orderNotifications"
).checked,



email:

document.getElementById(
"emailNotifications"
).checked


}



},

{

merge:true

}

);



}

catch(error){


console.error(error);


}



}









// ==========================================
// Delete Supplier Account
// ==========================================


deleteBtn.addEventListener(
"click",
async()=>{


const confirmDelete =
confirm(

"Are you sure you want to permanently delete your supplier account?"

);



if(!confirmDelete)
return;





try{


await deleteDoc(

doc(
db,
"suppliers",
currentSupplier.uid

)

);





await deleteUser(
currentSupplier
);





alert(
"Account deleted successfully"
);



window.location.href =
"register.html";




}

catch(error){


console.error(error);


alert(

"Unable to delete account. Please login again."

);



}



});
