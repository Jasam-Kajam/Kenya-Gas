// ==========================================
// Kenya Gas Marketplace
// Supplier Products Management
// assets/js/supplier-products.js
// ==========================================


import { 
    auth,
    db,
    storage
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {

    collection,
    addDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {

    ref,
    uploadBytes,
    getDownloadURL

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";





// Current supplier

let currentSupplier = null;




// Page elements

const productForm = document.getElementById("productForm");

const productsTable = document.getElementById(
    "productsTable"
);





// ==========================================
// Check Supplier Login
// ==========================================


onAuthStateChanged(auth, (user)=>{


    if(user){

        currentSupplier = user;

        loadProducts();


    }else{


        window.location.href =
        "login.html";


    }


});







// ==========================================
// Add Product
// ==========================================


productForm.addEventListener(
"submit",
async(e)=>{


e.preventDefault();



if(!currentSupplier){

alert(
"Please login as supplier"
);

return;

}



const cylinderSize =
document.getElementById(
"cylinderSize"
).value;



const price =
Number(
document.getElementById(
"price"
).value
);



const stock =
Number(
document.getElementById(
"stock"
).value
);



const imageFile =
document.getElementById(
"productImage"
).files[0];



try{


let imageURL = "";




// Upload Image

if(imageFile){


const imageRef =
ref(
storage,
`supplier-products/${currentSupplier.uid}/${Date.now()}_${imageFile.name}`
);



await uploadBytes(
imageRef,
imageFile
);



imageURL =
await getDownloadURL(
imageRef
);


}





// Save Product


await addDoc(
collection(db,"products"),
{


supplierId:
currentSupplier.uid,


supplierEmail:
currentSupplier.email,


cylinderSize:
cylinderSize,


price:
price,


stock:
stock,


image:
imageURL,


status:
"Available",


createdAt:
serverTimestamp()


}

);




alert(
"Product added successfully"
);



productForm.reset();


loadProducts();



}

catch(error){


console.error(
error
);


alert(
"Error adding product: "
+
error.message
);



}



});








// ==========================================
// Load Supplier Products
// ==========================================


async function loadProducts(){


productsTable.innerHTML = `

<tr>
<td colspan="6"
class="text-center">

Loading products...

</td>
</tr>

`;



try{


const q =
query(

collection(db,"products"),

where(
"supplierId",
"==",
currentSupplier.uid
)

);



const snapshot =
await getDocs(q);



productsTable.innerHTML="";



if(snapshot.empty){


productsTable.innerHTML=`

<tr>

<td colspan="6"
class="text-center">

No products added yet.

</td>

</tr>

`;

return;

}




snapshot.forEach((item)=>{


const product =
item.data();



productsTable.innerHTML += `


<tr>


<td>

${
product.image ?

`<img src="${product.image}"
width="60"
height="60"
style="object-fit:cover;border-radius:8px;">`

:

`No Image`

}

</td>




<td>

${product.cylinderSize}

</td>



<td>

KES ${product.price}

</td>



<td>

${product.stock}

</td>



<td>

<span class="badge bg-success">

${product.status}

</span>

</td>




<td>


<button

class="btn btn-danger btn-sm"

onclick="deleteProduct('${item.id}')"

>

<i class="bi bi-trash"></i>

Delete

</button>


</td>



</tr>


`;



});



}

catch(error){


console.error(error);


productsTable.innerHTML=

`

<tr>

<td colspan="6"
class="text-danger text-center">

Failed loading products

</td>

</tr>

`;



}



}









// ==========================================
// Delete Product
// ==========================================


window.deleteProduct =
async function(productId){



const confirmDelete =
confirm(
"Delete this product?"
);



if(!confirmDelete)
return;



try{


await deleteDoc(

doc(
db,
"products",
productId
)

);



alert(
"Product deleted"
);



loadProducts();



}

catch(error){


alert(
error.message
);


}



};







// ==========================================
// Update Product Status
// ==========================================


window.updateProductStatus =
async function(
productId,
status
){


try{


await updateDoc(

doc(
db,
"products",
productId
),

{

status:status

}

);



loadProducts();



}

catch(error){


console.error(error);


}


};
