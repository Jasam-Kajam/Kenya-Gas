/* ==========================================================
   Kenya Gas Marketplace
   Supplier Dashboard
   Part 1
========================================================== */

import {

    auth,

    db

} from "./firebase.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    doc,

    getDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================================================
   Dashboard Variables
========================================================== */

let supplier = null;

let supplierData = null;

/* ==========================================================
   Initialize Dashboard
========================================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "supplier-login.html";

        return;

    }

    supplier = user;

    try {

        const supplierRef = doc(

            db,

            "suppliers",

            user.uid

        );

        const supplierSnap = await getDoc(supplierRef);

        if (!supplierSnap.exists()) {

            alert("Supplier account not found.");

            window.location.href = "supplier-login.html";

            return;

        }

        supplierData = supplierSnap.data();

        loadSupplierProfile();

        console.log("Supplier Dashboard Loaded");

    }

    catch (error) {

        console.error(error);

    }

});

/* ==========================================================
   Load Supplier Profile
========================================================== */

function loadSupplierProfile() {

    const businessName =

        supplierData.businessName ||

        supplierData.business ||

        "Supplier";

    const email =

        supplier.email;

    const logo =

        supplierData.logoURL ||

        supplierData.logo ||

        "https://ui-avatars.com/api/?name=" +

        encodeURIComponent(businessName) +

        "&background=198754&color=ffffff";

    /* Sidebar */

    document.getElementById("supplierName").textContent =

        businessName;

    document.getElementById("supplierEmail").textContent =

        email;

    document.getElementById("supplierPhoto").src =

        logo;

    /* Top Navbar */

    document.getElementById("welcomeName").textContent =

        businessName;

    document.getElementById("topProfileName").textContent =

        businessName;

    document.getElementById("topProfilePhoto").src =

        logo;

    /* Approval Badge */

    const approval =

        supplierData.approvalStatus ||

        "Pending Review";

    const badge =

        document.getElementById("approvalBadge");

    badge.textContent = approval;

    badge.className = "badge";

    switch (approval) {

        case "Approved":

            badge.classList.add("bg-success");

            break;

        case "Rejected":

            badge.classList.add("bg-danger");

            break;

        default:

            badge.classList.add("bg-warning");

    }

}

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Dashboard
   Part 2
   Dashboard Statistics
========================================================== */

