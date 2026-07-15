// ======================================================
// Kenya Gas Marketplace
// Admin Dashboard
// Part 1 - Firebase & Authentication
// ======================================================

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// DOM Elements
// ======================================================

const adminName = document.getElementById("adminName");
const adminEmail = document.getElementById("adminEmail");
const adminPhoto = document.getElementById("adminPhoto");

const topAdminName = document.getElementById("topAdminName");
const topAdminPhoto = document.getElementById("topAdminPhoto");
const welcomeAdmin = document.getElementById("welcomeAdmin");

const logoutBtn = document.getElementById("logoutBtn");
const topLogoutBtn = document.getElementById("topLogoutBtn");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

// ======================================================
// Loading Screen
// ======================================================

function hideLoader() {

    const loader = document.getElementById("loadingOverlay");

    if (loader) {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.remove();

        }, 500);

    }

}

// ======================================================
// Authentication
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    try {

        const adminRef = doc(db, "admins", user.uid);

        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            alert("Access denied.");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        const admin = adminSnap.data();

        populateAdmin(admin, user);

        initializeDashboard();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load administrator profile.");

    }

});

// ======================================================
// Populate Admin Information
// ======================================================

function populateAdmin(admin, user) {

    const name = admin.fullName || user.displayName || "Administrator";

    const email = admin.email || user.email;

    const photo =
        admin.photoURL ||
        user.photoURL ||
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(name);

    adminName.textContent = name;
    adminEmail.textContent = email;

    topAdminName.textContent = name;
    welcomeAdmin.textContent = name;

    adminPhoto.src = photo;
    topAdminPhoto.src = photo;

}

// ======================================================
// Logout
// ======================================================

async function logout() {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    }

    catch (error) {

        console.error(error);

        alert("Logout failed.");

    }

}

logoutBtn?.addEventListener("click", logout);

topLogoutBtn?.addEventListener("click", logout);

confirmLogoutBtn?.addEventListener("click", logout);

// ======================================================
// Dashboard Initializer
// ======================================================

function initializeDashboard() {

    console.log("Admin Dashboard Loaded");

    hideLoader();

}

// ======================================================
// Part 2 - Marketplace Statistics
// ======================================================

