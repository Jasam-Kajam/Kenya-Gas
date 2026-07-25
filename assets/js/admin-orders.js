// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// assets/js/admin-orders.js
// Part 1 - Foundation
// ======================================================

// ======================================================
// Firebase
// ======================================================

import { app } from "./firebase.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    addDoc,
    deleteDoc,
    serverTimestamp,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// Firebase Services
// ======================================================

const auth = getAuth(app);

const db = getFirestore(app);

// ======================================================
// Firestore Collections
// ======================================================

const ordersRef = collection(db, "orders");

const customersRef = collection(db, "customers");

const suppliersRef = collection(db, "suppliers");

const adminsRef = collection(db, "admins");

const auditLogsRef = collection(db, "auditLogs");

// ======================================================
// Global Variables
// ======================================================

let currentAdmin = null;

let orders = [];

let filteredOrders = [];

let customers = [];

let suppliers = [];

let selectedOrder = null;

let unsubscribeOrders = null;

const ORDERS_PER_PAGE = 10;

let currentPage = 1;

// ======================================================
// Cached DOM Elements
// ======================================================

// Loading

const loadingOverlay =
    document.getElementById("loadingOverlay");

// Header

const topAdminName =
    document.getElementById("topAdminName");

const topAdminPhoto =
    document.getElementById("topAdminPhoto");

// Statistics

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const completedOrders =
    document.getElementById("completedOrders");

const cancelledOrders =
    document.getElementById("cancelledOrders");

// Table

const ordersTableBody =
    document.getElementById("ordersTableBody");

const orderCountBadge =
    document.getElementById("orderCountBadge");

// Scroll Button

const scrollTopBtn =
    document.getElementById("scrollTopBtn");

// Logout

const topLogoutBtn =
    document.getElementById("topLogoutBtn");

const confirmLogoutBtn =
    document.getElementById("confirmLogoutBtn");

// Offline Banner

const offlineBanner =
    document.getElementById("offlineBanner");

// ======================================================
// Loading Overlay
// ======================================================

function showLoader() {

    loadingOverlay?.classList.remove("d-none");

}

function hideLoader() {

    loadingOverlay?.classList.add("d-none");

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

        const adminSnapshot = await getDoc(

            doc(db, "admins", user.uid)

        );

        if (!adminSnapshot.exists()) {

            alert("Administrator access denied.");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        currentAdmin = {

            uid: user.uid,

            email: user.email,

            ...adminSnapshot.data()

        };

        initializeAdminPage();

    }

    catch (error) {

        console.error(error);

        alert("Unable to verify administrator.");

    }

});

// ======================================================
// Initialize Page
// ======================================================

async function initializeAdminPage() {

    showLoader();

    try {

        loadAdministratorProfile();

        await Promise.all([

            loadCustomers(),

            loadSuppliers()

        ]);

        startOrdersListener();

        registerEventListeners();

    }

    catch (error) {

        console.error(error);

    }

    finally {

        hideLoader();

    }

}

// ======================================================
// Administrator Profile
// ======================================================

function loadAdministratorProfile() {

    if (topAdminName) {

        topAdminName.textContent =

            currentAdmin.fullName ||

            currentAdmin.name ||

            "Administrator";

    }

    if (

        topAdminPhoto &&

        currentAdmin.photoURL

    ) {

        topAdminPhoto.src =

            currentAdmin.photoURL;

    }

}

// ======================================================
// Common Utility Functions
// ======================================================

function escapeHtml(text = "") {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

function formatCurrency(amount = 0) {

    return new Intl.NumberFormat(

        "en-KE",

        {

            style: "currency",

            currency: "KES"

        }

    ).format(Number(amount));

}

function formatDate(value) {

    if (!value) return "-";

    const date = value.toDate

        ? value.toDate()

        : new Date(value);

    return new Intl.DateTimeFormat(

        "en-KE",

        {

            dateStyle: "medium",

            timeStyle: "short"

        }

    ).format(date);

}

function generateOrderNumber() {

    return "KGM-" +

        Date.now()

        .toString()

        .slice(-8);

}

function getTimestamp() {

    return serverTimestamp();

}

// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// Part 2 - Data Layer
// ======================================================

// ======================================================
// Load Customers
// ======================================================

async function loadCustomers() {

    try {

        const snapshot = await getDocs(customersRef);

        customers = snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()

        }));

    }

    catch (error) {

        console.error(

            "Customers:",

            error

        );

        showErrorToast(

            "Unable to load customers."

        );

    }

}

