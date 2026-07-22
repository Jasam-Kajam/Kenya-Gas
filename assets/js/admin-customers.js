// ======================================================
// Kenya Gas Marketplace
// Admin Customers
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
    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ------------------------------------------------------
// Firebase
// ------------------------------------------------------

const auth = getAuth(app);

const db = getFirestore(app);

// ------------------------------------------------------
// Global Variables
// ------------------------------------------------------

let currentAdmin = null;

let selectedCustomer = null;

let customers = [];

let filteredCustomers = [];

let unsubscribeCustomers = null;

// ------------------------------------------------------
// DOM Elements
// ------------------------------------------------------

const tableBody =
document.getElementById("customersTableBody");

const customerCountBadge =
document.getElementById("customerCountBadge");

const totalCustomers =
document.getElementById("totalCustomers");

const verifiedCustomers =
document.getElementById("verifiedCustomers");

const activeCustomers =
document.getElementById("activeCustomers");

const suspendedCustomers =
document.getElementById("suspendedCustomers");

const loadingOverlay =
document.getElementById("loadingOverlay");

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

        const adminRef = doc(db, "admins", user.uid);

        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            alert("Access denied.");

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

        alert("Unable to verify administrator.");

    }

});

// ------------------------------------------------------
// Initialize Page
// ------------------------------------------------------

function initializePage() {

    loadAdminProfile();

    listenForCustomers();

    registerEventListeners();

}

// ======================================================
// Part 2
// Admin Profile
// Customer Listener
// Dashboard Statistics
// ======================================================

// ------------------------------------------------------
// Load Administrator Profile
// ------------------------------------------------------

async function loadAdminProfile() {

    try {

        document.getElementById("topAdminName").textContent =
            currentAdmin.fullName ||
            currentAdmin.name ||
            "Administrator";

        if (currentAdmin.photoURL) {

            document.getElementById("topAdminPhoto").src =
                currentAdmin.photoURL;

        }

    }

    catch (error) {

        console.error("Admin profile:", error);

    }

}

// ------------------------------------------------------
// Listen For Customers
// ------------------------------------------------------

function listenForCustomers() {

    if (unsubscribeCustomers) {

        unsubscribeCustomers();

    }

    showLoader();

    unsubscribeCustomers = onSnapshot(

        query(

            collection(db, "customers"),

            orderBy("createdAt", "desc")

        ),

        (snapshot) => {

            customers = [];

            snapshot.forEach((docSnap) => {

                customers.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });

            });

            filteredCustomers = [...customers];

            updateDashboardCards();

            updateCustomerBadge();

            renderCustomersTable();

            hideLoader();

        },

        (error) => {

            console.error(error);

            hideLoader();

            showError(

                "Failed to load customers."

            );

        }

    );

}

// ------------------------------------------------------
// Dashboard Cards
// ------------------------------------------------------

function updateDashboardCards() {

    totalCustomers.textContent =
        customers.length;

    const verified =
        customers.filter(customer =>
            customer.emailVerified === true
        ).length;

    const active =
        customers.filter(customer =>
            customer.status === "active"
        ).length;

    const suspended =
        customers.filter(customer =>
            customer.status === "suspended"
        ).length;

    verifiedCustomers.textContent =
        verified;

    activeCustomers.textContent =
        active;

    suspendedCustomers.textContent =
        suspended;

}

// ------------------------------------------------------
// Customer Badge
// ------------------------------------------------------

function updateCustomerBadge() {

    customerCountBadge.textContent =
        `${filteredCustomers.length} Customers`;

}

// ------------------------------------------------------
// Status Badge
// ------------------------------------------------------

function customerStatusBadge(status = "") {

    switch (status.toLowerCase()) {

        case "active":

            return `
                <span class="badge bg-success">
                    Active
                </span>
            `;

        case "verified":

            return `
                <span class="badge bg-primary">
                    Verified
                </span>
            `;

        case "pending":

            return `
                <span class="badge bg-warning text-dark">
                    Pending
                </span>
            `;

        case "suspended":

            return `
                <span class="badge bg-danger">
                    Suspended
                </span>
            `;

        default:

            return `
                <span class="badge bg-secondary">
                    Unknown
                </span>
            `;

    }

}

