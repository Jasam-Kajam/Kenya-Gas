// ======================================================
// Kenya Gas Marketplace
// Admin Orders
// Part 1
// Firebase Imports & Initialization
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
    serverTimestamp,
    deleteDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ------------------------------------------------------
// Firebase Services
// ------------------------------------------------------

const auth = getAuth(app);

const db = getFirestore(app);

// ------------------------------------------------------
// Global Variables
// ------------------------------------------------------

let currentAdmin = null;

let orders = [];

let filteredOrders = [];

let customers = [];

let suppliers = [];

let selectedOrder = null;

let unsubscribeOrders = null;

// Pagination

const ORDERS_PER_PAGE = 10;

let currentPage = 1;

// ------------------------------------------------------
// DOM Elements
// ------------------------------------------------------

const loadingOverlay =
    document.getElementById("loadingOverlay");

const ordersTableBody =
    document.getElementById("ordersTableBody");

const orderCountBadge =
    document.getElementById("orderCountBadge");

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const completedOrders =
    document.getElementById("completedOrders");

const cancelledOrders =
    document.getElementById("cancelledOrders");

// ------------------------------------------------------
// Loading Helpers
// ------------------------------------------------------

function showLoader() {

    loadingOverlay?.classList.remove("d-none");

}

function hideLoader() {

    loadingOverlay?.classList.add("d-none");

}

// ------------------------------------------------------
// Authentication
// ------------------------------------------------------

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    try {

        const adminRef = doc(

            db,
            "admins",
            user.uid

        );

        const adminSnap =

            await getDoc(adminRef);

        if (!adminSnap.exists()) {

            alert("Administrator access denied.");

            await signOut(auth);

            window.location.href = "login.html";

            return;

        }

        currentAdmin = {

            uid: user.uid,

            email: user.email,

            ...adminSnap.data()

        };

        initializePage();

    }

    catch (error) {

        console.error(error);

        alert("Failed to verify administrator.");

    }

});

// ------------------------------------------------------
// Initialize Page
// ------------------------------------------------------

function initializePage() {

    loadAdminProfile();

    loadCustomers();

    loadSuppliers();

    listenForOrders();

    registerEventListeners();

}

// ------------------------------------------------------
// Load Administrator Profile
// ------------------------------------------------------

function loadAdminProfile() {

    document.getElementById(

        "topAdminName"

    ).textContent =

        currentAdmin.fullName ||

        currentAdmin.name ||

        "Administrator";

    if (currentAdmin.photoURL) {

        document.getElementById(

            "topAdminPhoto"

        ).src =

        currentAdmin.photoURL;

    }

}

// ======================================================
// Part 2
// Customers
// Suppliers
// Real-time Orders
// Dashboard Statistics
// ======================================================

// ------------------------------------------------------
// Load Customers
// ------------------------------------------------------