import {

    collection,
    getCountFromServer

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ------------------------------------------------------
// Dashboard Stat Elements
// ------------------------------------------------------

const totalSuppliers =
    document.getElementById("totalSuppliers");

const verifiedSuppliers =
    document.getElementById("verifiedSuppliers");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalProducts =
    document.getElementById("totalProducts");

const totalOrders =
    document.getElementById("totalOrders");

const totalRevenue =
    document.getElementById("totalRevenue");

const pendingApprovals =
    document.getElementById("pendingApprovals");

const activeDeliveries =
    document.getElementById("activeDeliveries");

const customerRating =
    document.getElementById("customerRating");

const completionRate =
    document.getElementById("completionRate");

const activeSuppliers =
    document.getElementById("activeSuppliers");

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function setText(element, value) {

    if (element) {

        element.textContent = value;

    }

}

function formatKES(amount) {

    return "KSh " + Number(amount || 0).toLocaleString();

}

// ------------------------------------------------------
// Load Statistics
// ------------------------------------------------------

async function loadMarketplaceStatistics() {

    try {

        // ---------------- Suppliers ----------------

        const supplierCollection =
            collection(db, "suppliers");

        const supplierCount =
            await getCountFromServer(
                supplierCollection
            );

        setText(
            totalSuppliers,
            supplierCount.data().count
        );

        // ---------------- Verified Suppliers ----------------

        const verifiedQuery = query(

            supplierCollection,

            where("verified", "==", true)

        );

        const verifiedSnapshot =
            await getDocs(verifiedQuery);

        setText(

            verifiedSuppliers,

            verifiedSnapshot.size

        );

        // ---------------- Pending Approvals ----------------

        const pendingQuery = query(

            supplierCollection,

            where("verified", "==", false)

        );

        const pendingSnapshot =
            await getDocs(pendingQuery);

        setText(

            pendingApprovals,

            pendingSnapshot.size

        );

        // ---------------- Customers ----------------

        const customerCollection =
            collection(db, "customers");

        const customerCount =
            await getCountFromServer(
                customerCollection
            );

        setText(

            totalCustomers,

            customerCount.data().count

        );

        // ---------------- Products ----------------

        const productCollection =
            collection(db, "products");

        const productCount =
            await getCountFromServer(
                productCollection
            );

        setText(

            totalProducts,

            productCount.data().count

        );

        // ---------------- Orders ----------------

        const ordersCollection =
            collection(db, "orders");

        const ordersSnapshot =
            await getDocs(ordersCollection);

        setText(

            totalOrders,

            ordersSnapshot.size

        );

        // ---------------- Revenue ----------------

        let revenue = 0;

        let completed = 0;

        let deliveries = 0;

        ordersSnapshot.forEach(doc => {

            const order = doc.data();

            revenue +=
                Number(order.totalAmount || 0);

            if (order.status === "completed") {

                completed++;

            }

            if (order.status === "delivering") {

                deliveries++;

            }

        });

        setText(

            totalRevenue,

            formatKES(revenue)

        );

        setText(

            activeDeliveries,

            deliveries

        );

        // ---------------- Completion Rate ----------------

        const percentage =

            ordersSnapshot.size === 0

            ? 0

            : Math.round(

                (completed /

                ordersSnapshot.size) * 100

            );

        setText(

            completionRate,

            percentage + "%"

        );

        // ---------------- Active Suppliers ----------------

        const activeQuery = query(

            supplierCollection,

            where("status", "==", "active")

        );

        const activeSnapshot =
            await getDocs(activeQuery);

        setText(

            activeSuppliers,

            activeSnapshot.size

        );

        // ---------------- Rating ----------------

        let totalRating = 0;

        let ratingCount = 0;

        ordersSnapshot.forEach(doc => {

            const order = doc.data();

            if (order.rating) {

                totalRating +=
                    Number(order.rating);

                ratingCount++;

            }

        });

        const average =

            ratingCount === 0

            ? 0

            : (

                totalRating /

                ratingCount

            ).toFixed(1);

        setText(

            customerRating,

            "⭐ " + average

        );

        console.log(

            "Marketplace statistics loaded."

        );

    }

    catch (error) {

        console.error(

            "Statistics Error:",

            error

        );

    }

}

// ------------------------------------------------------
// Load After Login
// ------------------------------------------------------

function initializeDashboard() {

    console.log("Admin Dashboard Loaded");

    hideLoader();

    loadMarketplaceStatistics();

    loadDashboardLists();

}

// ======================================================
// Part 3 - Dashboard Tables & Lists
// ======================================================

// ------------------------------------------------------
// DOM Elements
// ------------------------------------------------------

const recentOrdersTable =
    document.getElementById("recentOrdersTable");

const supplierApprovalList =
    document.getElementById("supplierApprovalList");

const recentCustomersList =
    document.getElementById("recentCustomersList");

const deliveryTrackingList =
    document.getElementById("deliveryTrackingList");

const pendingSupplierCount =
    document.getElementById("pendingSupplierCount");

const deliveryCount =
    document.getElementById("deliveryCount");

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function formatDate(timestamp) {

    if (!timestamp) return "-";

    const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

    return date.toLocaleDateString();

}

function orderBadge(status) {

    switch (status) {

        case "completed":
            return '<span class="badge bg-success">Completed</span>';

        case "pending":
            return '<span class="badge bg-warning text-dark">Pending</span>';

        case "cancelled":
            return '<span class="badge bg-danger">Cancelled</span>';

        case "delivering":
            return '<span class="badge bg-primary">Delivering</span>';

        default:
            return '<span class="badge bg-secondary">Unknown</span>';

    }

}

// ------------------------------------------------------
// Recent Orders
// ------------------------------------------------------

async function loadRecentOrders() {

    if (!recentOrdersTable) return;

    try {

        const q = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            recentOrdersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-muted">
                        No orders found.
                    </td>
                </tr>
            `;

            return;

        }

        let html = "";

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            html += `
            <tr>

                <td>${docSnap.id.slice(0,8)}</td>

                <td>${order.customerName || "-"}</td>

                <td>${order.supplierName || "-"}</td>

                <td>KSh ${Number(order.totalAmount || 0).toLocaleString()}</td>

                <td>${orderBadge(order.status)}</td>

            </tr>
            `;

        });

        recentOrdersTable.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Pending Suppliers
// ------------------------------------------------------

async function loadPendingSuppliers() {

    if (!supplierApprovalList) return;

    try {

        const q = query(

            collection(db, "suppliers"),

            where("verified", "==", false),

            limit(8)

        );

        const snapshot = await getDocs(q);

        pendingSupplierCount.textContent =
            `${snapshot.size} Pending`;

        if (snapshot.empty) {

            supplierApprovalList.innerHTML = `
                <div class="list-group-item text-center py-5 text-muted">
                    No suppliers awaiting approval.
                </div>
            `;

            return;

        }

        let html = "";

        snapshot.forEach(docSnap => {

            const supplier = docSnap.data();

            html += `

            <div class="list-group-item">

                <div class="d-flex justify-content-between align-items-center">

                    <div>

                        <strong>

                            ${supplier.businessName || "Business"}

                        </strong>

                        <br>

                        <small class="text-muted">

                            ${supplier.county || ""}

                        </small>

                    </div>

                    <button

                        class="btn btn-success btn-sm approveSupplierBtn"

                        data-id="${docSnap.id}">

                        Review

                    </button>

                </div>

            </div>

            `;

        });

        supplierApprovalList.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Recent Customers
// ------------------------------------------------------

async function loadRecentCustomers() {

    if (!recentCustomersList) return;

    try {

        const q = query(

            collection(db, "customers"),

            orderBy("createdAt", "desc"),

            limit(8)

        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            recentCustomersList.innerHTML = `
            <div class="list-group-item text-center py-5 text-muted">
                No customers found.
            </div>
            `;

            return;

        }

        let html = "";

        snapshot.forEach(docSnap => {

            const customer = docSnap.data();

            html += `

            <div class="list-group-item d-flex justify-content-between align-items-center">

                <div>

                    <strong>

                        ${customer.fullName || "Customer"}

                    </strong>

                    <br>

                    <small class="text-muted">

                        ${customer.email || ""}

                    </small>

                </div>

                <small>

                    ${formatDate(customer.createdAt)}

                </small>

            </div>

            `;

        });

        recentCustomersList.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Active Deliveries
// ------------------------------------------------------

async function loadActiveDeliveries() {

    if (!deliveryTrackingList) return;

    try {

        const q = query(

            collection(db, "orders"),

            where("status", "==", "delivering"),

            limit(8)

        );

        const snapshot = await getDocs(q);

        deliveryCount.textContent =
            `${snapshot.size} Active`;

        if (snapshot.empty) {

            deliveryTrackingList.innerHTML = `
                <div class="list-group-item text-center py-5 text-muted">
                    No active deliveries.
                </div>
            `;

            return;

        }

        let html = "";

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            html += `

            <div class="list-group-item">

                <strong>

                    ${order.customerName || "Customer"}

                </strong>

                <br>

                <small>

                    ${order.deliveryLocation || "Location unavailable"}

                </small>

            </div>

            `;

        });

        deliveryTrackingList.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Load Dashboard Lists
// ------------------------------------------------------

function loadDashboardLists() {

    loadRecentOrders();

    loadPendingSuppliers();

    loadRecentCustomers();

    loadActiveDeliveries();

}

// ======================================================
// Part 4 - Dashboard Charts
// ======================================================

let revenueChart;
let ordersChart;
let supplierChart;
let categoryChart;

// ------------------------------------------------------
// Revenue (Last 6 Months)
// ------------------------------------------------------

async function loadRevenueChart() {

    const canvas = document.getElementById("revenueChart");

    if (!canvas) return;

    try {

        const monthlyRevenue = {};

        const monthNames = [

            "Jan","Feb","Mar",
            "Apr","May","Jun",
            "Jul","Aug","Sep",
            "Oct","Nov","Dec"

        ];

        const snapshot = await getDocs(
            collection(db, "orders")
        );

        snapshot.forEach(doc => {

            const order = doc.data();

            if (
                order.status !== "completed" ||
                !order.createdAt
            ) return;

            const date = order.createdAt.toDate();

            const key =
                monthNames[date.getMonth()];

            if (!monthlyRevenue[key]) {

                monthlyRevenue[key] = 0;

            }

            monthlyRevenue[key] +=
                Number(order.totalAmount || 0);

        });

        const labels = Object.keys(monthlyRevenue);

        const values = Object.values(monthlyRevenue);

        if (revenueChart) {

            revenueChart.destroy();

        }

        revenueChart = new Chart(canvas, {

            type: "line",

            data: {

                labels,

                datasets: [{

                    label: "Revenue (KES)",

                    data: values,

                    tension: .4,

                    fill: true,

                    borderWidth: 3

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Orders by Status
// ------------------------------------------------------

async function loadOrdersChart() {

    const canvas =
        document.getElementById("ordersChart");

    if (!canvas) return;

    try {

        let pending = 0;
        let completed = 0;
        let delivering = 0;
        let cancelled = 0;

        const snapshot = await getDocs(

            collection(db, "orders")

        );

        snapshot.forEach(doc => {

            const order = doc.data();

            switch(order.status){

                case "pending":

                    pending++;

                    break;

                case "completed":

                    completed++;

                    break;

                case "delivering":

                    delivering++;

                    break;

                case "cancelled":

                    cancelled++;

                    break;

            }

        });

        if (ordersChart) {

            ordersChart.destroy();

        }

        ordersChart = new Chart(canvas, {

            type:"doughnut",

            data:{

                labels:[

                    "Pending",

                    "Completed",

                    "Delivering",

                    "Cancelled"

                ],

                datasets:[{

                    data:[

                        pending,

                        completed,

                        delivering,

                        cancelled

                    ]

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        });

    }

    catch(error){

        console.error(error);

    }

}

// ------------------------------------------------------
// Supplier Verification
// ------------------------------------------------------

async function loadSupplierChart(){

    const canvas =
        document.getElementById("supplierChart");

    if(!canvas) return;

    try{

        let verified = 0;
        let pending = 0;

        const snapshot =
            await getDocs(
                collection(db,"suppliers")
            );

        snapshot.forEach(doc=>{

            const supplier = doc.data();

            if(supplier.verified){

                verified++;

            }else{

                pending++;

            }

        });

        if(supplierChart){

            supplierChart.destroy();

        }

        supplierChart = new Chart(canvas,{

            type:"bar",

            data:{

                labels:[

                    "Verified",

                    "Pending"

                ],

                datasets:[{

                    label:"Suppliers",

                    data:[

                        verified,

                        pending

                    ],

                    borderWidth:1

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:false

                    }

                }

            }

        });

    }

    catch(error){

        console.error(error);

    }

}

// ------------------------------------------------------
// Product Categories
// ------------------------------------------------------

async function loadCategoryChart(){

    const canvas =
        document.getElementById("categoryChart");

    if(!canvas) return;

    try{

        const categories={};

        const snapshot=
            await getDocs(
                collection(db,"products")
            );

        snapshot.forEach(doc=>{

            const product=doc.data();

            const category=

                product.category ||

                "Other";

            if(!categories[category]){

                categories[category]=0;

            }

            categories[category]++;

        });

        if(categoryChart){

            categoryChart.destroy();

        }

        categoryChart = new Chart(canvas,{

            type:"pie",

            data:{

                labels:Object.keys(categories),

                datasets:[{

                    data:Object.values(categories)

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        });

    }

    catch(error){

        console.error(error);

    }

}

// ------------------------------------------------------
// Load All Charts
// ------------------------------------------------------

function loadDashboardCharts(){

    loadRevenueChart();

    loadOrdersChart();

    loadSupplierChart();

    loadCategoryChart();

}

// ======================================================
// Part 5 - Dashboard Actions
// ======================================================

import {

    updateDoc,
    deleteDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ------------------------------------------------------
// Approve Supplier
// ------------------------------------------------------

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("approveSupplierBtn")) return;

    const supplierId = event.target.dataset.id;

    if (!confirm("Approve this supplier?")) return;

    try {

        await updateDoc(

            doc(db, "suppliers", supplierId),

            {

                verified: true,

                status: "active",

                approvedAt: new Date()

            }

        );

        alert("Supplier approved successfully.");

        refreshDashboard();

    }

    catch (error) {

        console.error(error);

        alert("Unable to approve supplier.");

    }

});

// ------------------------------------------------------
// Reject Supplier
// ------------------------------------------------------

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("rejectSupplierBtn")) return;

    const supplierId = event.target.dataset.id;

    if (!confirm("Reject this supplier?")) return;

    try {

        await updateDoc(

            doc(db, "suppliers", supplierId),

            {

                verified: false,

                status: "rejected"

            }

        );

        alert("Supplier rejected.");

        refreshDashboard();

    }

    catch (error) {

        console.error(error);

    }

});

// ------------------------------------------------------
// Delete Product
// ------------------------------------------------------

document.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("deleteProductBtn")) return;

    const productId = event.target.dataset.id;

    if (!confirm("Delete this product permanently?")) return;

    try {

        await deleteDoc(

            doc(db, "products", productId)

        );

        alert("Product deleted.");

        refreshDashboard();

    }

    catch (error) {

        console.error(error);

    }

});

// ------------------------------------------------------
// Notification Button
// ------------------------------------------------------

const notificationButton =

    document.getElementById("notificationBtn");

notificationButton?.addEventListener("click", () => {

    alert("Notification center coming soon.");

});

// ------------------------------------------------------
// Refresh Button
// ------------------------------------------------------

const refreshButton =

    document.getElementById("refreshDashboardBtn");

refreshButton?.addEventListener("click", () => {

    refreshDashboard();

});

// ------------------------------------------------------
// Dark Mode
// ------------------------------------------------------

const darkModeButton =

    document.getElementById("darkModeBtn");

darkModeButton?.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const enabled =

        document.body.classList.contains("dark-mode");

    localStorage.setItem(

        "adminDarkMode",

        enabled

    );

});

(function(){

    const enabled =

        localStorage.getItem(

            "adminDarkMode"

        ) === "true";

    if(enabled){

        document.body.classList.add("dark-mode");

    }

})();

// ------------------------------------------------------
// Floating Action Button
// ------------------------------------------------------

const adminFab =

    document.getElementById("adminFab");

adminFab?.addEventListener("click", () => {

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

// ------------------------------------------------------
// Refresh Dashboard
// ------------------------------------------------------

function refreshDashboard(){

    loadMarketplaceStatistics();

    loadDashboardLists();

    loadDashboardCharts();

}

// ------------------------------------------------------
// Auto Refresh
// ------------------------------------------------------

setInterval(() => {

    refreshDashboard();

},60000);

// ------------------------------------------------------
// Window Focus Refresh
// ------------------------------------------------------

window.addEventListener("focus", () => {

    refreshDashboard();

});

// ------------------------------------------------------
// Dashboard Loaded
// ------------------------------------------------------

console.log(

    "Admin Dashboard Actions Ready."

);

// ======================================================
// Part 6 - Realtime Dashboard & Notifications
// ======================================================

import {

    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ------------------------------------------------------
// Elements
// ------------------------------------------------------

const notificationList =
    document.getElementById("notificationList");

const activityTimeline =
    document.getElementById("activityTimeline");

const authStatus =
    document.getElementById("authStatus");

const firestoreStatus =
    document.getElementById("firestoreStatus");

const storageStatus =
    document.getElementById("storageStatus");

const apiStatus =
    document.getElementById("apiStatus");

const overallStatus =
    document.getElementById("overallStatus");

// ------------------------------------------------------
// Firestore Connection Status
// ------------------------------------------------------

function setSystemHealthy(){

    authStatus &&
    (authStatus.textContent = "Online");

    firestoreStatus &&
    (firestoreStatus.textContent = "Online");

    storageStatus &&
    (storageStatus.textContent = "Online");

    apiStatus &&
    (apiStatus.textContent = "Healthy");

    overallStatus &&
    (overallStatus.textContent = "Operational");

}

function setSystemOffline(){

    firestoreStatus &&
    (firestoreStatus.textContent = "Offline");

    apiStatus &&
    (apiStatus.textContent = "Unavailable");

    overallStatus &&
    (overallStatus.textContent = "Attention");

}

// ------------------------------------------------------
// Live Notifications
// ------------------------------------------------------

function startNotificationListener(){

    const q = query(

        collection(db,"notifications"),

        orderBy("createdAt","desc"),

        limit(8)

    );

    onSnapshot(q,(snapshot)=>{

        if(!notificationList) return;

        if(snapshot.empty){

            notificationList.innerHTML=`

            <div class="list-group-item text-center py-5 text-muted">

                No notifications.

            </div>

            `;

            return;

        }

        let html="";

        snapshot.forEach(doc=>{

            const item=doc.data();

            html += `

            <div class="list-group-item">

                <strong>

                    ${item.title || "Notification"}

                </strong>

                <br>

                <small class="text-muted">

                    ${item.message || ""}

                </small>

            </div>

            `;

        });

        notificationList.innerHTML=html;

    },()=>{

        setSystemOffline();

    });

}

// ------------------------------------------------------
// Marketplace Activity
// ------------------------------------------------------

function startActivityListener(){

    const q=query(

        collection(db,"activity"),

        orderBy("createdAt","desc"),

        limit(10)

    );

    onSnapshot(q,(snapshot)=>{

        if(!activityTimeline) return;

        if(snapshot.empty){

            activityTimeline.innerHTML=

            "<li>No recent activity.</li>";

            return;

        }

        let html="";

        snapshot.forEach(doc=>{

            const activity=doc.data();

            html+=`

            <li>

                <strong>

                    ${activity.title || ""}

                </strong>

                <br>

                <small>

                    ${activity.description || ""}

                </small>

            </li>

            `;

        });

        activityTimeline.innerHTML=html;

    });

}

// ------------------------------------------------------
// Live Orders Counter
// ------------------------------------------------------

function listenOrders(){

    onSnapshot(

        collection(db,"orders"),

        ()=>{

            loadMarketplaceStatistics();

            loadRecentOrders();

            loadOrdersChart();

        }

    );

}

// ------------------------------------------------------
// Live Suppliers
// ------------------------------------------------------

function listenSuppliers(){

    onSnapshot(

        collection(db,"suppliers"),

        ()=>{

            loadMarketplaceStatistics();

            loadPendingSuppliers();

            loadSupplierChart();

        }

    );

}

// ------------------------------------------------------
// Live Customers
// ------------------------------------------------------

function listenCustomers(){

    onSnapshot(

        collection(db,"customers"),

        ()=>{

            loadMarketplaceStatistics();

            loadRecentCustomers();

        }

    );

}

// ------------------------------------------------------
// Live Products
// ------------------------------------------------------

function listenProducts(){

    onSnapshot(

        collection(db,"products"),

        ()=>{

            loadMarketplaceStatistics();

            loadCategoryChart();

        }

    );

}

// ------------------------------------------------------
// Dashboard Realtime
// ------------------------------------------------------

function initializeRealtimeDashboard(){

    setSystemHealthy();

    startNotificationListener();

    startActivityListener();

    listenOrders();

    listenSuppliers();

    listenCustomers();

    listenProducts();

    console.log(

        "Realtime listeners started."

    );

}

// ------------------------------------------------------
// Final Initializer
// ------------------------------------------------------

function initializeDashboard(){

    console.log(

        "Admin Dashboard Ready"

    );

    hideLoader();

    loadMarketplaceStatistics();

    loadDashboardLists();

    loadDashboardCharts();

    initializeRealtimeDashboard();

}
