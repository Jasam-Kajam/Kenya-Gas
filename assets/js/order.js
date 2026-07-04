import { auth, db } from "./firebase.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const gasType = document.getElementById("gasType");
const quantity = document.getElementById("quantity");
const totalPrice = document.getElementById("totalPrice");
const orderForm = document.getElementById("orderForm");

/* =========================
   PRICE CALCULATION
========================= */

function calculatePrice() {

    const selected = gasType.options[gasType.selectedIndex];

    const price = selected?.dataset?.price || 0;

    const qty = parseInt(quantity.value || 1);

    totalPrice.textContent = price * qty;

}

gasType.addEventListener("change", calculatePrice);
quantity.addEventListener("input", calculatePrice);

/* =========================
   PLACE ORDER
========================= */

orderForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {

        alert("Please login first");

        window.location.href = "login.html";

        return;

    }

    const selected = gasType.options[gasType.selectedIndex];

    const orderData = {

        userId: user.uid,

        gasType: gasType.value,

        pricePerUnit: selected.dataset.price,

        quantity: parseInt(quantity.value),

        supplier: document.getElementById("supplier").value,

        address: document.getElementById("address").value,

        totalPrice: parseInt(totalPrice.textContent),

        status: "pending",

        createdAt: serverTimestamp()

    };

    try {

        await addDoc(collection(db, "orders"), orderData);

        alert("Order placed successfully!");

        window.location.href = "customer-dashboard.html";

    }

    catch (error) {

        console.error(error);

        alert("Failed to place order");

    }

});