// ======================================================
// Load Suppliers
// ======================================================

async function loadSuppliers() {

    try {

        const snapshot = await getDocs(suppliersRef);

        suppliers = snapshot.docs.map(doc => ({

            id: doc.id,

            ...doc.data()

        }));

    }

    catch (error) {

        console.error(

            "Suppliers:",

            error

        );

        showErrorToast(

            "Unable to load suppliers."

        );

    }

}

// ======================================================
// Real-time Orders Listener
// ======================================================

function startOrdersListener() {

    if (unsubscribeOrders) {

        unsubscribeOrders();

    }

    const ordersQuery = query(

        ordersRef,

        orderBy(

            "createdAt",

            "desc"

        )

    );

    unsubscribeOrders = onSnapshot(

        ordersQuery,

        snapshot => {

            orders = snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }));

            filteredOrders = [...orders];

            updateDashboardStatistics();

            refreshOrdersTable();

        },

        error => {

            console.error(error);

            showErrorToast(

                "Unable to load orders."

            );

        }

    );

}

// ======================================================
// Dashboard Statistics
// ======================================================

function updateDashboardStatistics() {

    totalOrders.textContent =

        orders.length;

    pendingOrders.textContent =

        orders.filter(order =>

            order.status === "pending"

        ).length;

    completedOrders.textContent =

        orders.filter(order =>

            order.status === "completed"

        ).length;

    cancelledOrders.textContent =

        orders.filter(order =>

            order.status === "cancelled"

        ).length;

    orderCountBadge.textContent =

        `${filteredOrders.length} Orders`;

}

// ======================================================
// Refresh Table
// ======================================================

function refreshOrdersTable() {

    renderOrdersTable();

    updatePagination();

}

// ======================================================
// Lookup Helpers
// ======================================================

function findOrder(orderId) {

    return orders.find(

        order =>

            order.id === orderId

    );

}

function findCustomer(customerId) {

    return customers.find(

        customer =>

            customer.id === customerId

    );

}

function findSupplier(supplierId) {

    return suppliers.find(

        supplier =>

            supplier.id === supplierId

    );

}

// ======================================================
// Display Helpers
// ======================================================

function getCustomerName(customerId) {

    const customer =

        findCustomer(customerId);

    return customer

        ? customer.fullName ||

          customer.name ||

          customer.email ||

          "-"

        : "-";

}

function getSupplierName(supplierId) {

    const supplier =

        findSupplier(supplierId);

    return supplier

        ? supplier.businessName ||

          supplier.shopName ||

          supplier.name ||

          "-"

        : "-";

}

// ======================================================
// Status Badges
// ======================================================

function getOrderBadge(status = "") {

    const colours = {

        pending: "warning",

        confirmed: "info",

        processing: "primary",

        out_for_delivery: "secondary",

        completed: "success",

        cancelled: "danger"

    };

    return `

<span class="badge bg-${colours[status] || "dark"}">

${status.replaceAll("_", " ")}

</span>

`;

}

function getPaymentBadge(status = "") {

    const colours = {

        paid: "success",

        pending: "warning",

        failed: "danger",

        refunded: "info"

    };

    return `

<span class="badge bg-${colours[status] || "secondary"}">

${status}

</span>

`;

}

function getDeliveryBadge(status = "") {

    const colours = {

        pending: "warning",

        assigned: "primary",

        in_transit: "info",

        delivered: "success"

    };

    return `

<span class="badge bg-${colours[status] || "secondary"}">

${status.replaceAll("_", " ")}

</span>

`;

}

// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// Part 3 - Orders Table Rendering
// ======================================================

// ======================================================
// Render Orders Table
// ======================================================

function renderOrdersTable() {

    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = "";

    if (!filteredOrders.length) {

        ordersTableBody.innerHTML = `

<tr>

<td colspan="10" class="text-center py-5">

<i class="bi bi-inbox display-4 text-muted"></i>

<p class="mt-3 mb-0 text-muted">

No orders found.

</p>

</td>

</tr>

`;

        orderCountBadge.textContent = "0 Orders";

        return;

    }

    const start =

        (currentPage - 1) *

        ORDERS_PER_PAGE;

    const end =

        start +

        ORDERS_PER_PAGE;

    const pageOrders =

        filteredOrders.slice(

            start,

            end

        );

    pageOrders.forEach(order => {

        ordersTableBody.insertAdjacentHTML(

            "beforeend",

            createOrderRow(order)

        );

    });

    updateSelectedLabel();

    updatePaginationInfo();

}

// ======================================================
// Create Table Row
// ======================================================

