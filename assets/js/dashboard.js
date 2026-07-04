import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================================
   DOM ELEMENTS
========================================== */

const customerName =
    document.getElementById("customerName");

const dashboardCustomerName =
    document.getElementById("dashboardCustomerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");

const customerCounty =
    document.getElementById("customerCounty");

const customerTown =
    document.getElementById("customerTown");

const logoutBtn =
    document.getElementById("logoutBtn");

/* Dashboard Statistics */

const loyaltyPoints =
    document.getElementById("loyaltyPoints");

const rewardPoints =
    document.getElementById("rewardPoints");

const activeOrders =
    document.getElementById("activeOrders");

const completedOrders =
    document.getElementById("completedOrders");

const savedAddresses =
    document.getElementById("savedAddresses");

const favoriteSuppliers =
    document.getElementById("favoriteSuppliers");

/* ==========================================
   AUTH STATE
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    loadCustomerProfile(user);

});/* ==========================================
   LOAD CUSTOMER PROFILE
========================================== */

async function loadCustomerProfile(user) {

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            alert("Customer profile not found.");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        const data = userSnap.data();

        /* ============================
           CUSTOMER DETAILS
        ============================ */

        const fullName =
            `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();

        if (customerName) {

            customerName.textContent = fullName || "Customer";

        }

        if (dashboardCustomerName) {

            dashboardCustomerName.textContent = fullName || "Customer";

        }

        if (customerEmail) {

            customerEmail.textContent =
                data.email || user.email || "-";

        }

        if (customerPhone) {

            customerPhone.textContent =
                data.phone || "-";

        }

        if (customerCounty) {

            customerCounty.textContent =
                data.county || "-";

        }

        if (customerTown) {

            customerTown.textContent =
                data.town || "-";

        }

        /* ============================
           DASHBOARD STATISTICS
        ============================ */

        if (loyaltyPoints) {

            loyaltyPoints.textContent =
                data.loyaltyPoints || 0;

        }

        if (rewardPoints) {

            rewardPoints.textContent =
                data.loyaltyPoints || 0;

        }

        if (activeOrders) {

            activeOrders.textContent =
                data.activeOrders || 0;

        }

        if (completedOrders) {

            completedOrders.textContent =
                data.completedOrders || 0;

        }

        if (savedAddresses) {

            savedAddresses.textContent =
                data.savedAddresses || 0;

        }

        if (favoriteSuppliers) {

            favoriteSuppliers.textContent =
                data.favoriteSuppliers || 0;

        }

        console.log("Customer profile loaded successfully.");

    }

    catch (error) {

        console.error("Error loading customer profile:", error);

        alert("Unable to load your profile.");

    }

}/* ==========================================
   LOGOUT FUNCTION
========================================== */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            showToast("Logged out successfully");

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1200);

        }

        catch (error) {

            console.error("Logout error:", error);

            alert("Failed to logout. Try again.");

        }

    });

}


/* ==========================================
   TOAST NOTIFICATION SYSTEM
========================================== */

function showToast(message, type = "success") {

    const toastEl = document.getElementById("dashboardToast");

    const toastMsg = document.getElementById("toastMessage");

    if (!toastEl || !toastMsg) return;

    toastMsg.textContent = message;

    /* Change color based on type */

    toastEl.classList.remove(
        "text-bg-success",
        "text-bg-danger",
        "text-bg-warning",
        "text-bg-info"
    );

    switch (type) {

        case "danger":
            toastEl.classList.add("text-bg-danger");
            break;

        case "warning":
            toastEl.classList.add("text-bg-warning");
            break;

        case "info":
            toastEl.classList.add("text-bg-info");
            break;

        default:
            toastEl.classList.add("text-bg-success");

    }

    const toast = new bootstrap.Toast(toastEl);

    toast.show();

}


/* ==========================================
   FIND NEARBY SUPPLIERS BUTTON
========================================== */

const findNearbyBtn =
    document.getElementById("findNearbyBtn");

if (findNearbyBtn) {

    findNearbyBtn.addEventListener("click", () => {

        showToast("Detecting your location...");

        if (!navigator.geolocation) {

            showToast("Geolocation not supported", "danger");

            return;

        }

        navigator.geolocation.getCurrentPosition(

            (position) => {

                showToast("Location detected successfully!");

                console.log("User location:", position.coords);

                // Later: load real suppliers based on coordinates

            },

            (error) => {

                console.error(error);

                showToast("Failed to get location", "danger");

            }

        );

    });

}


/* ==========================================
   PLACEHOLDER: FUTURE EXTENSIONS
========================================== */

/*
    Future upgrades we will add here:

    - Real-time orders listener (Firestore onSnapshot)
    - Live notifications system
    - Google Maps integration
    - Supplier filtering by distance
    - Payment tracking (M-PESA / Paystack)
*/