// ------------------------------------------------------
// Render Customers Table
// ------------------------------------------------------

function renderCustomersTable() {

    if (!tableBody) return;

    if (filteredCustomers.length === 0) {

        tableBody.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="text-center py-5">

                No customers found.

            </td>

        </tr>

        `;

        return;

    }

    let html = "";

    filteredCustomers.forEach(customer => {

        html += `

        <tr>

            <td>

                <input

                    class="form-check-input customerCheck"

                    type="checkbox"

                    value="${customer.id}">

            </td>

            <td>

                <div class="d-flex align-items-center">

                    <img

                        src="${customer.photoURL || "assets/images/default-avatar.png"}"

                        class="rounded-circle me-2"

                        width="40"

                        height="40">

                    <div>

                        <strong>

                            ${escapeHTML(

                                customer.fullName ||

                                "Unnamed"

                            )}

                        </strong>

                        <br>

                        <small class="text-muted">

                            ${escapeHTML(

                                customer.email ||

                                "-"

                            )}

                        </small>

                    </div>

                </div>

            </td>

            <td>

                ${escapeHTML(

                    customer.phone ||

                    "-"

                )}

            </td>

            <td>

                ${escapeHTML(

                    customer.county ||

                    "-"

                )}

            </td>

            <td>

                ${customer.totalOrders || 0}

            </td>

            <td>

                ${formatCurrency(

                    customer.totalSpent || 0

                )}

            </td>

            <td>

                ${customerStatusBadge(

                    customer.status

                )}

            </td>

            <td>

                ${formatDate(

                    customer.createdAt

                )}

            </td>

            <td class="text-center">

                <button

                    class="btn btn-sm btn-outline-primary viewCustomerBtn"

                    data-id="${customer.id}">

                    <i class="bi bi-eye"></i>

                </button>

            </td>

        </tr>

        `;

    });

    tableBody.innerHTML = html;

    bindCustomerButtons();

}

// ------------------------------------------------------
// View Customer Buttons
// ------------------------------------------------------

function bindCustomerButtons() {

    document

        .querySelectorAll(".viewCustomerBtn")

        .forEach(button => {

            button.addEventListener(

                "click",

                () => {

                    openCustomerProfile(

                        button.dataset.id

                    );

                }

            );

        });

}

// ======================================================
// Part 3
// Customer Profile
// Orders
// Payments
// Reviews
// Activity
// ======================================================

// ------------------------------------------------------
// Open Customer Profile
// ------------------------------------------------------

async function openCustomerProfile(customerId) {

    try {

        showLoader();

        const customer = customers.find(c => c.id === customerId);

        if (!customer) {

            hideLoader();

            showError("Customer not found.");

            return;

        }

        selectedCustomer = customer;

        populateCustomerProfile();

        await Promise.all([

            loadCustomerOrders(),

            loadCustomerPayments(),

            loadCustomerReviews(),

            loadFavouriteSuppliers(),

            loadSavedAddresses(),

            loadCustomerActivity()

        ]);

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById("customerDetailsModal")
            )
            .show();

        hideLoader();

    }

    catch (error) {

        console.error(error);

        hideLoader();

        showError("Unable to load customer profile.");

    }

}

// ------------------------------------------------------
// Populate Customer Information
// ------------------------------------------------------

function populateCustomerProfile() {

    document.getElementById("customerPhoto").src =
        selectedCustomer.photoURL ||
        "assets/images/default-avatar.png";

    document.getElementById("customerName").textContent =
        selectedCustomer.fullName || "-";

    document.getElementById("customerEmail").textContent =
        selectedCustomer.email || "-";

    document.getElementById("customerPhone").textContent =
        selectedCustomer.phone || "-";

    document.getElementById("customerCounty").textContent =
        selectedCustomer.county || "-";

    document.getElementById("customerTown").textContent =
        selectedCustomer.town || "-";

    document.getElementById("customerJoined").textContent =
        formatDate(selectedCustomer.createdAt);

    document.getElementById("customerLastLogin").textContent =
        formatDate(selectedCustomer.lastLogin);

    document.getElementById("customerId").textContent =
        selectedCustomer.id;

    document.getElementById("customerVerified").textContent =
        selectedCustomer.emailVerified
            ? "Yes"
            : "No";

    document.getElementById("customerAccountStatus").innerHTML =
        customerStatusBadge(selectedCustomer.status);

    document.getElementById("customerStatusBadge").innerHTML =
        customerStatusBadge(selectedCustomer.status);

    document.getElementById("customerAddress").textContent =
        selectedCustomer.address ||
        "No address available.";

}

// ------------------------------------------------------
// Customer Orders
// ------------------------------------------------------

async function loadCustomerOrders() {

    const container =
        document.getElementById("customerOrdersContainer");

    const snapshot = await getDocs(

        query(

            collection(db, "orders"),

            where("customerId", "==", selectedCustomer.id),

            orderBy("createdAt", "desc"),

            limit(20)

        )

    );

    if (snapshot.empty) {

        container.innerHTML =
            "<p class='text-muted'>No orders found.</p>";

        return;

    }

    let html =
        "<div class='list-group'>";

    let totalSpent = 0;

    snapshot.forEach(docSnap => {

        const order = docSnap.data();

        totalSpent += Number(order.total || 0);

        html += `

        <div class="list-group-item">

            <div class="d-flex justify-content-between">

                <strong>

                    ${escapeHTML(order.productName || "Order")}

                </strong>

                <span>

                    ${formatCurrency(order.total)}

                </span>

            </div>

            <small>

                ${formatDate(order.createdAt)}

            </small>

        </div>

        `;

    });

    html += "</div>";

    container.innerHTML = html;

    document.getElementById("customerOrders").textContent =
        snapshot.size;

    document.getElementById("customerSpent").textContent =
        formatCurrency(totalSpent);

}

// ------------------------------------------------------
// Customer Payments
// ------------------------------------------------------

async function loadCustomerPayments() {

    const container =
        document.getElementById("customerPaymentsContainer");

    const snapshot = await getDocs(

        query(

            collection(db, "payments"),

            where("customerId", "==", selectedCustomer.id),

            orderBy("createdAt", "desc"),

            limit(20)

        )

    );

    if (snapshot.empty) {

        container.innerHTML =
            "<p class='text-muted'>No payments found.</p>";

        return;

    }

    let html =
        "<div class='list-group'>";

    snapshot.forEach(docSnap => {

        const payment = docSnap.data();

        html += `

        <div class="list-group-item">

            <div class="d-flex justify-content-between">

                <strong>

                    ${payment.method || "Payment"}

                </strong>

                <span>

                    ${formatCurrency(payment.amount)}

                </span>

            </div>

            <small>

                ${formatDate(payment.createdAt)}

            </small>

        </div>

        `;

    });

    html += "</div>";

    container.innerHTML = html;

}

// ======================================================
// Part 4
// Reviews
// Favourite Suppliers
// Addresses
// Activity Timeline
// ======================================================

// ------------------------------------------------------
// Customer Reviews
// ------------------------------------------------------

async function loadCustomerReviews() {

    const container =
        document.getElementById("customerReviewsContainer");

    try {

        const snapshot = await getDocs(

            query(

                collection(db, "reviews"),

                where("customerId", "==", selectedCustomer.id),

                orderBy("createdAt", "desc"),

                limit(20)

            )

        );

        if (snapshot.empty) {

            container.innerHTML =
                "<p class='text-muted'>No reviews found.</p>";

            document.getElementById("customerReviews").textContent = "0";
            document.getElementById("customerRating").textContent = "★ 0.0";

            return;

        }

        let html = "<div class='list-group'>";
        let totalRating = 0;
        let count = 0;

        snapshot.forEach(docSnap => {

            const review = docSnap.data();

            totalRating += Number(review.rating || 0);
            count++;

            html += `

            <div class="list-group-item">

                <div class="d-flex justify-content-between">

                    <strong>

                        ${escapeHTML(review.productName || "Product")}

                    </strong>

                    <span>

                        ⭐ ${review.rating || 0}

                    </span>

                </div>

                <div class="mt-2">

                    ${escapeHTML(review.comment || "")}

                </div>

                <small class="text-muted">

                    ${formatDate(review.createdAt)}

                </small>

            </div>

            `;

        });

        html += "</div>";

        container.innerHTML = html;

        document.getElementById("customerReviews").textContent = count;

        document.getElementById("customerRating").textContent =
            `★ ${(totalRating / count).toFixed(1)}`;

    }

    catch (error) {

        console.error(error);

        container.innerHTML =
            "<p class='text-danger'>Unable to load reviews.</p>";

    }

}

// ------------------------------------------------------
// Favourite Suppliers
// ------------------------------------------------------

async function loadFavouriteSuppliers() {

    const grid =
        document.getElementById("favouriteSuppliersGrid");

    grid.innerHTML = "";

    const favourites =
        selectedCustomer.favouriteSuppliers || [];

    if (favourites.length === 0) {

        grid.innerHTML = `
            <div class="col-12 text-center py-4">
                No favourite suppliers.
            </div>
        `;

        return;

    }

    for (const supplierId of favourites) {

        try {

            const snap =
                await getDoc(doc(db, "suppliers", supplierId));

            if (!snap.exists()) continue;

            const supplier = snap.data();

            grid.innerHTML += `

            <div class="col-md-6 col-lg-4">

                <div class="card shadow-sm h-100">

                    <div class="card-body">

                        <h6>

                            ${escapeHTML(
                                supplier.businessName || "Supplier"
                            )}

                        </h6>

                        <p class="text-muted mb-0">

                            ${escapeHTML(
                                supplier.county || "-"
                            )}

                        </p>

                    </div>

                </div>

            </div>

            `;

        }

        catch (error) {

            console.error(error);

        }

    }

}

// ------------------------------------------------------
// Saved Addresses
// ------------------------------------------------------

function loadSavedAddresses() {

    const container =
        document.getElementById("savedAddressesContainer");

    container.innerHTML = "";

    const addresses =
        selectedCustomer.savedAddresses || [];

    if (addresses.length === 0) {

        container.innerHTML = `
            <div class="col-12 text-center py-4">
                No saved addresses.
            </div>
        `;

        return;

    }

    addresses.forEach(address => {

        container.innerHTML += `

        <div class="col-md-6">

            <div class="card shadow-sm">

                <div class="card-body">

                    <h6>

                        ${escapeHTML(address.label || "Address")}

                    </h6>

                    <p class="mb-1">

                        ${escapeHTML(address.address || "-")}

                    </p>

                    <small class

// ======================================================
// Part 5
// Search
// Filters
// Pagination
// Bulk Selection
// ======================================================

// ------------------------------------------------------
// Pagination Variables
// ------------------------------------------------------

const ROWS_PER_PAGE = 10;

let currentPage = 1;


// ------------------------------------------------------
// Search & Filter Elements
// ------------------------------------------------------

const searchInput =
document.getElementById("customerSearch");

const countyFilter =
document.getElementById("countyFilter");

const statusFilter =
document.getElementById("statusFilter");

const registrationDate =
document.getElementById("registrationDate");

const paginationInfo =
document.getElementById("paginationInfo");

const paginationContainer =
document.getElementById("customersPagination");

const selectedCustomersLabel =
document.getElementById("selectedCustomersLabel");


// ------------------------------------------------------
// Register Events
// ------------------------------------------------------

function registerEventListeners(){

    searchInput?.addEventListener(

        "input",

        applyFilters

    );

    countyFilter?.addEventListener(

        "change",

        applyFilters

    );

    statusFilter?.addEventListener(

        "change",

        applyFilters

    );

    registrationDate?.addEventListener(

        "change",

        applyFilters

    );

    document

    .getElementById(

        "resetFilters"

    )

    ?.addEventListener(

        "click",

        resetFilters

    );

    document

    .getElementById(

        "selectAllCustomers"

    )

    ?.addEventListener(

        "change",

        toggleSelectAll

    );

}


// ------------------------------------------------------
// Apply Filters
// ------------------------------------------------------

function applyFilters(){

    const search =
    searchInput.value
    .trim()
    .toLowerCase();

    const county =
    countyFilter.value;

    const status =
    statusFilter.value;

    const date =
    registrationDate.value;

    filteredCustomers =

    customers.filter(customer=>{

        const matchesSearch =

            !search ||

            (customer.fullName||"")

            .toLowerCase()

            .includes(search)

            ||

            (customer.email||"")

            .toLowerCase()

            .includes(search)

            ||

            (customer.phone||"")

            .includes(search);

        const matchesCounty =

            !county ||

            customer.county===county;

        const matchesStatus =

            !status ||

            customer.status===status;

        let matchesDate = true;

        if(

            date &&

            customer.createdAt

        ){

            const registered =

            customer.createdAt

            .toDate()

            .toISOString()

            .split("T")[0];

            matchesDate =

            registered===date;

        }

        return (

            matchesSearch &&

            matchesCounty &&

            matchesStatus &&

            matchesDate

        );

    });

    currentPage = 1;

    updateCustomerBadge();

    renderCurrentPage();

}


// ------------------------------------------------------
// Reset Filters
// ------------------------------------------------------

function resetFilters(){

    searchInput.value="";

    countyFilter.value="";

    statusFilter.value="";

    registrationDate.value="";

    filteredCustomers=[

        ...customers

    ];

    currentPage=1;

    updateCustomerBadge();

    renderCurrentPage();

}


// ------------------------------------------------------
// Render Current Page
// ------------------------------------------------------

function renderCurrentPage(){

    const start =

    (currentPage-1)

    *ROWS_PER_PAGE;

    const end =

    start+

    ROWS_PER_PAGE;

    const temp =

    filteredCustomers.slice(

        start,

        end

    );

    const previous =

    filteredCustomers;

    filteredCustomers = temp;

    renderCustomersTable();

    filteredCustomers = previous;

    updatePagination();

}


// ------------------------------------------------------
// Pagination
// ------------------------------------------------------

function updatePagination(){

    const totalPages =

    Math.max(

        1,

        Math.ceil(

            filteredCustomers.length/

            ROWS_PER_PAGE

        )

    );

    paginationInfo.textContent=

    `Showing ${

        filteredCustomers.length===0

        ?0

        :(currentPage-1)

        *ROWS_PER_PAGE+1

    } - ${

        Math.min(

            currentPage*

            ROWS_PER_PAGE,

            filteredCustomers.length

        )

    } of ${

        filteredCustomers.length

    } customers`;

    let html="";

    for(

        let i=1;

        i<=totalPages;

        i++

    ){

        html+=`

        <li class="page-item ${

            i===currentPage

            ?"active":""

        }">

            <button

                class="page-link"

                data-page="${i}">

                ${i}

            </button>

        </li>

        `;

    }

    paginationContainer.innerHTML=

    html;

    paginationContainer

    .querySelectorAll(

        ".page-link"

    )

    .forEach(btn=>{

        btn.onclick=()=>{

            currentPage=

            Number(

                btn.dataset.page

            );

            renderCurrentPage();

        };

    });

}


// ------------------------------------------------------
// Select All
// ------------------------------------------------------

function toggleSelectAll(e){

    document

    .querySelectorAll(

        ".customerCheck"

    )

    .forEach(box=>{

        box.checked=

        e.target.checked;

    });

    updateSelectedCount();

}


// ------------------------------------------------------
// Selected Count
// ------------------------------------------------------

function updateSelectedCount(){

    const total=

    document

    .querySelectorAll(

        ".customerCheck:checked"

    )

    .length;

    selectedCustomersLabel.textContent=

    `${total} Selected`;

}


// ------------------------------------------------------
// Watch Checkboxes
// ------------------------------------------------------

document.addEventListener(

    "change",

    e=>{

        if(

            e.target.classList.contains(

                "customerCheck"

            )

        ){

            updateSelectedCount();

        }

    }

);

// ======================================================
// Part 6
// Customer Actions
// Export
// Print
// Notifications
// ======================================================

// ------------------------------------------------------
// Selected Customer IDs
// ------------------------------------------------------

function getSelectedCustomerIds() {

    return [...document.querySelectorAll(".customerCheck:checked")]

        .map(item => item.value);

}


// ------------------------------------------------------
// Update Customer Status
// ------------------------------------------------------

async function updateCustomerStatus(customerId, status, reason = "") {

    try {

        showLoader();

        await updateDoc(

            doc(db, "customers", customerId),

            {

                status,

                statusReason: reason,

                updatedAt: serverTimestamp()

            }

        );

        await createAuditLog(

            status,

            customerId,

            reason

        );

        hideLoader();

        showSuccess("Customer updated successfully.");

    }

    catch (error) {

        console.error(error);

        hideLoader();

        showError("Unable to update customer.");

    }

}


// ------------------------------------------------------
// Suspend Customer
// ------------------------------------------------------

document

.getElementById("confirmSuspendCustomerBtn")

?.addEventListener(

    "click",

    async () => {

        if (!selectedCustomer) return;

        const reason =

        document

        .getElementById("suspensionReason")

        ?.value.trim() || "";

        await updateCustomerStatus(

            selectedCustomer.id,

            "suspended",

            reason

        );

    }

);


// ------------------------------------------------------
// Reactivate Customer
// ------------------------------------------------------

document

.getElementById("reactivateCustomerBtn")

?.addEventListener(

    "click",

    async () => {

        if (!selectedCustomer) return;

        await updateCustomerStatus(

            selectedCustomer.id,

            "active"

        );

    }

);


// ------------------------------------------------------
// Delete Customer
// ------------------------------------------------------

document

.getElementById("confirmDeleteCustomerBtn")

?.addEventListener(

    "click",

    async () => {

        if (!selectedCustomer) return;

        const confirmText =

        document

        .getElementById("deleteCustomerConfirmation")

        ?.value;

        if (confirmText !== "DELETE") {

            showError(

                "Type DELETE to continue."

            );

            return;

        }

        try {

            showLoader();

            await deleteDoc(

                doc(

                    db,

                    "customers",

                    selectedCustomer.id

                )

            );

            await createAuditLog(

                "delete",

                selectedCustomer.id,

                "Customer deleted"

            );

            hideLoader();

            showSuccess(

                "Customer deleted."

            );

        }

        catch (error) {

            console.error(error);

            hideLoader();

            showError(

                "Unable to delete customer."

            );

        }

    }

);


// ------------------------------------------------------
// Contact Customer
// ------------------------------------------------------

document

.getElementById("sendCustomerMessageBtn")

?.addEventListener(

    "click",

    async () => {

        if (!selectedCustomer) return;

        const subject =

        document

        .getElementById("contactSubject")

        ?.value.trim();

        const message =

        document

        .getElementById("contactMessage")

        ?.value.trim();

        if (!subject || !message) {

            showError(

                "Subject and message are required."

            );

            return;

        }

        try {

            await addDoc(

                collection(

                    db,

                    "notifications"

                ),

                {

                    customerId: selectedCustomer.id,

                    subject,

                    message,

                    read: false,

                    createdAt: serverTimestamp()

                }

            );

            showSuccess(

                "Message sent."

            );

        }

        catch (error) {

            console.error(error);

            showError(

                "Unable to send message."

            );

        }

    }

);


// ------------------------------------------------------
// Save Admin Notes
// ------------------------------------------------------

document

.getElementById("saveCustomerNotesBtn")

?.addEventListener(

    "click",

    async () => {

        if (!selectedCustomer) return;

        const notes =

        document

        .getElementById("customerAdminNotes")

        ?.value || "";

        try {

            await updateDoc(

                doc(

                    db,

                    "customers",

                    selectedCustomer.id

                ),

                {

                    adminNotes: notes,

                    updatedAt: serverTimestamp()

                }

            );

            showSuccess(

                "Notes saved."

            );

        }

        catch (error) {

            console.error(error);

            showError(

                "Unable to save notes."

            );

        }

    }

);


// ------------------------------------------------------
// Export CSV
// ------------------------------------------------------

document

.getElementById("exportCustomersBtn")

?.addEventListener(

    "click",

    exportCustomersCSV

);

function exportCustomersCSV() {

    let csv =

        "Name,Email,Phone,County,Status\n";

    filteredCustomers.forEach(customer => {

        csv += `"${customer.fullName || ""}",` +

               `"${customer.email || ""}",` +

               `"${customer.phone || ""}",` +

               `"${customer.county || ""}",` +

               `"${customer.status || ""}"\n`;

    });

    const blob =

        new Blob([csv], {

            type: "text/csv"

        });

    const link =

        document.createElement("a");

    link.href =

        URL.createObjectURL(blob);

    link.download =

        "customers.csv";

    link.click();

}


// ------------------------------------------------------
// Print Customers
// ------------------------------------------------------

document

.getElementById("printCustomersBtn")

?.addEventListener(

    "click",

    () => window.print()

);


// ======================================================
// End Part 6
// ======================================================

// ======================================================
// Part 7
// Utilities
// Toasts
// Logout
// Session
// Cleanup
// ======================================================


// ------------------------------------------------------
// Toast Notifications
// ------------------------------------------------------

function showSuccess(message){

    document.getElementById(
        "successToastMessage"
    ).textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "successToast"
            )
        )
        .show();

}

