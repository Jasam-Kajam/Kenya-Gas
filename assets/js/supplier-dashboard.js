// ======================================================
// Kenya Gas
// Supplier Dashboard
// Part 1
// ======================================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let currentSupplier = null;

// ======================================================
// DOM ELEMENTS
// ======================================================

const supplierName =
    document.getElementById("supplierName");

const supplierGreeting =
    document.getElementById("supplierGreeting");

const logoutBtn =
    document.getElementById("logoutBtn");

// ======================================================
// AUTHENTICATION
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    await loadSupplier(user.uid);

});

// ======================================================
// LOAD SUPPLIER PROFILE
// ======================================================

async function loadSupplier(uid) {

    try {

        const supplierRef =
            doc(db, "suppliers", uid);

        const supplierSnap =
            await getDoc(supplierRef);

        if (!supplierSnap.exists()) {

            alert("Supplier account not found.");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        currentSupplier = supplierSnap.data();

        // Verify role

        if (currentSupplier.role !== "supplier") {

            alert("Access denied.");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        // Update UI

        supplierName.textContent =
            currentSupplier.businessName;

        supplierGreeting.textContent =
            currentSupplier.businessName;

        console.log(
            "Supplier loaded:",
            currentSupplier
        );

        // ===================================
        // NEXT FUNCTIONS
        // ===================================

        loadDashboard();

        loadMatchingOrders();

        loadInventory();

        loadNotifications();

        loadReviews();

        loadCustomers();

        loadEarnings();

    }

    catch (error) {

        console.error(error);

        alert("Failed to load supplier profile.");

    }

}

// ======================================================
// LOGOUT
// ======================================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "login.html";

        }

        catch (error) {

            console.error(error);

        }

    });

}

// ======================================================
// PLACEHOLDER FUNCTIONS
// (Implemented in later parts)
// ======================================================

function loadDashboard() {}

function loadMatchingOrders() {}

function loadInventory() {}

function loadNotifications() {}

function loadReviews() {}

function loadCustomers() {}

function loadEarnings() {}// ======================================================
// DASHBOARD STATISTICS
// Part 2
// ======================================================

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================
// DASHBOARD ELEMENTS
// ======================================

const todayOrdersEl =
    document.getElementById("todayOrders");

const pendingOrdersEl =
    document.getElementById("pendingOrders");

const completedOrdersEl =
    document.getElementById("completedOrders");

const totalRevenueEl =
    document.getElementById("totalRevenue");

const supplierRatingEl =
    document.getElementById("supplierRating");

const customersServedEl =
    document.getElementById("customersServed");

const stockCountEl =
    document.getElementById("stockCount");

const lowStockItemsEl =
    document.getElementById("lowStockItems");

// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    if (!currentSupplier) return;

    try {

        const ordersQuery = query(
            collection(db, "orders"),
            where(
                "supplierId",
                "==",
                auth.currentUser.uid
            )
        );

        const snapshot =
            await getDocs(ordersQuery);

        let todayOrders = 0;
        let pendingOrders = 0;
        let completedOrders = 0;
        let revenue = 0;

        const today =
            new Date().toDateString();

        snapshot.forEach(doc => {

            const order = doc.data();

            // Today's orders

            if (
                order.createdAt &&
                order.createdAt.toDate().toDateString() === today
            ) {

                todayOrders++;

            }

            // Pending

            if (order.status === "pending") {

                pendingOrders++;

            }

            // Delivered

            if (order.status === "delivered") {

                completedOrders++;

                revenue +=
                    Number(order.totalPrice || 0);

            }

        });

        // Update UI

        todayOrdersEl.textContent =
            todayOrders;

        pendingOrdersEl.textContent =
            pendingOrders;

        completedOrdersEl.textContent =
            completedOrders;

        totalRevenueEl.textContent =
            revenue.toLocaleString();

        supplierRatingEl.textContent =
            `${currentSupplier.rating || 0} ⭐`;

        customersServedEl.textContent =
            currentSupplier.totalOrders || 0;

        // Inventory loaded later

        stockCountEl.textContent = "...";

        lowStockItemsEl.textContent = "...";

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}// ======================================================
// LOAD MATCHING ORDERS
// Part 3
// ======================================================

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const incomingOrdersContainer =
    document.getElementById("incomingOrdersContainer");

const incomingOrderCount =
    document.getElementById("incomingOrderCount");

const newOrdersBadge =
    document.getElementById("newOrdersBadge");

// ======================================
// LOAD MATCHING ORDERS
// ======================================