function createOrderRow(order) {

    return `

<tr>

<td>

<input

type="checkbox"

class="form-check-input order-checkbox"

value="${order.id}"

>

</td>

<td>

<strong>

${escapeHtml(

order.orderNumber ||

order.id

)}

</strong>

</td>

<td>

${escapeHtml(

getCustomerName(

order.customerId

)

)}

</td>

<td>

${escapeHtml(

getSupplierName(

order.supplierId

)

)}

</td>

<td>

${formatCurrency(

order.totalAmount ||

0

)}

</td>

<td>

${getPaymentBadge(

order.paymentStatus ||

"pending"

)}

</td>

<td>

${getDeliveryBadge(

order.deliveryStatus ||

"pending"

)}

</td>

<td>

${getOrderBadge(

order.status ||

"pending"

)}

</td>

<td>

${formatDate(

order.createdAt

)}

</td>

<td class="text-center">

<div class="btn-group btn-group-sm">

<button

class="btn btn-outline-primary"

title="View Order"

onclick="openOrderDetails('${order.id}')">

<i class="bi bi-eye"></i>

</button>

<button

class="btn btn-outline-success"

title="Confirm"

onclick="quickConfirmOrder('${order.id}')">

<i class="bi bi-check-circle"></i>

</button>

<button

class="btn btn-outline-danger"

title="Cancel"

onclick="quickCancelOrder('${order.id}')">

<i class="bi bi-x-circle"></i>

</button>

</div>

</td>

</tr>

`;

}

// ======================================================
// Pagination Information
// ======================================================

function updatePaginationInfo() {

    const paginationInfo =

        document.getElementById(

            "paginationInfo"

        );

    if (!paginationInfo) return;

    const start =

        filteredOrders.length

        ? ((currentPage - 1)

        * ORDERS_PER_PAGE) + 1

        : 0;

    const end =

        Math.min(

            currentPage *

            ORDERS_PER_PAGE,

            filteredOrders.length

        );

    paginationInfo.textContent =

        `Showing ${start} - ${end} of ${filteredOrders.length} orders`;

}

// ======================================================
// Selected Orders Label
// ======================================================

function updateSelectedLabel() {

    const label =

        document.getElementById(

            "selectedOrdersLabel"

        );

    if (!label) return;

    const selected =

        document.querySelectorAll(

            ".order-checkbox:checked"

        ).length;

    label.textContent =

        `${selected} Selected`;

}

// ======================================================
// Checkbox Events
// ======================================================

document.addEventListener(

    "change",

    event => {

        if (

            event.target.classList.contains(

                "order-checkbox"

            )

        ) {

            updateSelectedLabel();

        }

    }

);

// ======================================================
// Quick View
// ======================================================

window.openOrderDetails = function(orderId) {

    const order =

        findOrder(orderId);

    if (!order) {

        showErrorToast(

            "Order not found."

        );

        return;

    }

    selectedOrder = order;

    populateOrderModal(order);

    bootstrap.Modal

        .getOrCreateInstance(

            document.getElementById(

                "orderDetailsModal"

            )

        )

        .show();

};

// ======================================================
// Quick Confirm
// ======================================================

window.quickConfirmOrder = function(orderId) {

    const order =

        findOrder(orderId);

    if (!order) return;

    selectedOrder = order;

    confirmSelectedOrder();

};

// ======================================================
// Quick Cancel
// ======================================================

window.quickCancelOrder = function(orderId) {

    const order =

        findOrder(orderId);

    if (!order) return;

    selectedOrder = order;

    cancelSelectedOrder();

};

// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// Part 4 - Search, Filters & Pagination
// ======================================================

// ======================================================
// DOM Elements
// ======================================================

const orderSearch =
    document.getElementById("orderSearch");

const statusFilter =
    document.getElementById("statusFilter");

const paymentFilter =
    document.getElementById("paymentFilter");

const deliveryFilter =
    document.getElementById("deliveryFilter");

const fromDate =
    document.getElementById("fromDate");

const resetFilters =
    document.getElementById("resetFilters");

const refreshOrdersBtn =
    document.getElementById("refreshOrdersBtn");

const selectAllOrders =
    document.getElementById("selectAllOrders");

const ordersPagination =
    document.getElementById("ordersPagination");

const paginationInfo =
    document.getElementById("paginationInfo");

const selectedOrdersLabel =
    document.getElementById("selectedOrdersLabel");

// ======================================================
// Register Events
// ======================================================

