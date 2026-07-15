// ==========================================
// Kenya Gas Marketplace
// Supplier Analytics
// assets/js/supplier-analytics.js
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
    getDocs

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";





let currentSupplier = null;



let salesChart;






// Elements

const totalOrders =
document.getElementById(
"totalOrders"
);


const totalCylinders =
document.getElementById(
"totalCylinders"
);


const totalRevenue =
document.getElementById(
"totalRevenue"
);


const totalCustomers =
document.getElementById(
"totalCustomers"
);


const productAnalytics =
document.getElementById(
"productAnalytics"
);









// ==========================================
// Authentication
// ==========================================


onAuthStateChanged(
auth,
(user)=>{


if(user){


currentSupplier = user;


loadAnalytics();


}

else{


window.location.href =
"login.html";


}


});








// ==========================================
// Load Analytics
// ==========================================


async function loadAnalytics(){


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





let orders = 0;

let cylinders = 0;

let revenue = 0;


let customers = new Set();


let monthlySales = {

Jan:0,
Feb:0,
Mar:0,
Apr:0,
May:0,
Jun:0,
Jul:0,
Aug:0,
Sep:0,
Oct:0,
Nov:0,
Dec:0

};





let products = {};






snapshot.forEach(
(order)=>{


const data =
order.data();



orders++;



const qty =
Number(
data.quantity || 1
);



const amount =
Number(
data.amount || 0
);



cylinders += qty;


revenue += amount;



if(data.customerId){

customers.add(
data.customerId
);

}





// Monthly sales

if(data.createdAt){


const date =
new Date(
data.createdAt.seconds * 1000
);


const month =
date.toLocaleString(
"en-US",
{
month:"short"
}
);


monthlySales[month] += amount;


}





// Products

const product =
data.productName || "LPG Cylinder";



if(!products[product]){


products[product] = {

quantity:0,

revenue:0

};


}



products[product].quantity += qty;

products[product].revenue += amount;



});







// Update cards


totalOrders.innerText =
orders;


totalCylinders.innerText =
cylinders;


totalRevenue.innerText =
"KES " + revenue.toLocaleString();



totalCustomers.innerText =
customers.size;







displayProducts(products);



createChart(monthlySales);




}

catch(error){


console.error(
error
);


}



}









// ==========================================
// Product Performance Table
// ==========================================


function displayProducts(products){


productAnalytics.innerHTML="";



const list =
Object.entries(products);



if(list.length===0){


productAnalytics.innerHTML=`

<tr>

<td colspan="3"
class="text-center">

No sales data

</td>

</tr>

`;

return;

}





list.sort(
(a,b)=>
b[1].quantity -
a[1].quantity
);




list.forEach(
(item)=>{


const name =
item[0];


const data =
item[1];



productAnalytics.innerHTML += `


<tr>


<td>

${name}

</td>



<td>

${data.quantity}

</td>



<td>

KES ${data.revenue.toLocaleString()}

</td>


</tr>


`;



});


}









// ==========================================
// Sales Chart
// ==========================================


function createChart(data){



const ctx =
document
.getElementById(
"salesChart"
);



if(salesChart){

salesChart.destroy();

}




salesChart = new Chart(
ctx,
{


type:"line",


data:{


labels:Object.keys(data),


datasets:[{


label:
"Monthly Sales (KES)",


data:
Object.values(data),


tension:0.4



}]

},



options:{


responsive:true,


plugins:{


legend:{


display:true


}


}



}



}

);



}