async function loadMatchingOrders() {

    if (!currentSupplier) return;

    // Supplier must be active

    if (currentSupplier.active === false) {

        incomingOrdersContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    Your business is currently offline.
                </div>
            </div>
        `;

        return;

    }

    // Supplier must be verified

    if (currentSupplier.verified !== true) {

        incomingOrdersContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Your supplier account has not yet been verified.
                </div>
            </div>
        `;

        return;

    }

    try {

        incomingOrdersContainer.innerHTML = `
            <div class="col-12 text-center">

                Loading nearby orders...

            </div>
        `;

        const ordersQuery = query(
            collection(db, "orders"),
            where("status", "==", "pending")
        );

        const snapshot =
            await getDocs(ordersQuery);

        incomingOrdersContainer.innerHTML = "";

        let matches = 0;

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            // Already accepted

            if (order.supplierId) return;

            // County mismatch

            if (
                order.county !==
                currentSupplier.county
            ) return;

            // Town mismatch

            if (
                order.town !==
                currentSupplier.town
            ) return;

            matches++;

            incomingOrdersContainer.innerHTML += `

            <div class="col-lg-6">

                <div class="card shadow-sm border-0">

                    <div class="card-body">

                        <div class="d-flex justify-content-between">

                            <h5>

                                ${order.customerName}

                            </h5>

                            <span class="badge bg-warning">

                                Pending

                            </span>

                        </div>

                        <hr>

                        <p>

                            <strong>Gas:</strong>

                            ${order.gasType}

                        </p>

                        <p>

                            <strong>Quantity:</strong>

                            ${order.quantity}

                        </p>

                        <p>

                            <strong>Location:</strong>

                            ${order.address}

                        </p>

                        <p>

                            <strong>Total:</strong>

                            KES ${Number(order.totalPrice).toLocaleString()}

                        </p>

                        <div class="d-grid gap-2 mt-3">

                            <button
                                class="btn btn-success accept-order"
                                data-id="${docSnap.id}">

                                Accept Order

                            </button>

                            <button
                                class="btn btn-outline-danger reject-order"
                                data-id="${docSnap.id}">

                                Reject

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            `;

        });

        if (matches === 0) {

            incomingOrdersContainer.innerHTML = `
                <div class="col-12">

                    <div class="alert alert-info">

                        No matching orders available.

                    </div>

                </div>
            `;

        }

        incomingOrderCount.textContent =
            `${matches} Orders`;

        newOrdersBadge.textContent =
            matches;

    }

    catch (error) {

        console.error(error);

    }

}// ======================================================
// PART 4
// ACCEPT / REJECT ORDERS
// ======================================================