function registerEventListeners() {

    orderSearch?.addEventListener(
        "input",
        applyFilters
    );

    statusFilter?.addEventListener(
        "change",
        applyFilters
    );

    paymentFilter?.addEventListener(
        "change",
        applyFilters
    );

    deliveryFilter?.addEventListener(
        "change",
        applyFilters
    );

    fromDate?.addEventListener(
        "change",
        applyFilters
    );

    resetFilters?.addEventListener(
        "click",
        resetAllFilters
    );

    refreshOrdersBtn?.addEventListener(
        "click",
        () => {

            showInfoToast(
                "Refreshing orders..."
            );

            startOrdersListener();

        }
    );

    selectAllOrders?.addEventListener(
        "change",
        toggleSelectAllOrders
    );

}

// ======================================================
// Apply Filters
// ======================================================

function applyFilters() {

    const keyword =
        orderSearch.value
        .trim()
        .toLowerCase();

    filteredOrders = orders.filter(order => {

        const customer =
            getCustomerName(
                order.customerId
            ).toLowerCase();

        const supplier =
            getSupplierName(
                order.supplierId
            ).toLowerCase();

        const orderNumber =
            (order.orderNumber || order.id)
            .toLowerCase();

        const searchMatch =

            keyword === "" ||

            orderNumber.includes(keyword) ||

            customer.includes(keyword) ||

            supplier.includes(keyword);

        const statusMatch =

            statusFilter.value === "" ||

            order.status ===
            statusFilter.value;

        const paymentMatch =

            paymentFilter.value === "" ||

            order.paymentStatus ===
            paymentFilter.value;

        const deliveryMatch =

            deliveryFilter.value === "" ||

            order.deliveryStatus ===
            deliveryFilter.value;

        let dateMatch = true;

        if (
            fromDate.value &&
            order.createdAt
        ) {

            const orderDate =

                order.createdAt.toDate

                ? order.createdAt.toDate()

                : new Date(order.createdAt);

            dateMatch =

                orderDate >=

                new Date(fromDate.value);

        }

        return (

            searchMatch &&

            statusMatch &&

            paymentMatch &&

            deliveryMatch &&

            dateMatch

        );

    });

    currentPage = 1;

    refreshOrdersTable();

}

// ======================================================
// Reset Filters
// ======================================================

function resetAllFilters() {

    orderSearch.value = "";

    statusFilter.value = "";

    paymentFilter.value = "";

    deliveryFilter.value = "";

    fromDate.value = "";

    filteredOrders = [...orders];

    currentPage = 1;

    refreshOrdersTable();

}

// ======================================================
// Pagination
// ======================================================

function updatePagination() {

    if (!ordersPagination) return;

    ordersPagination.innerHTML = "";

    const totalPages = Math.max(

        1,

        Math.ceil(

            filteredOrders.length /

            ORDERS_PER_PAGE

        )

    );

    for (

        let page = 1;

        page <= totalPages;

        page++

    ) {

        ordersPagination.insertAdjacentHTML(

            "beforeend",

            `

<li class="page-item ${page===currentPage?"active":""}">

<button
class="page-link"
data-page="${page}">

${page}

</button>

</li>

`

        );

    }

    ordersPagination

        .querySelectorAll(".page-link")

        .forEach(button => {

            button.onclick = () => {

                currentPage = Number(

                    button.dataset.page

                );

                renderOrdersTable();

                updatePagination();

            };

        });

}

// ======================================================
// Select All
// ======================================================

function toggleSelectAllOrders() {

    document

        .querySelectorAll(

            ".order-checkbox"

        )

        .forEach(box => {

            box.checked =

                selectAllOrders.checked;

        });

    updateSelectedLabel();

}

// ======================================================
// Selected Orders
// ======================================================

function getSelectedOrders() {

    return [

        ...document.querySelectorAll(

            ".order-checkbox:checked"

        )

    ].map(box => box.value);

}

// ======================================================
// Selected Counter
// ======================================================

function updateSelectedLabel() {

    if (!selectedOrdersLabel) return;

    selectedOrdersLabel.textContent =

        `${getSelectedOrders().length} Selected`;

}

// ======================================================
// Synchronize Select All
// ======================================================

document.addEventListener(

    "change",

    event => {

        if (

            !event.target.classList.contains(

                "order-checkbox"

            )

        ) return;

        const all =

            document.querySelectorAll(

                ".order-checkbox"

            );

        const checked =

            document.querySelectorAll(

                ".order-checkbox:checked"

            );

        if (selectAllOrders) {

            selectAllOrders.checked =

                all.length > 0 &&

                all.length === checked.length;

        }

        updateSelectedLabel();

    }

);

// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// Part 5 - Order Details Modal
// ======================================================

// ======================================================
// Modal Elements
// ======================================================

const orderDetailsModal =
    document.getElementById("orderDetailsModal");

const modalOrderId =
    document.getElementById("modalOrderId");

const modalOrderStatus =
    document.getElementById("modalOrderStatus");

const modalPaymentStatus =
    document.getElementById("modalPaymentStatus");

const modalDeliveryStatus =
    document.getElementById("modalDeliveryStatus");

const customerName =
    document.getElementById("customerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");

const customerCounty =
    document.getElementById("customerCounty");

const customerTown =
    document.getElementById("customerTown");

const customerAddress =
    document.getElementById("customerAddress");

const supplierName =
    document.getElementById("supplierName");

const supplierOwner =
    document.getElementById("supplierOwner");

const supplierEmail =
    document.getElementById("supplierEmail");

const supplierPhone =
    document.getElementById("supplierPhone");

const supplierCounty =
    document.getElementById("supplierCounty");

const supplierTown =
    document.getElementById("supplierTown");

const orderItemsTableBody =
    document.getElementById("orderItemsTableBody");

const paymentMethod =
    document.getElementById("paymentMethod");

const paymentReference =
    document.getElementById("paymentReference");

const paymentAmount =
    document.getElementById("paymentAmount");

const paymentDate =
    document.getElementById("paymentDate");

const deliveryDriver =
    document.getElementById("deliveryDriver");

const deliveryVehicle =
    document.getElementById("deliveryVehicle");

const trackingNumber =
    document.getElementById("trackingNumber");

const expectedDelivery =
    document.getElementById("expectedDelivery");

const orderTimeline =
    document.getElementById("orderTimeline");

const adminOrderNotes =
    document.getElementById("adminOrderNotes");

// ======================================================
// Open Order Details
// ======================================================

window.openOrderDetails = function (orderId) {

    const order = findOrder(orderId);

    if (!order) {

        showErrorToast("Order not found.");

        return;

    }

    selectedOrder = order;

    populateOrderModal(order);

    bootstrap.Modal
        .getOrCreateInstance(orderDetailsModal)
        .show();

};

// ======================================================
// Populate Modal
// ======================================================

function populateOrderModal(order) {

    modalOrderId.textContent =
        order.orderNumber || order.id;

    modalOrderStatus.innerHTML =
        getOrderBadge(order.status);

    modalPaymentStatus.innerHTML =
        getPaymentBadge(order.paymentStatus);

    modalDeliveryStatus.innerHTML =
        getDeliveryBadge(order.deliveryStatus);

    loadCustomerInformation(order.customerId);

    loadSupplierInformation(order.supplierId);

    loadOrderItems(order.items || []);

    loadPaymentInformation(order);

    loadDeliveryInformation(order);

    loadOrderTimeline(order.timeline || []);

    adminOrderNotes.value =
        order.adminNotes || "";

}

// ======================================================
// Customer Information
// ======================================================

function loadCustomerInformation(customerId) {

    const customer =
        findCustomer(customerId);

    if (!customer) return;

    customerName.textContent =
        customer.fullName || "-";

    customerEmail.textContent =
        customer.email || "-";

    customerPhone.textContent =
        customer.phone || "-";

    customerCounty.textContent =
        customer.county || "-";

    customerTown.textContent =
        customer.town || "-";

    customerAddress.textContent =
        customer.address || "-";

}

// ======================================================
// Supplier Information
// ======================================================

function loadSupplierInformation(supplierId) {

    const supplier =
        findSupplier(supplierId);

    if (!supplier) return;

    supplierName.textContent =
        supplier.businessName || "-";

    supplierOwner.textContent =
        supplier.ownerName || "-";

    supplierEmail.textContent =
        supplier.email || "-";

    supplierPhone.textContent =
        supplier.phone || "-";

    supplierCounty.textContent =
        supplier.county || "-";

    supplierTown.textContent =
        supplier.town || "-";

}

// ======================================================
// Ordered Products
// ======================================================

function loadOrderItems(items) {

    orderItemsTableBody.innerHTML = "";

    if (!items.length) {

        orderItemsTableBody.innerHTML = `

<tr>

<td colspan="4" class="text-center py-4">

No products found.

</td>

</tr>

`;

        return;

    }

    items.forEach(item => {

        orderItemsTableBody.insertAdjacentHTML(

            "beforeend",

            `

<tr>

<td>${escapeHtml(item.name)}</td>

<td>${formatCurrency(item.price)}</td>

<td>${item.quantity}</td>

<td>${formatCurrency(item.total)}</td>

</tr>

`

        );

    });

}

