import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", registerUser);

}

async function registerUser(e) {

    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();

    const lastName = document.getElementById("lastName").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const email = document.getElementById("email").value.trim();

    const county = document.getElementById("county").value;

    const town = document.getElementById("town").value;

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        await updateProfile(user, {
            displayName: firstName + " " + lastName
        });

        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,

            firstName,

            lastName,

            phone,

            email,

            county,

            town,

            role: "customer",

            verified: false,

            createdAt: serverTimestamp()

        });

        alert("Registration successful!");

        window.location.href = "customer-dashboard.html";

    }

    catch (error) {

        alert(error.message);

    }

}