function showError(message){

    document.getElementById(
        "errorToastMessage"
    ).textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "errorToast"
            )
        )
        .show();

}

function showInfo(message){

    document.getElementById(
        "infoToastMessage"
    ).textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(
            document.getElementById(
                "infoToast"
            )
        )
        .show();

}


// ------------------------------------------------------
// Audit Log
// ------------------------------------------------------

async function createAuditLog(

    action,
    targetId,
    description=""

){

    try{

        await addDoc(

            collection(
                db,
                "adminLogs"
            ),

            {

                adminId:
                currentAdmin.uid,

                adminName:
                currentAdmin.fullName ||
                currentAdmin.name ||
                "Administrator",

                action,

                targetId,

                description,

                createdAt:
                serverTimestamp()

            }

        );

    }

    catch(error){

        console.error(
            "Audit Log:",
            error
        );

    }

}


// ------------------------------------------------------
// Currency
// ------------------------------------------------------

function formatCurrency(value){

    return new Intl.NumberFormat(

        "en-KE",

        {

            style:"currency",

            currency:"KES",

            minimumFractionDigits:0

        }

    ).format(

        Number(value||0)

    );

}


// ------------------------------------------------------
// Date
// ------------------------------------------------------

function formatDate(date){

    if(!date) return "-";

    try{

        if(date.toDate){

            date = date.toDate();

        }

        return new Intl.DateTimeFormat(

            "en-KE",

            {

                dateStyle:"medium",

                timeStyle:"short"

            }

        ).format(date);

    }

    catch{

        return "-";

    }

}