// ======================================================
// Payment Information
// ======================================================

function loadPaymentInformation(order) {

    paymentMethod.textContent =
        order.paymentMethod || "-";

    paymentReference.textContent =
        order.paymentReference || "-";

    paymentAmount.textContent =
        formatCurrency(order.totalAmount);

    paymentDate.textContent =
        formatDate(order.paymentDate);

}

// ======================================================
// Delivery Information
// ======================================================

function loadDeliveryInformation(order) {

    deliveryDriver.textContent =
        order.driverName || "-";

    deliveryVehicle.textContent =
        order.vehicleNumber || "-";

    trackingNumber.textContent =
        order.trackingNumber || "-";

    expectedDelivery.textContent =
        formatDate(order.expectedDelivery);

}

// ======================================================
// Timeline
// ======================================================

function loadOrderTimeline(timeline) {

    orderTimeline.innerHTML = "";

    if (!timeline.length) {

        orderTimeline.innerHTML = `

<div class="text-center text-muted py-4">

No timeline available.

</div>

`;

        return;

    }

    timeline.forEach(event => {

        orderTimeline.insertAdjacentHTML(

            "beforeend",

            `

<div class="border-start border-3 border-primary ps-3 mb-3">

<div class="fw-semibold">

${escapeHtml(event.title || event.action)}

</div>

<div class="small text-muted">

${formatDate(event.date)}

</div>

<div>

${escapeHtml(event.description || "")}

</div>

</div>

`

        );

    });

}

// ======================================================
// Close Modal
// ======================================================

function closeOrderDetailsModal() {

    bootstrap.Modal
        .getInstance(orderDetailsModal)
        ?.hide();

}

// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// Part 6 - Order Management
// ======================================================

// ======================================================
// Modal Buttons
// ======================================================

const confirmOrderBtn =
    document.getElementById("confirmOrderBtn");

const processingOrderBtn =
    document.getElementById("processingOrderBtn");

const dispatchOrderBtn =
    document.getElementById("dispatchOrderBtn");

const completeOrderBtn =
    document.getElementById("completeOrderBtn");

const refundOrderBtn =
    document.getElementById("refundOrderBtn");

const cancelOrderBtn =
    document.getElementById("cancelOrderBtn");

const saveOrderNotesBtn =
    document.getElementById("saveOrderNotesBtn");

// ======================================================
// Button Events
// ======================================================

confirmOrderBtn?.addEventListener("click", () => {

    if (!selectedOrder) return;

    updateOrderStatus(
        selectedOrder.id,
        "confirmed"
    );

});

processingOrderBtn?.addEventListener("click", () => {

    if (!selectedOrder) return;

    updateOrderStatus(
        selectedOrder.id,
        "processing"
    );

});

dispatchOrderBtn?.addEventListener("click", () => {

    if (!selectedOrder) return;

    updateOrderStatus(
        selectedOrder.id,
        "out_for_delivery"
    );

});

completeOrderBtn?.addEventListener("click", () => {

    if (!selectedOrder) return;

    updateOrderStatus(
        selectedOrder.id,
        "completed"
    );

});

cancelOrderBtn?.addEventListener("click", () => {

    if (!selectedOrder) return;

    updateOrderStatus(
        selectedOrder.id,
        "cancelled"
    );

});

refundOrderBtn?.addEventListener("click", () => {

    if (!selectedOrder) return;

    processRefund();

});

saveOrderNotesBtn?.addEventListener("click", () => {

    if (!selectedOrder) return;

    saveAdministratorNotes();

});

// ======================================================
// Update Order Status
// ======================================================

async function updateOrderStatus(

    orderId,

    newStatus

) {

    try {

        showLoader();

        const orderRef = doc(

            db,

            "orders",

            orderId

        );

        await updateDoc(

            orderRef,

            {

                status: newStatus,

                updatedAt: serverTimestamp(),

                timeline: arrayUnion({

                    title:

                        newStatus

                        .replaceAll("_", " ")

                        .replace(

                            /\b\w/g,

                            c => c.toUpperCase()

                        ),

                    description:

                        `Order marked as ${newStatus.replaceAll("_"," ")}`,

                    date: new Date(),

                    admin:

                        currentAdmin.fullName ||

                        currentAdmin.name ||

                        currentAdmin.email

                })

            }

        );

        await addAuditLog(

            "Order Status Updated",

            orderId,

            newStatus

        );

        showSuccessToast(

            "Order updated successfully."

        );

        if (selectedOrder) {

            selectedOrder.status = newStatus;

            populateOrderModal(selectedOrder);

        }

    }

    catch (error) {

        console.error(error);

        showErrorToast(

            "Unable to update order."

        );

    }

    finally {

        hideLoader();

    }

}

