import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const container = document.getElementById("ordersContainer");

/* ======================================
   AUTH CHECK
====================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    loadOrders(user.uid);

});

/* ======================================
   LOAD ORDERS
====================================== */

async function loadOrders(userId) {

    container.innerHTML = "<p>Loading orders...</p>";

    try {

        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            container.innerHTML = "<p>No orders found.</p>";

            return;

        }

        container.innerHTML = "";

        snapshot.forEach(docSnap => {

            const data = docSnap.data();

            const card = document.createElement("div");

            card.className = "col-md-6";

            card.innerHTML = `
                <div class="card shadow border-0">
                    <div class="card-body">

                        <h5 class="fw-bold text-success">
                            ${data.gasType} Cylinder
                        </h5>

                        <p class="mb-1">
                            <strong>Supplier:</strong> ${data.supplier}
                        </p>

                        <p class="mb-1">
                            <strong>Quantity:</strong> ${data.quantity}
                        </p>

                        <p class="mb-1">
                            <strong>Total:</strong> KES ${data.totalPrice}
                        </p>

                        <p class="mb-1">
                            <strong>Status:</strong>
                            <span class="badge bg-warning">
                                ${data.status}
                            </span>
                        </p>

                        <p class="text-muted small">
                            ${data.address}
                        </p>

                    </div>
                </div>
            `;

            container.appendChild(card);

        });

    }

    catch (error) {

        console.error(error);

        container.innerHTML =
            "<p class='text-danger'>Failed to load orders.</p>";

    }

}