import {

    collection,

    query,

    where,

    getDocs

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================================================
   Load Dashboard Statistics
========================================================== */

async function loadDashboardStatistics() {

    try {

        /* -----------------------------
           Products
        ------------------------------ */

        const productsQuery = query(

            collection(db, "products"),

            where("supplierId", "==", supplier.uid)

        );

        const productsSnapshot =
            await getDocs(productsQuery);

        const totalProducts =
            productsSnapshot.size;

        document.getElementById(
            "totalProducts"
        ).textContent = totalProducts;

        document.getElementById(
            "activeProducts"
        ).textContent = totalProducts;

        /* -----------------------------
           Orders
        ------------------------------ */

        const ordersQuery = query(

            collection(db, "orders"),

            where("supplierId", "==", supplier.uid)

        );

        const ordersSnapshot =
            await getDocs(ordersQuery);

        let todayOrders = 0;

        let pending = 0;

        let processing = 0;

        let delivered = 0;

        let cancelled = 0;

        let revenue = 0;

        const today = new Date();

        today.setHours(0,0,0,0);

        ordersSnapshot.forEach((docSnap) => {

            const order =
                docSnap.data();

            if (order.createdAt?.toDate) {

                const orderDate =
                    order.createdAt.toDate();

                orderDate.setHours(0,0,0,0);

                if (

                    orderDate.getTime() ===

                    today.getTime()

                ) {

                    todayOrders++;

                }

            }

            switch (order.status) {

                case "Pending":

                    pending++;

                    break;

                case "Processing":

                    processing++;

                    break;

                case "Delivered":

                    delivered++;

                    revenue +=
                        Number(order.total || 0);

                    break;

                case "Cancelled":

                    cancelled++;

                    break;

            }

        });

        document.getElementById(
            "todayOrders"
        ).textContent = todayOrders;

        document.getElementById(
            "pendingOrders"
        ).textContent = pending;

        document.getElementById(
            "processingOrders"
        ).textContent = processing;

        document.getElementById(
            "deliveredOrders"
        ).textContent = delivered;

        document.getElementById(
            "cancelledOrders"
        ).textContent = cancelled;

        document.getElementById(
            "monthlyRevenue"
        ).textContent =
            "KSh " +
            revenue.toLocaleString();

        /* -----------------------------
           Wallet
        ------------------------------ */

        const walletBalance =
            Number(
                supplierData.walletBalance || 0
            );

        document.getElementById(
            "walletBalance"
        ).textContent =
            "KSh " +
            walletBalance.toLocaleString();

        /* -----------------------------
           Supplier Status
        ------------------------------ */

        document.getElementById(
            "dashboardApprovalStatus"
        ).textContent =
            supplierData.approvalStatus ||
            "Pending Review";

        document.getElementById(
            "dashboardSellerStatus"
        ).textContent =
            supplierData.sellerStatus ||
            "Inactive";

        /* -----------------------------
           Last Login
        ------------------------------ */

        if (
            supplier.metadata?.lastSignInTime
        ) {

            document.getElementById(
                "lastLoginTime"
            ).textContent =
                new Date(
                    supplier.metadata.lastSignInTime
                ).toLocaleString();

        }

        /* -----------------------------
           Profile Completion
        ------------------------------ */

        calculateProfileCompletion();

    }

    catch (error) {

        console.error(

            "Dashboard statistics error:",

            error

        );

    }

}

/* ==========================================================
   Profile Completion
========================================================== */

function calculateProfileCompletion() {

    const fields = [

        "businessName",

        "ownerName",

        "phone",

        "email",

        "county",

        "town",

        "businessAddress",

        "businessType",

        "logoURL"

    ];

    let completed = 0;

    fields.forEach((field) => {

        if (supplierData[field]) {

            completed++;

        }

    });

    const percentage = Math.round(

        (completed / fields.length) * 100

    );

    document.getElementById(
        "profileCompletion"
    ).textContent =
        percentage + "%";

    document.getElementById(
        "profileProgress"
    ).style.width =
        percentage + "%";

}

/* ==========================================================
   Start Loading Dashboard
========================================================== */

loadDashboardStatistics();

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Dashboard
   Part 3
========================================================== */

async function loadDashboardLists() {

    try {

        /* =====================================
           Recent Orders
        ====================================== */

        const recentOrdersBody =

            document.getElementById(

                "recentOrdersTable"

            );

        recentOrdersBody.innerHTML = "";

        const ordersQuery = query(

            collection(db, "orders"),

            where("supplierId", "==", supplier.uid)

        );

        const orderSnapshot =

            await getDocs(ordersQuery);

        let recentOrders = [];

        orderSnapshot.forEach(doc => {

            recentOrders.push({

                id: doc.id,

                ...doc.data()

            });

        });

        recentOrders.sort((a, b) => {

            const aTime =

                a.createdAt?.seconds || 0;

            const bTime =

                b.createdAt?.seconds || 0;

            return bTime - aTime;

        });

        recentOrders.slice(0, 5).forEach(order => {

            recentOrdersBody.innerHTML += `

            <tr>

                <td>#${order.id.substring(0,6)}</td>

                <td>${order.customerName || "Customer"}</td>

                <td>${order.productName || "-"}</td>

                <td>

                    <span class="badge bg-primary">

                        ${order.status || "Pending"}

                    </span>

                </td>

                <td>

                    KSh ${(order.total || 0).toLocaleString()}

                </td>

            </tr>

            `;

        });

        if (!recentOrders.length) {

            recentOrdersBody.innerHTML = `

            <tr>

                <td colspan="5"

                    class="text-center py-4 text-muted">

                    No orders found.

                </td>

            </tr>

            `;

        }

        /* =====================================
           Products
        ====================================== */

        const lowStockList =

            document.getElementById(

                "lowStockList"

            );

        const topProducts =

            document.getElementById(

                "topProducts"

            );

        lowStockList.innerHTML = "";

        topProducts.innerHTML = "";

        const productsQuery = query(

            collection(db, "products"),

            where("supplierId", "==", supplier.uid)

        );

        const productSnapshot =

            await getDocs(productsQuery);

        let active = 0;

        let hidden = 0;

        let outOfStock = 0;

        let lowStock = 0;

        let bestSelling = [];

        productSnapshot.forEach(doc => {

            const product = doc.data();

            const stock =

                Number(product.stock || 0);

            if (

                product.status === "Hidden"

            ) {

                hidden++;

            } else {

                active++;

            }

            if (stock <= 0) {

                outOfStock++;

            }

            if (stock > 0 && stock <= 10) {

                lowStock++;

                lowStockList.innerHTML += `

                <div class="list-group-item">

                    <strong>

                        ${product.name}

                    </strong>

                    <br>

                    <small class="text-danger">

                        Remaining:

                        ${stock}

                    </small>

                </div>

                `;

            }

            bestSelling.push({

                name:

                    product.name,

                sold:

                    Number(

                        product.totalSold || 0

                    )

            });

        });

        if (lowStock === 0) {

            lowStockList.innerHTML = `

            <div class="list-group-item text-center text-success">

                All products are sufficiently stocked.

            </div>

            `;

        }

        bestSelling.sort(

            (a,b)=>b.sold-a.sold

        );

        bestSelling.slice(0,5).forEach(item=>{

            topProducts.innerHTML += `

            <div class="list-group-item d-flex justify-content-between">

                <span>

                    ${item.name}

                </span>

                <span class="badge bg-success">

                    ${item.sold}

                </span>

            </div>

            `;

        });

        if (!bestSelling.length) {

            topProducts.innerHTML = `

            <div class="list-group-item text-center text-muted">

                No products yet.

            </div>

            `;

        }

        /* =====================================
           Inventory Summary
        ====================================== */

        document.getElementById(

            "activeProducts"

        ).textContent = active;

        document.getElementById(

            "hiddenProducts"

        ).textContent = hidden;

        document.getElementById(

            "outOfStockProducts"

        ).textContent = outOfStock;

        document.getElementById(

            "lowStockProducts"

        ).textContent = lowStock;

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   Customer Reviews Placeholder
========================================================== */

async function loadCustomerReviews(){

    const reviewList =

        document.getElementById(

            "customerReviews"

        );

    reviewList.innerHTML = `

    <div class="list-group-item text-center text-muted">

        Customer reviews will appear here.

    </div>

    `;

}

/* ==========================================================
   Load Dashboard Lists
========================================================== */

loadDashboardLists();

loadCustomerReviews();

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Dashboard
   Part 4
========================================================== */

/* ==========================================================
   Sales Chart
========================================================== */

let salesChart = null;

function renderSalesChart() {

    const canvas = document.getElementById("salesChart");

    if (!canvas) return;

    if (salesChart) {

        salesChart.destroy();

    }

    salesChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: [

                "Mon",

                "Tue",

                "Wed",

                "Thu",

                "Fri",

                "Sat",

                "Sun"

            ],

            datasets: [

                {

                    label: "Sales (KES)",

                    data: [

                        0,

                        0,

                        0,

                        0,

                        0,

                        0,

                        0

                    ],

                    borderColor: "#198754",

                    backgroundColor: "rgba(25,135,84,.15)",

                    fill: true,

                    tension: .35

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: true

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

/* ==========================================================
   Notifications
========================================================== */

function loadNotifications() {

    const list =

        document.getElementById(

            "notificationsList"

        );

    const badge =

        document.getElementById(

            "notificationCount"

        );

    if (!list) return;

    const notifications = [

        {

            icon: "bi-check-circle-fill text-success",

            text: "Welcome to your supplier dashboard."

        },

        {

            icon: "bi-box-seam text-primary",

            text: "Remember to keep product stock updated."

        },

        {

            icon: "bi-wallet2 text-warning",

            text: "Wallet withdrawals will appear here."

        }

    ];

    list.innerHTML = "";

    notifications.forEach(item => {

        list.innerHTML += `

        <div class="list-group-item">

            <i class="bi ${item.icon} me-2"></i>

            ${item.text}

        </div>

        `;

    });

    if (badge) {

        badge.textContent = notifications.length;

    }

}

/* ==========================================================
   Activity Timeline
========================================================== */

function loadActivityTimeline() {

    const timeline =

        document.getElementById(

            "activityTimeline"

        );

    if (!timeline) return;

    timeline.innerHTML = `

    <div class="list-group-item">

        <strong>Dashboard Login</strong>

        <br>

        <small class="text-muted">

            ${new Date().toLocaleString()}

        </small>

    </div>

    <div class="list-group-item">

        Supplier account verified.

    </div>

    <div class="list-group-item">

        Ready to receive customer orders.

    </div>

    `;

}

/* ==========================================================
   Logout Buttons
========================================================== */

function initializeLogout() {

    const logoutButtons = [

        document.getElementById(

            "logoutBtn"

        ),

        document.getElementById(

            "topLogoutBtn"

        )

    ];

    logoutButtons.forEach(btn => {

        if (!btn) return;

        btn.addEventListener(

            "click",

            async () => {

                if (

                    typeof SupplierAuth !==

                    "undefined"

                ) {

                    await SupplierAuth.logout();

                }

            }

        );

    });

}

/* ==========================================================
   Refresh Button
========================================================== */

const refreshBtn =

    document.getElementById(

        "refreshActivity"

    );

if (refreshBtn) {

    refreshBtn.addEventListener(

        "click",

        () => {

            loadDashboardStatistics();

            loadDashboardLists();

            loadNotifications();

            loadActivityTimeline();

        }

    );

}

/* ==========================================================
   Mark Notifications Read
========================================================== */

const markRead =

    document.getElementById(

        "markNotificationsRead"

    );

if (markRead) {

    markRead.addEventListener(

        "click",

        () => {

            document.getElementById(

                "notificationCount"

            ).textContent = "0";

        }

    );

}

/* ==========================================================
   Dashboard Startup
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        renderSalesChart();

        loadNotifications();

        loadActivityTimeline();

        initializeLogout();

    }

);

/* ==========================================================
   Kenya Gas Marketplace
   Supplier Dashboard
   Part 5 (FINAL)
========================================================== */

import {

    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================================================
   Live Supplier Updates
========================================================== */

function startRealtimeUpdates() {

    if (!supplier) return;

    const supplierRef = doc(

        db,

        "suppliers",

        supplier.uid

    );

    onSnapshot(supplierRef, (snapshot) => {

        if (!snapshot.exists()) return;

        supplierData = snapshot.data();

        loadSupplierProfile();

        loadDashboardStatistics();

    });

}

/* ==========================================================
   Network Status
========================================================== */

function updateNetworkStatus() {

    const badge =

        document.getElementById(

            "networkStatus"

        );

    if (!badge) return;

    if (navigator.onLine) {

        badge.textContent = "Online";

        badge.className =

            "badge bg-success";

    } else {

        badge.textContent = "Offline";

        badge.className =

            "badge bg-danger";

    }

}

window.addEventListener(

    "online",

    updateNetworkStatus

);

window.addEventListener(

    "offline",

    updateNetworkStatus

);

/* ==========================================================
   Firebase Status
========================================================== */

function updateFirebaseStatus(

    connected = true

) {

    const badge =

        document.getElementById(

            "firebaseStatus"

        );

    if (!badge) return;

    if (connected) {

        badge.textContent = "Connected";

        badge.className =

            "badge bg-success";

    } else {

        badge.textContent = "Disconnected";

        badge.className =

            "badge bg-danger";

    }

}

/* ==========================================================
   Last Sync
========================================================== */

function updateLastSync() {

    const sync =

        document.getElementById(

            "lastSyncTime"

        );

    if (!sync) return;

    sync.textContent =

        new Date().toLocaleTimeString();

}

/* ==========================================================
   Auto Refresh
========================================================== */

setInterval(async () => {

    if (!navigator.onLine) return;

    try {

        await loadDashboardStatistics();

        await loadDashboardLists();

        updateLastSync();

        updateFirebaseStatus(true);

    }

    catch (error) {

        console.error(error);

        updateFirebaseStatus(false);

    }

}, 60000);

/* ==========================================================
   Floating Dashboard Actions
========================================================== */

const quickButton =

    document.getElementById(

        "quickActionBtn"

    );

if (quickButton) {

    quickButton.addEventListener(

        "click",

        () => {

            console.log(

                "Quick actions opened."

            );

        }

    );

}

/* ==========================================================
   Dashboard Ready
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        updateNetworkStatus();

        updateFirebaseStatus(true);

        updateLastSync();

        startRealtimeUpdates();

        console.log(

            "✅ Supplier Dashboard Ready"

        );

    }

);

/* ==========================================================
   Global Error Handler
========================================================== */

window.addEventListener(

    "error",

    (event) => {

        console.error(

            "Dashboard Error:",

            event.error

        );

    }

);

/* ==========================================================
   Promise Error Handler
========================================================== */

window.addEventListener(

    "unhandledrejection",

    (event) => {

        console.error(

            "Unhandled Promise:",

            event.reason

        );

    }

);

/* ==========================================================
   End of supplier-dashboard.js
========================================================== */