async function loadCustomers() {

    try {

        const snapshot = await getDocs(

            query(

                collection(db, "customers"),

                orderBy("fullName")

            )

        );

        customers = [];

        snapshot.forEach(docSnap => {

            customers.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

    }

    catch (error) {

        console.error(error);

        showError("Unable to load customers.");

    }

}

// ------------------------------------------------------
// Load Suppliers
// ------------------------------------------------------

async function loadSuppliers() {

    try {

        const snapshot = await getDocs(

            query(

                collection(db, "suppliers"),

                orderBy("businessName")

            )

        );

        suppliers = [];

        snapshot.forEach(docSnap => {

            suppliers.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

    }

    catch (error) {

        console.error(error);

        showError("Unable to load suppliers.");

    }

}

// ------------------------------------------------------
// Listen For Orders
// ------------------------------------------------------

function listenForOrders() {

    if (unsubscribeOrders) {

        unsubscribeOrders();

    }

    showLoader();

    unsubscribeOrders = onSnapshot(

        query(

            collection(db, "orders"),

            orderBy("createdAt", "desc")

        ),

        snapshot => {

            orders = [];

            snapshot.forEach(docSnap => {

                orders.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });

            });

            filteredOrders = [...orders];

            updateDashboardCards();

            updateOrderBadge();

            renderCurrentPage();

            hideLoader();

        },

        error => {

            console.error(error);

            hideLoader();

            showError("Unable to load orders.");

        }

    );

}

// ------------------------------------------------------
// Dashboard Statistics
// ------------------------------------------------------

function updateDashboardCards() {

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

}

// ------------------------------------------------------
// Order Counter Badge
// ------------------------------------------------------

function updateOrderBadge() {

    orderCountBadge.textContent =

        `${filteredOrders.length} Orders`;

}

// ------------------------------------------------------
// Initial Table Rendering
// ------------------------------------------------------

function renderCurrentPage() {

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

    renderOrdersTable(pageOrders);

    updatePagination();

}

// ------------------------------------------------------
// Render Orders Table
// ------------------------------------------------------

function renderOrdersTable(orderList) {

    if (!orderList.length) {

        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="text-center py-5 text-muted">

                    No orders found.

                </td>

            </tr>

        `;

        return;

    }

    ordersTableBody.innerHTML = "";

    orderList.forEach(order => {

        ordersTableBody.innerHTML +=

            createOrderRow(order);

    });

}

// ======================================================
// Part 3
// Order Table
// Row Builder
// Status Badges
// Action Buttons
// ======================================================

// ------------------------------------------------------
// Create Order Table Row
// ------------------------------------------------------

function createOrderRow(order) {

    return `

    <tr>

        <td>

            <input
                type="checkbox"
                class="orderCheck"
                value="${order.id}">

        </td>

        <td>

            <strong>

                ${escapeHTML(order.orderNumber || order.id)}

            </strong>

        </td>

        <td>

            ${getCustomerName(order.customerId)}

        </td>

        <td>

            ${getSupplierName(order.supplierId)}

        </td>

        <td>

            ${formatCurrency(order.totalAmount || 0)}

        </td>

        <td>

            ${paymentStatusBadge(order.paymentStatus)}

        </td>

        <td>

            ${deliveryStatusBadge(order.deliveryStatus)}

        </td>

        <td>

            ${orderStatusBadge(order.status)}

        </td>

        <td>

            ${formatDate(order.createdAt)}

        </td>

        <td class="text-center">

            <div class="btn-group btn-group-sm">

                <button
                    class="btn btn-outline-primary"
                    title="View"
                    onclick="openOrderDetails('${order.id}')">

                    <i class="bi bi-eye"></i>

                </button>

                <button
                    class="btn btn-outline-success"
                    title="Confirm"
                    onclick="confirmOrder('${order.id}')">

                    <i class="bi bi-check-circle"></i>

                </button>

                <button
                    class="btn btn-outline-warning"
                    title="Dispatch"
                    onclick="dispatchOrder('${order.id}')">

                    <i class="bi bi-truck"></i>

                </button>

                <button
                    class="btn btn-outline-info"
                    title="Complete"
                    onclick="completeOrder('${order.id}')">

                    <i class="bi bi-patch-check"></i>

                </button>

                <button
                    class="btn btn-outline-danger"
                    title="Cancel"
                    onclick="cancelOrder('${order.id}')">

                    <i class="bi bi-x-circle"></i>

                </button>

            </div>

        </td>

    </tr>

    `;

}

// ------------------------------------------------------
// Customer Lookup
// ------------------------------------------------------

function getCustomerName(customerId) {

    const customer = customers.find(

        item => item.id === customerId

    );

    return customer

        ? escapeHTML(

            customer.fullName ||

            customer.name ||

            "Customer"

        )

        : "<span class='text-muted'>Unknown</span>";

}

// ------------------------------------------------------
// Supplier Lookup
// ------------------------------------------------------

function getSupplierName(supplierId) {

    const supplier = suppliers.find(

        item => item.id === supplierId

    );

    return supplier

        ? escapeHTML(

            supplier.businessName ||

            supplier.name ||

            "Supplier"

        )

        : "<span class='text-muted'>Unknown</span>";

}

// ------------------------------------------------------
// Payment Badge
// ------------------------------------------------------

function paymentStatusBadge(status) {

    switch (status) {

        case "paid":

            return `<span class="badge bg-success">Paid</span>`;

        case "pending":

            return `<span class="badge bg-warning text-dark">Pending</span>`;

        case "failed":

            return `<span class="badge bg-danger">Failed</span>`;

        case "refunded":

            return `<span class="badge bg-info">Refunded</span>`;

        default:

            return `<span class="badge bg-secondary">Unknown</span>`;

    }

}

// ------------------------------------------------------
// Delivery Badge
// ------------------------------------------------------

function deliveryStatusBadge(status) {

    switch (status) {

        case "pending":

            return `<span class="badge bg-warning text-dark">Pending</span>`;

        case "assigned":

            return `<span class="badge bg-primary">Assigned</span>`;

        case "in_transit":

            return `<span class="badge bg-info">In Transit</span>`;

        case "delivered":

            return `<span class="badge bg-success">Delivered</span>`;

        default:

            return `<span class="badge bg-secondary">Unknown</span>`;

    }

}

// ------------------------------------------------------
// Order Status Badge
// ------------------------------------------------------

function orderStatusBadge(status) {

    switch (status) {

        case "pending":

            return `<span class="badge bg-warning text-dark">Pending</span>`;

        case "confirmed":

            return `<span class="badge bg-primary">Confirmed</span>`;

        case "processing":

            return `<span class="badge bg-info">Processing</span>`;

        case "out_for_delivery":

            return `<span class="badge bg-primary">Out for Delivery</span>`;

        case "completed":

            return `<span class="badge bg-success">Completed</span>`;

        case "cancelled":

            return `<span class="badge bg-danger">Cancelled</span>`;

        default:

            return `<span class="badge bg-secondary">Unknown</span>`;

    }

}

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

function formatCurrency(amount) {

    return new Intl.NumberFormat(

        "en-KE",

        {

            style: "currency",

            currency: "KES",

            minimumFractionDigits: 0

        }

    ).format(Number(amount || 0));

}

function formatDate(date) {

    if (!date) return "-";

    if (date.toDate) {

        date = date.toDate();

    }

    return new Intl.DateTimeFormat(

        "en-KE",

        {

            dateStyle: "medium",

            timeStyle: "short"

        }

    ).format(date);

}

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;

}

// ======================================================
// Part 4
// Search
// Filters
// Pagination
// Bulk Selection
// ======================================================

// ------------------------------------------------------
// Register Event Listeners
// ------------------------------------------------------

function registerEventListeners() {

    document.getElementById("orderSearch")
        ?.addEventListener("input", applyFilters);

    document.getElementById("statusFilter")
        ?.addEventListener("change", applyFilters);

    document.getElementById("paymentFilter")
        ?.addEventListener("change", applyFilters);

    document.getElementById("deliveryFilter")
        ?.addEventListener("change", applyFilters);

    document.getElementById("fromDate")
        ?.addEventListener("change", applyFilters);

    document.getElementById("resetFilters")
        ?.addEventListener("click", resetFilters);

    document.getElementById("selectAllOrders")
        ?.addEventListener("change", toggleSelectAllOrders);

    document.getElementById("refreshOrdersBtn")
        ?.addEventListener("click", listenForOrders);

    document.getElementById("exportOrdersBtn")
        ?.addEventListener("click", exportOrdersCSV);

    document.getElementById("printOrdersBtn")
        ?.addEventListener("click", () => window.print());

}

// ------------------------------------------------------
// Apply Filters
// ------------------------------------------------------

function applyFilters() {

    const search =
        document.getElementById("orderSearch")
        ?.value
        .trim()
        .toLowerCase() || "";

    const status =
        document.getElementById("statusFilter")?.value || "";

    const payment =
        document.getElementById("paymentFilter")?.value || "";

    const delivery =
        document.getElementById("deliveryFilter")?.value || "";

    const fromDate =
        document.getElementById("fromDate")?.value || "";

    filteredOrders = orders.filter(order => {

        const customer =
            getCustomerName(order.customerId)
            .toLowerCase();

        const supplier =
            getSupplierName(order.supplierId)
            .toLowerCase();

        const orderNumber =
            (order.orderNumber || order.id || "")
            .toLowerCase();

        const matchesSearch =

            !search ||

            orderNumber.includes(search) ||

            customer.includes(search) ||

            supplier.includes(search);

        const matchesStatus =

            !status ||

            order.status === status;

        const matchesPayment =

            !payment ||

            order.paymentStatus === payment;

        const matchesDelivery =

            !delivery ||

            order.deliveryStatus === delivery;

        let matchesDate = true;

        if (fromDate && order.createdAt) {

            const orderDate =

                order.createdAt.toDate
                ? order.createdAt.toDate()
                : new Date(order.createdAt);

            matchesDate =
                orderDate >= new Date(fromDate);

        }

        return (

            matchesSearch &&
            matchesStatus &&
            matchesPayment &&
            matchesDelivery &&
            matchesDate

        );

    });

    currentPage = 1;

    updateOrderBadge();

    renderCurrentPage();

}

// ------------------------------------------------------
// Reset Filters
// ------------------------------------------------------

function resetFilters() {

    document.getElementById("orderSearch").value = "";

    document.getElementById("statusFilter").value = "";

    document.getElementById("paymentFilter").value = "";

    document.getElementById("deliveryFilter").value = "";

    document.getElementById("fromDate").value = "";

    filteredOrders = [...orders];

    currentPage = 1;

    updateOrderBadge();

    renderCurrentPage();

}

// ------------------------------------------------------
// Pagination
// ------------------------------------------------------

function updatePagination() {

    const pages = Math.max(

        1,

        Math.ceil(

            filteredOrders.length /

            ORDERS_PER_PAGE

        )

    );

    document.getElementById(

        "paginationInfo"

    ).textContent =

        `Showing ${filteredOrders.length} order(s)`;

    let html = "";

    for (let i = 1; i <= pages; i++) {

        html += `

        <li class="page-item ${

            i === currentPage

                ? "active"

                : ""

        }">

            <button

                class="page-link"

                data-page="${i}">

                ${i}

            </button>

        </li>

        `;

    }

    const pagination =

        document.getElementById(

            "ordersPagination"

        );

    pagination.innerHTML = html;

    pagination

        .querySelectorAll(".page-link")

        .forEach(button => {

            button.onclick = () => {

                currentPage =

                    Number(button.dataset.page);

                renderCurrentPage();

            };

        });

}

// ------------------------------------------------------
// Select All Orders
// ------------------------------------------------------

function toggleSelectAllOrders(event) {

    document

        .querySelectorAll(".orderCheck")

        .forEach(box => {

            box.checked =

                event.target.checked;

        });

    updateSelectedOrders();

}

// ------------------------------------------------------
// Selected Counter
// ------------------------------------------------------

function updateSelectedOrders() {

    const selected =

        document

        .querySelectorAll(

            ".orderCheck:checked"

        )

        .length;

    document.getElementById(

        "selectedOrdersLabel"

    ).textContent =

        `${selected} Selected`;

}

document.addEventListener(

    "change",

    event => {

        if (

            event.target.classList.contains(

                "orderCheck"

            )

        ) {

            updateSelectedOrders();

        }

    }

);

// ======================================================
// End Part 4
// ======================================================

// ======================================================
// Part 5
// Order Details Modal
// Customer
// Supplier
// Products
// Payment
// Delivery
// Timeline
// ======================================================

// ------------------------------------------------------
// Open Order Details
// ------------------------------------------------------

window.openOrderDetails = async function(orderId) {

    selectedOrder = orders.find(

        order => order.id === orderId

    );

    if (!selectedOrder) {

        showError("Order not found.");

        return;

    }

    populateOrderModal(selectedOrder);

    const modal = new bootstrap.Modal(

        document.getElementById("orderDetailsModal")

    );

    modal.show();

};

// ------------------------------------------------------
// Populate Modal
// ------------------------------------------------------

function populateOrderModal(order) {

    // Order Summary

    document.getElementById("modalOrderId").textContent =
        order.orderNumber || order.id;

    document.getElementById("modalOrderStatus").innerHTML =
        orderStatusBadge(order.status);

    document.getElementById("modalPaymentStatus").innerHTML =
        paymentStatusBadge(order.paymentStatus);

    document.getElementById("modalDeliveryStatus").innerHTML =
        deliveryStatusBadge(order.deliveryStatus);

    // Customer

    loadCustomerInformation(order.customerId);

    // Supplier

    loadSupplierInformation(order.supplierId);

    // Products

    renderOrderProducts(order.items || []);

    // Payment

    loadPaymentInformation(order);

    // Delivery

    loadDeliveryInformation(order);

    // Timeline

    renderTimeline(order.timeline || []);

    // Notes

    document.getElementById("adminOrderNotes").value =
        order.adminNotes || "";

}

// ------------------------------------------------------
// Customer Information
// ------------------------------------------------------

function loadCustomerInformation(customerId) {

    const customer = customers.find(

        item => item.id === customerId

    );

    if (!customer) return;

    document.getElementById("customerName").textContent =
        customer.fullName || "-";

    document.getElementById("customerEmail").textContent =
        customer.email || "-";

    document.getElementById("customerPhone").textContent =
        customer.phone || "-";

    document.getElementById("customerCounty").textContent =
        customer.county || "-";

    document.getElementById("customerTown").textContent =
        customer.town || "-";

    document.getElementById("customerAddress").textContent =
        customer.address || "-";

}

// ------------------------------------------------------
// Supplier Information
// ------------------------------------------------------

function loadSupplierInformation(supplierId) {

    const supplier = suppliers.find(

        item => item.id === supplierId

    );

    if (!supplier) return;

    document.getElementById("supplierName").textContent =
        supplier.businessName || "-";

    document.getElementById("supplierOwner").textContent =
        supplier.ownerName || "-";

    document.getElementById("supplierEmail").textContent =
        supplier.email || "-";

    document.getElementById("supplierPhone").textContent =
        supplier.phone || "-";

    document.getElementById("supplierCounty").textContent =
        supplier.county || "-";

    document.getElementById("supplierTown").textContent =
        supplier.town || "-";

}

// ------------------------------------------------------
// Ordered Products
// ------------------------------------------------------

function renderOrderProducts(items) {

    const tbody = document.getElementById(

        "orderItemsTableBody"

    );

    if (!items.length) {

        tbody.innerHTML = `

        <tr>

            <td colspan="4"
                class="text-center">

                No products.

            </td>

        </tr>

        `;

        return;

    }

    tbody.innerHTML = "";

    items.forEach(item => {

        tbody.innerHTML += `

        <tr>

            <td>${escapeHTML(item.name)}</td>

            <td>${formatCurrency(item.price)}</td>

            <td>${item.quantity}</td>

            <td>${formatCurrency(item.total)}</td>

        </tr>

        `;

    });

}

// ------------------------------------------------------
// Payment Information
// ------------------------------------------------------

function loadPaymentInformation(order) {

    document.getElementById("paymentMethod").textContent =
        order.paymentMethod || "-";

    document.getElementById("paymentReference").textContent =
        order.paymentReference || "-";

    document.getElementById("paymentAmount").textContent =
        formatCurrency(order.totalAmount || 0);

    document.getElementById("paymentDate").textContent =
        formatDate(order.paymentDate);

}

// ------------------------------------------------------
// Delivery Information
// ------------------------------------------------------

function loadDeliveryInformation(order) {

    document.getElementById("deliveryDriver").textContent =
        order.driverName || "-";

    document.getElementById("deliveryVehicle").textContent =
        order.vehicleNumber || "-";

    document.getElementById("trackingNumber").textContent =
        order.trackingNumber || "-";

    document.getElementById("expectedDelivery").textContent =
        formatDate(order.expectedDelivery);

}

// ------------------------------------------------------
// Timeline
// ------------------------------------------------------

function renderTimeline(timeline) {

    const container = document.getElementById(

        "orderTimeline"

    );

    if (!timeline.length) {

        container.innerHTML =

            "<p class='text-muted'>No timeline available.</p>";

        return;

    }

    let html = "<ul class='list-group'>";

    timeline.forEach(event => {

        html += `

        <li class="list-group-item">

            <strong>

                ${escapeHTML(event.title)}

            </strong>

            <br>

            <small class="text-muted">

                ${formatDate(event.date)}

            </small>

        </li>

        `;

    });

    html += "</ul>";

    container.innerHTML = html;

}

// ======================================================
// End Part 5
// ======================================================

// ======================================================
// Part 6
// Order Actions
// Bulk Actions
// Admin Notes
// Audit Logs
// ======================================================

// ------------------------------------------------------
// Update Order Status
// ------------------------------------------------------

async function updateOrderStatus(orderId, updates) {

    try {

        showLoader();

        await updateDoc(

            doc(db, "orders", orderId),

            {
                ...updates,
                updatedAt: serverTimestamp()
            }

        );

        await createAuditLog(

            "order_update",

            orderId,

            JSON.stringify(updates)

        );

        hideLoader();

        showSuccess("Order updated successfully.");

    }

    catch (error) {

        console.error(error);

        hideLoader();

        showError("Failed to update order.");

    }

}

// ------------------------------------------------------
// Individual Actions
// ------------------------------------------------------

window.confirmOrder = async function(orderId) {

    await updateOrderStatus(orderId, {

        status: "confirmed"

    });

};

window.processingOrder = async function(orderId) {

    await updateOrderStatus(orderId, {

        status: "processing"

    });

};

window.dispatchOrder = async function(orderId) {

    await updateOrderStatus(orderId, {

        status: "out_for_delivery",

        deliveryStatus: "in_transit"

    });

};

window.completeOrder = async function(orderId) {

    await updateOrderStatus(orderId, {

        status: "completed",

        deliveryStatus: "delivered"

    });

};

window.cancelOrder = async function(orderId) {

    if (!confirm("Cancel this order?")) {

        return;

    }

    await updateOrderStatus(orderId, {

        status: "cancelled"

    });

};

window.refundOrder = async function(orderId) {

    if (!confirm("Refund this order?")) {

        return;

    }

    await updateOrderStatus(orderId, {

        paymentStatus: "refunded"

    });

};

// ------------------------------------------------------
// Save Admin Notes
// ------------------------------------------------------

document

.getElementById("saveOrderNotesBtn")

?.addEventListener(

    "click",

    async () => {

        if (!selectedOrder) return;

        await updateOrderStatus(

            selectedOrder.id,

            {

                adminNotes:

                document.getElementById(

                    "adminOrderNotes"

                ).value

            }

        );

    }

);

// ------------------------------------------------------
// Selected Orders
// ------------------------------------------------------

function getSelectedOrders() {

    return [

        ...document.querySelectorAll(

            ".orderCheck:checked"

        )

    ].map(

        checkbox => checkbox.value

    );

}

// ------------------------------------------------------
// Bulk Update
// ------------------------------------------------------

async function bulkUpdateStatus(status) {

    const ids =

        getSelectedOrders();

    if (!ids.length) {

        showError(

            "Select at least one order."

        );

        return;

    }

    showLoader();

    try {

        for (const id of ids) {

            await updateDoc(

                doc(db, "orders", id),

                {

                    status,

                    updatedAt:

                    serverTimestamp()

                }

            );

            await createAuditLog(

                "bulk_status_update",

                id,

                status

            );

        }

        hideLoader();

        showSuccess(

            `${ids.length} order(s) updated.`

        );

    }

    catch (error) {

        console.error(error);

        hideLoader();

        showError(

            "Bulk update failed."

        );

    }

}

// ------------------------------------------------------
// Bulk Buttons
// ------------------------------------------------------

document

.getElementById("confirmSelectedBtn")

?.addEventListener(

    "click",

    () => bulkUpdateStatus(

        "confirmed"

    )

);

document

.getElementById("processingSelectedBtn")

?.addEventListener(

    "click",

    () => bulkUpdateStatus(

        "processing"

    )

);

document

.getElementById("deliverySelectedBtn")

?.addEventListener(

    "click",

    () => bulkUpdateStatus(

        "out_for_delivery"

    )

);

document

.getElementById("completeSelectedBtn")

?.addEventListener(

    "click",

    () => bulkUpdateStatus(

        "completed"

    )

);

document

.getElementById("cancelSelectedBtn")

?.addEventListener(

    "click",

    () => bulkUpdateStatus(

        "cancelled"

    )

);

// ------------------------------------------------------
// Modal Footer Buttons
// ------------------------------------------------------

document

.getElementById("confirmOrderBtn")

?.addEventListener(

    "click",

    () => {

        if (selectedOrder)

            confirmOrder(selectedOrder.id);

    }

);

document

.getElementById("processingOrderBtn")

?.addEventListener(

    "click",

    () => {

        if (selectedOrder)

            processingOrder(

                selectedOrder.id

            );

    }

);

document

.getElementById("dispatchOrderBtn")

?.addEventListener(

    "click",

    () => {

        if (selectedOrder)

            dispatchOrder(

                selectedOrder.id

            );

    }

);

document

.getElementById("completeOrderBtn")

?.addEventListener(

    "click",

    () => {

        if (selectedOrder)

            completeOrder(

                selectedOrder.id

            );

    }

);

document

.getElementById("cancelOrderBtn")

?.addEventListener(

    "click",

    () => {

        if (selectedOrder)

            cancelOrder(

                selectedOrder.id

            );

    }

);

document

.getElementById("refundOrderBtn")

?.addEventListener(

    "click",

    () => {

        if (selectedOrder)

            refundOrder(

                selectedOrder.id

            );

    }

);

// ======================================================
// End Part 6
// ======================================================

b