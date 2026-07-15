// ==========================================
// Kenya Gas Marketplace
// Supplier Wallet Management
// assets/js/supplier-wallet.js
// ==========================================


import {
    auth,
    db
} from "./firebase.js";


import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {

    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";





let currentSupplier = null;


// Commission per cylinder
const COMMISSION_RATE = 49;




const totalSales =
document.getElementById(
"totalSales"
);


const commissionEarned =
document.getElementById(
"commissionEarned"
);


const walletBalance =
document.getElementById(
"walletBalance"
);


const transactionsTable =
document.getElementById(
"transactionsTable"
);


const withdrawalForm =
document.getElementById(
"withdrawalForm"
);







// ==========================================
// Check Login
// ==========================================


onAuthStateChanged(
auth,
(user)=>{


if(user){


currentSupplier = user;


loadWallet();


loadTransactions();



}

else{


window.location.href =
"login.html";


}


});








// ==========================================
// Load Wallet Data
// ==========================================


async function loadWallet(){


try{


const q = query(

collection(db,"orders"),

where(
"supplierId",
"==",
currentSupplier.uid
),

where(
"status",
"==",
"Completed"
)

);



const snapshot =
await getDocs(q);



let sales = 0;

let cylinders = 0;




snapshot.forEach((order)=>{


const data =
order.data();



sales += Number(
data.amount || 0
);



cylinders += Number(
data.quantity || 1
);



});





const commission =
cylinders * COMMISSION_RATE;



const balance =
sales - commission;





totalSales.innerText =
"KES " + sales.toLocaleString();



commissionEarned.innerText =
"KES " + commission.toLocaleString();



walletBalance.innerText =
"KES " + balance.toLocaleString();





}

catch(error){


console.error(
error
);



}



}









// ==========================================
// Withdrawal Request
// ==========================================


withdrawalForm.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



const phone =
document.getElementById(
"mpesaNumber"
).value;



const amount =
Number(
document.getElementById(
"withdrawAmount"
).value
);





try{


await addDoc(

collection(
db,
"withdrawals"
),

{


supplierId:
currentSupplier.uid,


supplierEmail:
currentSupplier.email,


phone:
phone,


amount:
amount,


status:
"Pending",


createdAt:
serverTimestamp()


}

);





alert(
"Withdrawal request submitted"
);



withdrawalForm.reset();



loadTransactions();



}

catch(error){


console.error(error);



alert(
"Failed submitting request"
);



}



});









// ==========================================
// Load Transactions
// ==========================================


async function loadTransactions(){



try{


const q =
query(

collection(
db,
"withdrawals"
),

where(
"supplierId",
"==",
currentSupplier.uid
)

);




const snapshot =
await getDocs(q);



transactionsTable.innerHTML="";




if(snapshot.empty){


transactionsTable.innerHTML=`

<tr>

<td colspan="4"
class="text-center">

No transactions yet

</td>

</tr>

`;


return;


}







snapshot.forEach((item)=>{


const data =
item.data();




transactionsTable.innerHTML += `


<tr>


<td>

${
data.createdAt
?
new Date(
data.createdAt.seconds * 1000
).toLocaleDateString()

:
"Pending"

}

</td>



<td>

Withdrawal

</td>




<td>

KES ${data.amount}

</td>




<td>


<span class="badge bg-warning">

${data.status}

</span>


</td>



</tr>


`;



});




}

catch(error){


console.error(
error
);



}


}
