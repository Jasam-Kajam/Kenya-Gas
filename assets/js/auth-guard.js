/* ==========================================================
   Kenya Gas Marketplace
   Supplier Authentication Guard
========================================================== */

import { auth, db } from "./firebase.js";

import {

    onAuthStateChanged,

    signOut

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    doc,

    getDoc,

    updateDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================================================
   Loading Overlay
========================================================== */

const loadingOverlay =
    document.getElementById("loadingOverlay");

function hideLoader() {

    if (!loadingOverlay) return;

    loadingOverlay.classList.add("hidden");

    setTimeout(() => {

        loadingOverlay.remove();

    }, 300);

}

/* ==========================================================
   Redirect Helper
========================================================== */

function redirectToLogin(message = "") {

    const url = new URL(
        "supplier-login.html",
        window.location.href
    );

    if (message) {

        url.searchParams.set("message", message);

    }

    window.location.replace(url);

}

/* ==========================================================
   Authentication Guard
========================================================== */

onAuthStateChanged(auth, async (user) => {

    try {

        /* -----------------------------
           Not Logged In
        ------------------------------ */

        if (!user) {

            redirectToLogin("Please sign in.");

            return;

        }

        /* -----------------------------
           Supplier Record
        ------------------------------ */

        const supplierRef = doc(

            db,

            "suppliers",

            user.uid

        );

        const supplierSnap =
            await getDoc(supplierRef);

        if (!supplierSnap.exists()) {

            await signOut(auth);

            redirectToLogin(
                "Supplier account not found."
            );

            return;

        }

        const supplier =
            supplierSnap.data();

        /* -----------------------------
           Email Verification
        ------------------------------ */

        if (

            !user.emailVerified &&

            supplier.provider !== "google"

        ) {

            await signOut(auth);

            redirectToLogin(

                "Verify your email first."

            );

            return;

        }

        /* -----------------------------
           Continue...
        ------------------------------ */

        hideLoader();

        console.log(

            "Supplier authenticated:",

            user.email

        );

    }

    catch (error) {

        console.error(error);

        await signOut(auth);

        redirectToLogin();

    }

});

/* ==========================================================
   Kenya Gas Marketplace
   Auth Guard
   Part 2
========================================================== */

/* -----------------------------
   Supplier Status
------------------------------ */

const approvalStatus =
    supplier.approvalStatus || "Pending Review";

const sellerStatus =
    supplier.sellerStatus || "Inactive";

/* -----------------------------
   Suspended Account
------------------------------ */

if (sellerStatus === "Suspended") {

    await signOut(auth);

    redirectToLogin(

        "Your supplier account has been suspended. Please contact support."

    );

    return;

}

/* -----------------------------
   Disabled Account
------------------------------ */

if (sellerStatus === "Disabled") {

    await signOut(auth);

    redirectToLogin(

        "Your supplier account has been disabled."

    );

    return;

}

/* -----------------------------
   Rejected Account
------------------------------ */

if (approvalStatus === "Rejected") {

    await signOut(auth);

    redirectToLogin(

        "Your supplier registration was rejected."

    );

    return;

}

/* -----------------------------
   Update Session
------------------------------ */

await updateDoc(

    supplierRef,

    {

        lastLogin: serverTimestamp(),

        lastActive: serverTimestamp(),

        online: true,

        updatedAt: serverTimestamp()

    }

);

/* -----------------------------
   Store Supplier Locally
------------------------------ */

sessionStorage.setItem(

    "supplierUID",

    user.uid

);

sessionStorage.setItem(

    "supplierEmail",

    user.email

);

sessionStorage.setItem(

    "supplierApproval",

    approvalStatus

);

sessionStorage.setItem(

    "supplierStatus",

    sellerStatus

);

/* -----------------------------
   Make Supplier Available
------------------------------ */

window.currentSupplier = {

    uid: user.uid,

    email: user.email,

    approvalStatus,

    sellerStatus,

    profile: supplier

};

console.log(

    "✅ Supplier session verified."

);

/* ==========================================================
   Kenya Gas Marketplace
   Auth Guard
   Part 3 (FINAL)
========================================================== */

/* ==========================
   PROTECTED PAGE HELPER
========================== */

function requireApproval() {

    if (!window.currentSupplier) return false;

    return window.currentSupplier.approvalStatus === "Approved";

}

function supplierCanSell() {

    if (!window.currentSupplier) return false;

    return (

        window.currentSupplier.sellerStatus === "Active" &&

        window.currentSupplier.approvalStatus === "Approved"

    );

}

/* ==========================
   PAGE UTILITIES
========================== */

window.SupplierAuth = {

    get uid() {

        return window.currentSupplier?.uid;

    },

    get email() {

        return window.currentSupplier?.email;

    },

    get profile() {

        return window.currentSupplier?.profile;

    },

    get approvalStatus() {

        return window.currentSupplier?.approvalStatus;

    },

    get sellerStatus() {

        return window.currentSupplier?.sellerStatus;

    },

    canSell() {

        return supplierCanSell();

    },

    isApproved() {

        return requireApproval();

    },

    async logout() {

        try {

            if (window.currentSupplier) {

                const supplierRef = doc(

                    db,

                    "suppliers",

                    window.currentSupplier.uid

                );

                await updateDoc(

                    supplierRef,

                    {

                        online: false,

                        lastActive: serverTimestamp()

                    }

                );

            }

        } catch (e) {

            console.warn(e);

        }

        sessionStorage.clear();

        localStorage.removeItem("supplierUID");

        await signOut(auth);

        window.location.replace("supplier-login.html");

    }

};

/* ==========================
   PAGE EXIT
========================== */

window.addEventListener(

    "beforeunload",

    async () => {

        if (!auth.currentUser) return;

        try {

            const supplierRef = doc(

                db,

                "suppliers",

                auth.currentUser.uid

            );

            await updateDoc(

                supplierRef,

                {

                    online: false,

                    lastActive: serverTimestamp()

                }

            );

        } catch (e) {

            // Ignore network errors on page unload

        }

    }

);

/* ==========================
   INITIALIZATION
========================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        console.log(

            "🛡️ Supplier Auth Guard Loaded"

        );

    }

);

/* ==========================
   END OF FILE
========================== */