// ======================================================
// Refund
// ======================================================

async function processRefund() {

    try {

        showLoader();

        await updateDoc(

            doc(

                db,

                "orders",

                selectedOrder.id

            ),

            {

                paymentStatus: "refunded",

                refundedAt: serverTimestamp(),

                updatedAt: serverTimestamp()

            }

        );

        await addAuditLog(

            "Refund Processed",

            selectedOrder.id,

            "refunded"

        );

        showSuccessToast(

            "Refund processed."

        );

        selectedOrder.paymentStatus =

            "refunded";

        populateOrderModal(

            selectedOrder

        );

    }

    catch (error) {

        console.error(error);

        showErrorToast(

            "Refund failed."

        );

    }

    finally {

        hideLoader();

    }

}

// ======================================================
// Save Notes
// ======================================================

async function saveAdministratorNotes() {

    try {

        showLoader();

        await updateDoc(

            doc(

                db,

                "orders",

                selectedOrder.id

            ),

            {

                adminNotes:

                    adminOrderNotes.value.trim(),

                updatedAt:

                    serverTimestamp()

            }

        );

        await addAuditLog(

            "Administrator Notes Updated",

            selectedOrder.id,

            "notes"

        );

        selectedOrder.adminNotes =

            adminOrderNotes.value.trim();

        showSuccessToast(

            "Notes saved successfully."

        );

    }

    catch (error) {

        console.error(error);

        showErrorToast(

            "Unable to save notes."

        );

    }

    finally {

        hideLoader();

    }

}

// ======================================================
// Audit Log
// ======================================================

async function addAuditLog(

    action,

    orderId,

    value

) {

    try {

        await addDoc(

            auditLogsRef,

            {

                action,

                orderId,

                value,

                administrator:

                    currentAdmin.fullName ||

                    currentAdmin.name ||

                    currentAdmin.email,

                createdAt:

                    serverTimestamp()

            }

        );

    }

    catch (error) {

        console.error(

            "Audit log:",

            error

        );

    }

}

// ======================================================
// Bulk Status Update
// ======================================================

async function bulkUpdateOrders(

    status

) {

    const selected =

        getSelectedOrders();

    if (!selected.length) {

        showInfoToast(

            "Please select at least one order."

        );

        return;

    }

    showLoader();

    try {

        for (const orderId of selected) {

            await updateDoc(

                doc(

                    db,

                    "orders",

                    orderId

                ),

                {

                    status,

                    updatedAt:

                        serverTimestamp()

                }

            );

        }

        showSuccessToast(

            `${selected.length} orders updated.`

        );

    }

    catch (error) {

        console.error(error);

        showErrorToast(

            "Bulk update failed."

        );

    }

    finally {

        hideLoader();

    }

}

// ======================================================
// Bulk Action Buttons
// ======================================================

document.getElementById(

    "confirmSelectedBtn"

)?.addEventListener(

    "click",

    () => bulkUpdateOrders(

        "confirmed"

    )

);

document.getElementById(

    "processingSelectedBtn"

)?.addEventListener(

    "click",

    () => bulkUpdateOrders(

        "processing"

    )

);

document.getElementById(

    "deliverySelectedBtn"

)?.addEventListener(

    "click",

    () => bulkUpdateOrders(

        "out_for_delivery"

    )

);

document.getElementById(

    "completeSelectedBtn"

)?.addEventListener(

    "click",

    () => bulkUpdateOrders(

        "completed"

    )

);

document.getElementById(

    "cancelSelectedBtn"

)?.addEventListener(

    "click",

    () => bulkUpdateOrders(

        "cancelled"

    )

);

// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// Part 7 - Final Utilities
// ======================================================

// ======================================================
// Bootstrap Components
// ======================================================

const successToast =
    new bootstrap.Toast(
        document.getElementById("successToast")
    );

const errorToast =
    new bootstrap.Toast(
        document.getElementById("errorToast")
    );

const infoToast =
    new bootstrap.Toast(
        document.getElementById("infoToast")
    );

// ======================================================
// Toast Helpers
// ======================================================