import {
    doc,
    runTransaction,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================
// BUTTON EVENTS
// ======================================

document.addEventListener("click", async (e) => {

    // -------------------------------
    // ACCEPT
    // -------------------------------

    if (e.target.classList.contains("accept-order")) {

        const orderId = e.target.dataset.id;

        await acceptOrder(orderId);

    }

    // -------------------------------
    // REJECT
    // -------------------------------

    if (e.target.classList.contains("reject-order")) {

        const orderId = e.target.dataset.id;

        await rejectOrder(orderId);

    }

});

// ======================================================
// ACCEPT ORDER (TRANSACTION)
// ======================================================

async function acceptOrder(orderId) {

    try {

        const orderRef =
            doc(db, "orders", orderId);

        await runTransaction(db, async (transaction) => {

            const orderSnap =
                await transaction.get(orderRef);

            if (!orderSnap.exists()) {

                throw new Error("Order no longer exists.");

            }

            const order =
                orderSnap.data();

            // Already taken

            if (
                order.status !== "pending" ||
                order.supplierId
            ) {

                throw new Error(
                    "This order has already been accepted."
                );

            }

            // Assign supplier

            transaction.update(orderRef, {

                supplierId:
                    auth.currentUser.uid,

                supplierName:
                    currentSupplier.businessName,

                supplierPhone:
                    currentSupplier.phone,

                status:
                    "accepted",

                acceptedAt:
                    serverTimestamp()

            });

        });

        alert("Order accepted successfully.");

        loadMatchingOrders();

        loadDashboard();

    }

    catch (error) {

        alert(error.message);

        console.error(error);

    }

}

// ======================================================
// REJECT ORDER
// ======================================================

async function rejectOrder(orderId) {

    const confirmed =
        confirm("Reject this order?");

    if (!confirmed) return;

    try {

        const orderRef =
            doc(db, "orders", orderId);

        await updateDoc(orderRef, {

            rejectedBy: auth.currentUser.uid,

            rejectedAt: serverTimestamp()

        });

        alert("Order rejected.");

        loadMatchingOrders();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}// ======================================================
// PART 5
// DELIVERY MANAGEMENT
// ======================================================

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const deliveryTableBody =
    document.getElementById("deliveryTableBody");

// ======================================
// LOAD ACCEPTED ORDERS
// ======================================

async function loadDeliveries() {

    if (!currentSupplier) return;

    try {

        const q = query(

            collection(db, "orders"),

            where(
                "supplierId",
                "==",
                auth.currentUser.uid
            )

        );

        const snapshot =
            await getDocs(q);

        deliveryTableBody.innerHTML = "";

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            if (
                order.status === "pending"
            ) return;

            deliveryTableBody.innerHTML += `

<tr>

<td>

${docSnap.id.substring(0,8)}

</td>

<td>

${order.customerName}

</td>

<td>

${order.gasType}

</td>

<td>

${order.town}

</td>

<td>

<span class="badge bg-primary">

${formatStatus(order.status)}

</span>

</td>

<td>

<div class="btn-group">

<button

class="btn btn-success btn-sm next-status"

data-id="${docSnap.id}"

data-status="${order.status}">

Next

</button>

</div>

</td>

</tr>

`;

        });

        if (deliveryTableBody.innerHTML === "") {

            deliveryTableBody.innerHTML = `

<tr>

<td colspan="6" class="text-center text-muted">

No active deliveries.

</td>

</tr>

`;

        }

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// STATUS BUTTON
// ======================================

document.addEventListener("click", async (e)=>{

    if(!e.target.classList.contains("next-status")) return;

    const orderId =
        e.target.dataset.id;

    const currentStatus =
        e.target.dataset.status;

    await updateDeliveryStatus(
        orderId,
        currentStatus
    );

});

// ======================================
// UPDATE STATUS
// ======================================

async function updateDeliveryStatus(

    orderId,

    currentStatus

){

    let nextStatus = currentStatus;

    switch(currentStatus){

        case "accepted":

            nextStatus =
                "preparing";

            break;

        case "preparing":

            nextStatus =
                "out_for_delivery";

            break;

        case "out_for_delivery":

            nextStatus =
                "delivered";

            break;

        default:

            return;

    }

    try{

        const orderRef =
            doc(db,"orders",orderId);

        const updates = {

            status:
                nextStatus

        };

        if(nextStatus==="preparing"){

            updates.preparingAt =
                serverTimestamp();

        }

        if(nextStatus==="out_for_delivery"){

            updates.dispatchedAt =
                serverTimestamp();

        }

        if(nextStatus==="delivered"){

            updates.deliveredAt =
                serverTimestamp();

        }

        await updateDoc(

            orderRef,

            updates

        );

        loadDeliveries();

        loadDashboard();

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// FORMAT STATUS
// ======================================

function formatStatus(status){

    switch(status){

        case "accepted":

            return "Accepted";

        case "preparing":

            return "Preparing";

        case "out_for_delivery":

            return "Out for Delivery";

        case "delivered":

            return "Delivered";

        default:

            return status;

    }

}

// ======================================
// LOAD ON STARTUP
// ======================================

const refreshDeliveries =
    document.getElementById("refreshDeliveries");

if(refreshDeliveries){

    refreshDeliveries.addEventListener(

        "click",

        loadDeliveries

    );

}// ======================================================
// PART 6
// INVENTORY MANAGEMENT
// ======================================================

import {
    collection,
    doc,
    getDocs,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================
// DOM ELEMENTS
// ======================================

const inventoryContainer =
    document.getElementById("inventoryContainer");

const stockCount =
    document.getElementById("stockCount");

const lowStockItems =
    document.getElementById("lowStockItems");

// ======================================
// LOAD INVENTORY
// ======================================

async function loadInventory() {

    if (!currentSupplier) return;

    try {

        const inventoryRef = collection(
            db,
            "suppliers",
            auth.currentUser.uid,
            "inventory"
        );

        const snapshot =
            await getDocs(inventoryRef);

        inventoryContainer.innerHTML = "";

        let totalItems = 0;

        let lowStock = 0;

        snapshot.forEach(docSnap => {

            const item = docSnap.data();

            totalItems += Number(item.stock);

            if (item.stock <= 5) {

                lowStock++;

            }

            inventoryContainer.innerHTML += `

<div class="col-md-6 col-lg-4 mb-3">

<div class="card shadow-sm">

<div class="card-body">

<h5>

${item.gasType}

</h5>

<p>

Stock:
<strong>

${item.stock}

</strong>

</p>

<p>

Price:
<strong>

KES ${Number(item.price).toLocaleString()}

</strong>

</p>

<div class="input-group">

<input

type="number"

min="0"

value="${item.stock}"

class="form-control"

id="stock-${docSnap.id}">

<button

class="btn btn-success update-stock"

data-id="${docSnap.id}">

Save

</button>

</div>

</div>

</div>

</div>

`;

        });

        stockCount.textContent =
            totalItems;

        lowStockItems.textContent =
            lowStock;

        if (snapshot.empty) {

            inventoryContainer.innerHTML = `

<div class="col-12">

<div class="alert alert-warning">

No inventory found.

</div>

</div>

`;

        }

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// UPDATE STOCK
// ======================================

document.addEventListener("click", async (e)=>{

    if(!e.target.classList.contains("update-stock")) return;

    const itemId =
        e.target.dataset.id;

    const stockInput =
        document.getElementById(`stock-${itemId}`);

    const stock =
        Number(stockInput.value);

    await updateInventory(

        itemId,

        stock

    );

});

// ======================================
// SAVE INVENTORY
// ======================================

async function updateInventory(

    itemId,

    stock

){

    try{

        const ref = doc(

            db,

            "suppliers",

            auth.currentUser.uid,

            "inventory",

            itemId

        );

        await setDoc(

            ref,

            {

                stock,

                updatedAt:
                    serverTimestamp()

            },

            {

                merge:true

            }

        );

        loadInventory();

        loadDashboard();

        alert("Inventory updated.");

    }

    catch(error){

        console.error(error);

    }

}// ======================================================
// PART 7
// EARNINGS • CUSTOMERS • REVIEWS • NOTIFICATIONS
// ======================================================

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// DOM ELEMENTS
// ======================================================

const earningsContainer =
    document.getElementById("earningsContainer");

const customersContainer =
    document.getElementById("customersContainer");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const notificationsContainer =
    document.getElementById("notificationsContainer");

// ======================================================
// LOAD EARNINGS
// ======================================================

async function loadEarnings() {

    if (!currentSupplier) return;

    try {

        const q = query(
            collection(db, "orders"),
            where(
                "supplierId",
                "==",
                auth.currentUser.uid
            ),
            where(
                "status",
                "==",
                "delivered"
            )
        );

        const snapshot =
            await getDocs(q);

        let totalRevenue = 0;

        let totalOrders = 0;

        earningsContainer.innerHTML = "";

        snapshot.forEach(docSnap => {

            const order =
                docSnap.data();

            totalRevenue +=
                Number(order.totalPrice || 0);

            totalOrders++;

        });

        earningsContainer.innerHTML = `

<div class="card shadow-sm border-0">

<div class="card-body">

<h5>Total Revenue</h5>

<h2 class="text-success">

KES ${totalRevenue.toLocaleString()}

</h2>

<p class="text-muted mb-0">

Delivered Orders:
${totalOrders}

</p>

</div>

</div>

`;

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// LOAD CUSTOMERS
// ======================================================

async function loadCustomers() {

    if (!currentSupplier) return;

    try {

        const q = query(

            collection(db,"orders"),

            where(
                "supplierId",
                "==",
                auth.currentUser.uid
            )

        );

        const snapshot =
            await getDocs(q);

        const customers =
            new Map();

        snapshot.forEach(docSnap=>{

            const order =
                docSnap.data();

            customers.set(

                order.customerId,

                {

                    name:
                        order.customerName,

                    phone:
                        order.customerPhone

                }

            );

        });

        customersContainer.innerHTML = "";

        customers.forEach(customer=>{

            customersContainer.innerHTML +=`

<div class="list-group-item">

<strong>

${customer.name}

</strong>

<br>

<small>

${customer.phone}

</small>

</div>

`;

        });

        if(customers.size===0){

            customersContainer.innerHTML=`

<div class="text-muted">

No customers yet.

</div>

`;

        }

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// LOAD REVIEWS
// ======================================================

async function loadReviews(){

    if(!currentSupplier) return;

    try{

        const q=query(

            collection(db,"reviews"),

            where(
                "supplierId",
                "==",
                auth.currentUser.uid
            ),

            orderBy("createdAt","desc"),

            limit(20)

        );

        const snapshot=
            await getDocs(q);

        reviewsContainer.innerHTML="";

        snapshot.forEach(docSnap=>{

            const review=
                docSnap.data();

            reviewsContainer.innerHTML+=`

<div class="card mb-3">

<div class="card-body">

<h6>

${review.customerName}

</h6>

<div class="text-warning mb-2">

${"⭐".repeat(review.rating)}

</div>

<p>

${review.review}

</p>

</div>

</div>

`;

        });

        if(snapshot.empty){

            reviewsContainer.innerHTML=`

<div class="text-muted">

No reviews available.

</div>

`;

        }

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// LOAD NOTIFICATIONS
// ======================================================

async function loadNotifications(){

    if(!currentSupplier) return;

    try{

        const q=query(

            collection(db,"notifications"),

            where(
                "userId",
                "==",
                auth.currentUser.uid
            ),

            orderBy("createdAt","desc"),

            limit(20)

        );

        const snapshot=
            await getDocs(q);

        notificationsContainer.innerHTML="";

        snapshot.forEach(docSnap=>{

            const note=
                docSnap.data();

            notificationsContainer.innerHTML+=`

<div class="list-group-item">

<h6>

${note.title}

</h6>

<p class="mb-1">

${note.message}

</p>

<small class="text-muted">

${note.createdAt
? note.createdAt.toDate().toLocaleString()
: ""}

</small>

</div>

`;

        });

        if(snapshot.empty){

            notificationsContainer.innerHTML=`

<div class="text-center text-muted">

No notifications.

</div>

`;

        }

    }

    catch(error){

        console.error(error);

    }

}// ======================================================
// PART 8
// ANALYTICS • SETTINGS • INITIALIZATION
// ======================================================

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// DOM ELEMENTS
// ======================================================

const salesChartCanvas =
    document.getElementById("salesChart");

const saveBusinessBtn =
    document.getElementById("saveBusinessBtn");

const businessNameInput =
    document.getElementById("businessName");

const supplierPhoneInput =
    document.getElementById("supplierPhone");

const businessAddressInput =
    document.getElementById("businessAddress");

let salesChart = null;

// ======================================================
// LOAD SALES ANALYTICS
// ======================================================

async function loadAnalytics() {

    if (!currentSupplier) return;

    if (!salesChartCanvas) return;

    try {

        const q = query(
            collection(db, "orders"),
            where(
                "supplierId",
                "==",
                auth.currentUser.uid
            ),
            where(
                "status",
                "==",
                "delivered"
            )
        );

        const snapshot =
            await getDocs(q);

        const monthlyRevenue = {};

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            if (!order.deliveredAt) return;

            const date =
                order.deliveredAt.toDate();

            const month =
                date.toLocaleString(
                    "default",
                    { month: "short" }
                );

            monthlyRevenue[month] =
                (monthlyRevenue[month] || 0)
                + Number(order.totalPrice || 0);

        });

        const labels =
            Object.keys(monthlyRevenue);

        const values =
            Object.values(monthlyRevenue);

        if (salesChart) {

            salesChart.destroy();

        }

        salesChart = new Chart(

            salesChartCanvas,

            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            label: "Revenue (KES)",

                            data: values

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false

                }

            }

        );

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================================
// LOAD BUSINESS SETTINGS
// ======================================================

function loadBusinessSettings() {

    if (!currentSupplier) return;

    if (businessNameInput)
        businessNameInput.value =
            currentSupplier.businessName || "";

    if (supplierPhoneInput)
        supplierPhoneInput.value =
            currentSupplier.phone || "";

    if (businessAddressInput)
        businessAddressInput.value =
            currentSupplier.address || "";

}

// ======================================================
// SAVE BUSINESS SETTINGS
// ======================================================

if (saveBusinessBtn) {

    saveBusinessBtn.addEventListener(

        "click",

        saveBusinessSettings

    );

}

async function saveBusinessSettings() {

    try {

        const supplierRef = doc(
            db,
            "suppliers",
            auth.currentUser.uid
        );

        await updateDoc(supplierRef, {

            businessName:
                businessNameInput.value.trim(),

            phone:
                supplierPhoneInput.value.trim(),

            address:
                businessAddressInput.value.trim()

        });

        alert(
            "Business information updated."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to update business information."
        );

    }

}

// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(() => {

    if (!auth.currentUser) return;

    loadDashboard();

    loadMatchingOrders();

    loadDeliveries();

    loadInventory();

    loadNotifications();

}, 60000);

// ======================================================
// INITIALIZATION
// ======================================================

function initializeDashboard() {

    loadBusinessSettings();

    loadDashboard();

    loadMatchingOrders();

    loadDeliveries();

    loadInventory();

    loadCustomers();

    loadReviews();

    loadNotifications();

    loadEarnings();

    loadAnalytics();

}
