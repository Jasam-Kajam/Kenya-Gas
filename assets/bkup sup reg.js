import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const form = document.getElementById("supplierRegisterForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const businessName = document.getElementById("businessName").value;
    const ownerName = document.getElementById("ownerName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const county = document.getElementById("county").value;
    const town = document.getElementById("town").value;
    const password = document.getElementById("password").value;

    try {

        const userCredential =
            await createUserWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;

        await setDoc(doc(db, "suppliers", user.uid), {

            uid: user.uid,
            businessName,
            ownerName,
            email,
            phone,
            county,
            town,
            role: "supplier",
            verified: false,
            rating: 0,
            totalOrders: 0,
            createdAt: serverTimestamp()

        });

        alert("Supplier registered successfully!");

        window.location.href = "supplier-dashboard.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});