function showSuccessToast(message) {

    document.getElementById(
        "successToastMessage"
    ).textContent = message;

    successToast.show();

}

function showErrorToast(message) {

    document.getElementById(
        "errorToastMessage"
    ).textContent = message;

    errorToast.show();

}

function showInfoToast(message) {

    document.getElementById(
        "infoToastMessage"
    ).textContent = message;

    infoToast.show();

}

// ======================================================
// Export Orders CSV
// ======================================================

document
.getElementById("exportOrdersBtn")
?.addEventListener("click", exportOrdersCSV);

function exportOrdersCSV() {

    if (!filteredOrders.length) {

        showInfoToast(
            "No orders available."
        );

        return;

    }

    const rows = [

        [
            "Order ID",
            "Customer",
            "Supplier",
            "Amount",
            "Status",
            "Payment",
            "Delivery",
            "Date"
        ]

    ];

    filteredOrders.forEach(order => {

        rows.push([

            order.orderNumber || order.id,

            getCustomerName(order.customerId),

            getSupplierName(order.supplierId),

            order.totalAmount || 0,

            order.status || "",

            order.paymentStatus || "",

            order.deliveryStatus || "",

            formatDate(order.createdAt)

        ]);

    });

    const csv = rows
        .map(row => row.join(","))
        .join("\n");

    const blob = new Blob(

        [csv],

        {

            type: "text/csv"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =

        "marketplace-orders.csv";

    a.click();

    URL.revokeObjectURL(url);

    showSuccessToast(

        "Orders exported."

    );

}

// ======================================================
// Print Orders
// ======================================================

document
.getElementById("printOrdersBtn")
?.addEventListener("click", () => {

    window.print();

});

// ======================================================
// Invoice Printing
// ======================================================

document
.getElementById("printInvoiceBtn")
?.addEventListener("click", () => {

    const invoice =

        document.getElementById(

            "invoicePreview"

        ).innerHTML;

    const printWindow =

        window.open("", "_blank");

    printWindow.document.write(`

<html>

<head>

<title>Invoice</title>

<link
href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
rel="stylesheet">

</head>

<body class="p-4">

${invoice}

</body>

</html>

`);

    printWindow.document.close();

    printWindow.print();

});

// ======================================================
// Activity Log
// ======================================================

function renderActivityLog(logs = []) {

    const container =

        document.getElementById(

            "orderActivityLog"

        );

    if (!container) return;

    if (!logs.length) {

        container.innerHTML = `

<div class="text-center py-5 text-muted">

No activity recorded.

</div>

`;

        return;

    }

    container.innerHTML = logs.map(log => `

<div class="border-bottom pb-2 mb-2">

<div class="fw-semibold">

${escapeHtml(log.action)}

</div>

<div class="small text-muted">

${formatDate(log.createdAt)}

</div>

</div>

`).join("");

}

// ======================================================
// Scroll To Top
// ======================================================

window.addEventListener(

    "scroll",

    () => {

        scrollTopBtn.style.display =

            window.scrollY > 400

            ? "block"

            : "none";

    }

);

scrollTopBtn?.addEventListener(

    "click",

    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

);

// ======================================================
// Offline Detection
// ======================================================

function updateNetworkStatus() {

    if (navigator.onLine) {

        offlineBanner.classList.add(

            "d-none"

        );

    }

    else {

        offlineBanner.classList.remove(

            "d-none"

        );

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

// ======================================================
// Logout
// ======================================================

topLogoutBtn?.addEventListener(

    "click",

    () => {

        bootstrap.Modal
            .getOrCreateInstance(

                document.getElementById(

                    "logoutModal"

                )

            )

            .show();

    }

);

confirmLogoutBtn?.addEventListener(

    "click",

    async () => {

        try {

            await signOut(auth);

            window.location.href =

                "login.html";

        }

        catch {

            showErrorToast(

                "Logout failed."

            );

        }

    }

);

// ======================================================
// Session Expired
// ======================================================

document
.getElementById("loginAgainBtn")
?.addEventListener(

    "click",

    () => {

        window.location.href =

            "login.html";

    }

);

// ======================================================
// Cleanup
// ======================================================

window.addEventListener(

    "beforeunload",

    () => {

        if (

            unsubscribeOrders

        ) {

            unsubscribeOrders();

        }

    }

);

// ======================================================
// Initial Page Setup
// ======================================================

updateNetworkStatus();

document
.getElementById("copyrightYear")
.textContent =
new Date().getFullYear();

console.log(

    "Kenya Gas Marketplace",

    "Admin Orders Loaded Successfully"

);
