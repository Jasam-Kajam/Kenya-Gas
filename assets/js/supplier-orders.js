// ==========================================
// Kenya Gas Marketplace
// Supplier Orders Management
// assets/js/supplier-orders.js
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
    doc,
    updateDoc,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";





let currentSupplier = null;



const ordersTable =
document.getElementById(
"ordersTable"
);



const pendingOrders =
document.getElementById(
"pendingOrders"
);



const completedOrders =
document.getElementById(
"completedOrders"
);



const totalOrders =
document.getElementById(
"totalOrders"
);






// ==========================================
// Check Supplier Login
// ==========================================


onAuthStateChanged(
auth,
(user)=>{


if(user){


currentSupplier = user;


loadOrders();


}

else{


window.location.href =
"login.html";


}


});







// ==========================================
// Load Supplier Orders
// ==========================================


async function loadOrders(){


try{


ordersTable.innerHTML = `

<tr>

<td colspan="7"
class="text-center">

Loading orders...

</td>

</tr>

`;



const q = query(

collection(db,"orders"),

where(
"supplierId",
"==",
currentSupplier.uid
),

orderBy(
"createdAt",
"desc"
)

);




const snapshot =
await getDocs(q);



ordersTable.innerHTML = "";



let pending = 0;

let completed = 0;

let total = 0;




if(snapshot.empty){


ordersTable.innerHTML = `

<tr>

<td colspan="7"
class="text-center">

No orders found

</td>

</tr>

`;

return;


}




snapshot.forEach(
(orderDoc)=>{


const order =
orderDoc.data();



total++;



if(order.status === "Pending"){

pending++;

}



if(order.status === "Completed"){

completed++;

}





ordersTable.innerHTML += `


<tr>


<td>

<strong>
${order.customerName || "Customer"}
</strong>

<br>

${order.customerPhone || ""}


</td>



<td>

${order.productName || "LPG Cylinder"}

</td>



<td>

${order.quantity || 1}

</td>



<td>

KES ${order.amount || 0}

</td>



<td>

${
order.createdAt
?
new Date(
order.createdAt.seconds * 1000
).toLocaleDateString()

:
""
}

</td>





<td>


<span class="badge 

${getStatusColor(order.status)}

">

${order.status || "Pending"}

</span>


</td>





<td>


<select

class="form-select form-select-sm"

onchange="changeOrderStatus(
'${orderDoc.id}',
this.value
)"

>


<option value="Pending"
${order.status==="Pending"?"selected":""}>

Pending

</option>



<option value="Accepted"
${order.status==="Accepted"?"selected":""}>

Accepted

</option>



<option value="Processing"
${order.status==="Processing"?"selected":""}>

Processing

</option>



<option value="Completed"
${order.status==="Completed"?"selected":""}>

Completed

</option>



<option value="Cancelled"
${order.status==="Cancelled"?"selected":""}>

Cancelled

</option>


</select>



</td>



</tr>


`;



}

);




pendingOrders.innerText =
pending;


completedOrders.innerText =
completed;


totalOrders.innerText =
total;



}

catch(error){


console.error(
error
);


ordersTable.innerHTML = `

<tr>

<td colspan="7"
class="text-danger text-center">

Error loading orders

</td>

</tr>

`;



}



}









// ==========================================
// Update Order Status
// ==========================================


window.changeOrderStatus =
async function(
orderId,
status
){


try{


await updateDoc(

doc(
db,
"orders",
orderId
),

{

status:status

}

);



alert(
"Order status updated"
);



loadOrders();



}

catch(error){


console.error(error);


alert(
"Failed updating order"
);



}


};








// ==========================================
// Status Badge Colors
// ==========================================


function getStatusColor(status){


switch(status){


case "Pending":

return "bg-warning text-dark";


case "Accepted":

return "bg-primary";


case "Processing":

return "bg-info text-dark";


case "Completed":

return "bg-success";


case "Cancelled":

return "bg-danger";


default:

return "bg-secondary";


}



}