// ------------------------------------------------------
// HTML Escape
// ------------------------------------------------------

function escapeHTML(text){

    const div =
    document.createElement("div");

    div.textContent =
    text || "";

    return div.innerHTML;

}


// ------------------------------------------------------
// Logout
// ------------------------------------------------------

document

.getElementById(
    "confirmLogoutBtn"
)

?.addEventListener(

    "click",

    async()=>{

        try{

            await signOut(auth);

            window.location.href =
            "login.html";

        }

        catch(error){

            console.error(error);

            showError(
                "Logout failed."
            );

        }

    }

);


// ------------------------------------------------------
// Session Expiry
// ------------------------------------------------------

auth.onIdTokenChanged?.(

    async(user)=>{

        if(!user){

            bootstrap.Modal

            .getOrCreateInstance(

                document.getElementById(

                    "sessionExpiredModal"

                )

            )

            .show();

        }

    }

);


// ------------------------------------------------------
// Login Again
// ------------------------------------------------------

document

.getElementById(
    "loginAgainBtn"
)

?.addEventListener(

    "click",

    ()=>{

        window.location.href =
        "login.html";

    }

);


// ------------------------------------------------------
// Network Status
// ------------------------------------------------------

window.addEventListener(

    "online",

    ()=>{

        showInfo(

            "Internet connection restored."

        );

    }

);

window.addEventListener(

    "offline",

    ()=>{

        showError(

            "You are offline."

        );

    }

);


// ------------------------------------------------------
// Refresh Button
// ------------------------------------------------------

document

.getElementById(
    "refreshCustomersBtn"
)

?.addEventListener(

    "click",

    ()=>{

        listenForCustomers();

        showSuccess(

            "Customer list refreshed."

        );

    }

);


// ------------------------------------------------------
// Cleanup
// ------------------------------------------------------

window.addEventListener(

    "beforeunload",

    ()=>{

        if(

            unsubscribeCustomers

        ){

            unsubscribeCustomers();

        }

    }

);


// ======================================================
// End of File
// admin-customers.js
// ======================================================