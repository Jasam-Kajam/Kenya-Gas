// ==========================================
// Kenya Gas Marketplace
// Supplier Profile
// assets/js/supplier-profile.js
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
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// ------------------------------------------
// Elements
// ------------------------------------------

const form = document.getElementById("supplierProfileForm");

const logoInput = document.getElementById("businessLogo");

const logoPreview = document.getElementById("businessLogoPreview");

const emailInput = document.getElementById("email");

const countySelect = document.getElementById("county");

const townSelect = document.getElementById("town");

let townsData = {};
let currentUser = null;
let logoURL = "";


// ------------------------------------------
// Authentication
// ------------------------------------------

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    emailInput.value = user.email || "";

    await loadTowns();

    populateCounties();

    await loadProfile();

});


// ------------------------------------------
// Load towns.json
// ------------------------------------------

async function loadTowns() {

    try {

        const response = await fetch("assets/data/towns.json");

        townsData = await response.json();

    } catch (error) {

        console.error("Unable to load towns:", error);

    }

}


// ------------------------------------------
// Populate Counties
// Requires counties.js
// ------------------------------------------

function populateCounties() {

    if (!window.counties) return;

    countySelect.innerHTML =
        `<option value="">Select County</option>`;

    window.counties.forEach(county => {

        countySelect.innerHTML += `
            <option value="${county}">
                ${county}
            </option>
        `;

    });

}


// ------------------------------------------
// Populate Towns
// ------------------------------------------

countySelect.addEventListener("change", () => {

    const county = countySelect.value;

    townSelect.innerHTML =
        `<option value="">Select Town</option>`;

    if (!townsData[county]) return;

    townsData[county].forEach(town => {

        townSelect.innerHTML += `
            <option value="${town}">
                ${town}
            </option>
        `;

    });

});


// ------------------------------------------
// Logo Preview
// ------------------------------------------

logoInput.addEventListener("change", () => {

    const file = logoInput.files[0];

    if (!file) return;

    logoPreview.src = URL.createObjectURL(file);

});


// ------------------------------------------
// Load Supplier Profile
// ------------------------------------------

async function loadProfile() {

    try {

        const profileRef = doc(
            db,
            "suppliers",
            currentUser.uid
        );

        const snapshot = await getDoc(profileRef);

        if (!snapshot.exists()) return;

        const data = snapshot.data();

        document.getElementById("businessName").value =
            data.businessName || "";

        document.getElementById("ownerName").value =
            data.ownerName || "";

        document.getElementById("phoneNumber").value =
            data.phoneNumber || "";

        document.getElementById("address").value =
            data.address || "";

        document.getElementById("permitNumber").value =
            data.permitNumber || "";

        document.getElementById("verificationStatus").value =
            data.verificationStatus || "Pending Verification";

        logoURL = data.logo || "";

        if (logoURL) {

            logoPreview.src = logoURL;

        }

        if (data.county) {

            countySelect.value = data.county;

            countySelect.dispatchEvent(
                new Event("change")
            );

            setTimeout(() => {

                townSelect.value = data.town || "";

            }, 200);

        }

    } catch (error) {

        console.error(error);

    }

}


// ------------------------------------------
// Save Profile
// ------------------------------------------

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const logoFile = logoInput.files[0];

        if (logoFile) {

            const storageRef = ref(
                storage,
                `supplier-logos/${currentUser.uid}/${logoFile.name}`
            );

            await uploadBytes(
                storageRef,
                logoFile
            );

            logoURL = await getDownloadURL(
                storageRef
            );

        }

        await setDoc(

            doc(
                db,
                "suppliers",
                currentUser.uid
            ),

            {

                businessName:
                document.getElementById("businessName").value,

                ownerName:
                document.getElementById("ownerName").value,

                phoneNumber:
                document.getElementById("phoneNumber").value,

                county:
                countySelect.value,

                town:
                townSelect.value,

                address:
                document.getElementById("address").value,

                permitNumber:
                document.getElementById("permitNumber").value,

                logo: logoURL,

                email: currentUser.email,

                verificationStatus:
                document.getElementById("verificationStatus").value,

                updatedAt: serverTimestamp()

            },

            { merge: true }

        );

        alert("Business profile saved successfully.");

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});
