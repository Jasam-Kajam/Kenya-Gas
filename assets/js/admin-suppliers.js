// ======================================================
// Kenya Gas Marketplace
// Admin Suppliers
// Part 1
// ======================================================

import {

    auth,
    db,
    storage

} from "./firebase.js";

import {

    onAuthStateChanged,
    signOut

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {

    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getDoc,
    doc,
    onSnapshot,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {

    ref,
    getDownloadURL

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// ======================================================
// Global Variables
// ======================================================

let suppliers = [];

let filteredSuppliers = [];

let selectedSupplier = null;

let currentPage = 1;

const pageSize = 10;

let unsubscribeSuppliers = null;


// ======================================================
// DOM Elements
// ======================================================

const loadingOverlay =
document.getElementById("loadingOverlay");

const processingOverlay =
document.getElementById("processingOverlay");

const suppliersTableBody =
document.getElementById("suppliersTableBody");

const supplierSearch =
document.getElementById("supplierSearch");

const countyFilter =
document.getElementById("countyFilter");

const statusFilter =
document.getElementById("statusFilter");

const resetFilters =
document.getElementById("resetFilters");

const supplierPagination =
document.getElementById("supplierPagination");

const totalSuppliers =
document.getElementById("totalSuppliers");

const verifiedSuppliers =
document.getElementById("verifiedSuppliers");

const pendingSuppliers =
document.getElementById("pendingSuppliers");

const suspendedSuppliers =
document.getElementById("suspendedSuppliers");

const adminName =
document.getElementById("adminName");

const adminEmail =
document.getElementById("adminEmail");

const adminPhoto =
document.getElementById("adminPhoto");

const topAdminName =
document.getElementById("topAdminName");

const topAdminPhoto =
document.getElementById("topAdminPhoto");

const successToast =
document.getElementById("successToast");

const errorToast =
document.getElementById("errorToast");

const successToastMessage =
document.getElementById("successToastMessage");

const errorToastMessage =
document.getElementById("errorToastMessage");


// ======================================================
// Loader
// ======================================================

function showLoader(){

    loadingOverlay?.classList.remove("d-none");

}

function hideLoader(){

    loadingOverlay?.classList.add("d-none");

}

function showProcessing(){

    processingOverlay?.classList.remove("d-none");

}

function hideProcessing(){

    processingOverlay?.classList.add("d-none");

}


// ======================================================
// Toasts
// ======================================================

function showSuccess(message){

    if(!successToast) return;

    successToastMessage.textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(successToast)
        .show();

}

function showError(message){

    if(!errorToast) return;

    errorToastMessage.textContent = message;

    bootstrap.Toast
        .getOrCreateInstance(errorToast)
        .show();

}


// ======================================================
// Helpers
// ======================================================

function formatDate(timestamp){

    if(!timestamp) return "-";

    const date =

        timestamp.toDate ?

        timestamp.toDate()

        :

        new Date(timestamp);

    return date.toLocaleDateString();

}

function formatCurrency(amount){

    return "KSh " +

    Number(amount || 0)

    .toLocaleString();

}

function escapeHTML(text){

    if(!text) return "";

    return text
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;");
}


// ======================================================
// Authentication
// ======================================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            location.href="login.html";

            return;

        }

        try{

            const adminRef =

                doc(

                    db,

                    "admins",

                    user.uid

                );

            const adminSnap =

                await getDoc(adminRef);

            if(!adminSnap.exists()){

                await signOut(auth);

                location.href="login.html";

                return;

            }

            const admin =

                adminSnap.data();

            adminName.textContent =
            admin.fullName || "Administrator";

            topAdminName.textContent =
            admin.fullName || "Administrator";

            adminEmail.textContent =
            admin.email || user.email;

            if(admin.photoURL){

                adminPhoto.src =
                admin.photoURL;

                topAdminPhoto.src =
                admin.photoURL;

            }

            hideLoader();

            initializePage();

        }

        catch(error){

            console.error(error);

            showError(

                "Unable to verify administrator."

            );

        }

    }

);


// ======================================================
// Logout
// ======================================================

async function logout(){

    try{

        await signOut(auth);

        location.href="login.html";

    }

    catch(error){

        console.error(error);

    }

}

document

.getElementById("logoutBtn")

?.addEventListener(

    "click",

    logout

);

document

.getElementById("topLogoutBtn")

?.addEventListener(

    "click",

    logout

);

document

.getElementById("confirmLogoutBtn")

?.addEventListener(

    "click",

    logout

);


// ======================================================
// Initialize
// ======================================================

function initializePage(){

    console.log(

        "Admin Suppliers Loaded"

    );

}

// ======================================================
// Part 2
// Load Suppliers
// Statistics
// Search
// Filters
// Pagination
// ======================================================

// ------------------------------------------------------
// Populate County Filter
// ------------------------------------------------------

async function loadCountyFilter() {

    if (!countyFilter) return;

    try {

        const counties = new Set();

        const snapshot = await getDocs(
            collection(db, "suppliers")
        );

        snapshot.forEach(doc => {

            const supplier = doc.data();

            if (supplier.county) {

                counties.add(supplier.county);

            }

        });

        countyFilter.innerHTML =

            `<option value="">All Counties</option>`;

        [...counties]
            .sort()
            .forEach(county => {

                countyFilter.innerHTML += `

                <option value="${county}">

                    ${county}

                </option>

                `;

            });

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Listen For Suppliers
// ------------------------------------------------------

function listenForSuppliers() {

    if (unsubscribeSuppliers) {

        unsubscribeSuppliers();

    }

    const q = query(

        collection(db, "suppliers"),

        orderBy("createdAt", "desc")

    );

    unsubscribeSuppliers =

        onSnapshot(

            q,

            snapshot => {

                suppliers = [];

                snapshot.forEach(doc => {

                    suppliers.push({

                        id: doc.id,

                        ...doc.data()

                    });

                });

                filteredSuppliers = [...suppliers];

                currentPage = 1;

                updateStatistics();

                renderSuppliers();

            },

            error => {

                console.error(error);

                showError(

                    "Unable to load suppliers."

                );

            }

        );

}

// ------------------------------------------------------
// Statistics
// ------------------------------------------------------

function updateStatistics() {

    totalSuppliers.textContent =

        suppliers.length;

    const verified = suppliers.filter(

        s => s.status === "active"

    ).length;

    const pending = suppliers.filter(

        s =>

        s.status === "pending" ||

        !s.status

    ).length;

    const suspended = suppliers.filter(

        s =>

        s.status === "suspended"

    ).length;

    verifiedSuppliers.textContent =

        verified;

    pendingSuppliers.textContent =

        pending;

    suspendedSuppliers.textContent =

        suspended;

}

// ------------------------------------------------------
// Supplier Badge
// ------------------------------------------------------

function statusBadge(status) {

    switch (status) {

        case "active":

            return

            `<span class="badge bg-success">

                Verified

            </span>`;

        case "pending":

            return

            `<span class="badge bg-warning">

                Pending

            </span>`;

        case "rejected":

            return

            `<span class="badge bg-danger">

                Rejected

            </span>`;

        case "suspended":

            return

            `<span class="badge bg-dark">

                Suspended

            </span>`;

        default:

            return

            `<span class="badge bg-secondary">

                Unknown

            </span>`;

    }

}

// ------------------------------------------------------
// Render Table
// ------------------------------------------------------

function renderSuppliers() {

    if (!suppliersTableBody) return;

    if (filteredSuppliers.length === 0) {

        suppliersTableBody.innerHTML =

        `

        <tr>

            <td colspan="8"

                class="text-center py-5">

                No suppliers found.

            </td>

        </tr>

        `;

        renderPagination();

        return;

    }

    const start =

        (currentPage - 1) *

        pageSize;

    const end =

        start + pageSize;

    const pageData =

        filteredSuppliers.slice(

            start,

            end

        );

    let html = "";

    pageData.forEach(supplier => {

        html += `

        <tr>

            <td>

                <input

                    type="checkbox"

                    class="supplierCheck"

                    value="${supplier.id}">

            </td>

            <td>

                <div class="fw-semibold">

                    ${escapeHTML(

                        supplier.fullName ||

                        "N/A"

                    )}

                </div>

                <small class="text-muted">

                    ${escapeHTML(

                        supplier.email ||

                        ""

                    )}

                </small>

            </td>

            <td>

                ${escapeHTML(

                    supplier.businessName ||

                    "-"

                )}

            </td>

            <td>

                ${escapeHTML(

                    supplier.county ||

                    "-"

                )}

            </td>

            <td>

                ${escapeHTML(

                    supplier.phone ||

                    "-"

                )}

            </td>

            <td>

                ${statusBadge(

                    supplier.status

                )}

            </td>

            <td>

                ${formatDate(

                    supplier.createdAt

                )}

            </td>

            <td>

                <button

                    class="btn btn-sm btn-outline-primary viewSupplierBtn"

                    data-id="${supplier.id}">

                    View

                </button>

            </td>

        </tr>

        `;

    });

    suppliersTableBody.innerHTML = html;

    renderPagination();

}

// ------------------------------------------------------
// Pagination
// ------------------------------------------------------

function renderPagination() {

    if (!supplierPagination) return;

    const totalPages =

        Math.ceil(

            filteredSuppliers.length /

            pageSize

        );

    let html = "";

    html += `

    <li class="page-item

    ${currentPage===1?"disabled":""}">

        <a

            class="page-link"

            href="#"

            id="prevPage">

            Previous

        </a>

    </li>

    `;

    for (

        let i = 1;

        i <= totalPages;

        i++

    ){

        html += `

        <li class="page-item

        ${currentPage===i?"active":""}">

            <a

                class="page-link pageNumber"

                data-page="${i}"

                href="#">

                ${i}

            </a>

        </li>

        `;

    }

    html += `

    <li class="page-item

    ${currentPage===totalPages?"disabled":""}">

        <a

            class="page-link"

            href="#"

            id="nextPage">

            Next

        </a>

    </li>

    `;

    supplierPagination.innerHTML = html;

}

// ------------------------------------------------------
// Pagination Events
// ------------------------------------------------------

document.addEventListener(

    "click",

    event => {

        if (

            event.target.classList.contains(

                "pageNumber"

            )

        ){

            event.preventDefault();

            currentPage = Number(

                event.target.dataset.page

            );

            renderSuppliers();

        }

        if (

            event.target.id ===

            "prevPage"

        ){

            event.preventDefault();

            if(currentPage>1){

                currentPage--;

                renderSuppliers();

            }

        }

        if (

            event.target.id ===

            "nextPage"

        ){

            event.preventDefault();

            const max =

            Math.ceil(

                filteredSuppliers.length/

                pageSize

            );

            if(currentPage<max){

                currentPage++;

                renderSuppliers();

            }

        }

    }

);

// ------------------------------------------------------
// Search
// ------------------------------------------------------

supplierSearch?.addEventListener(

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

resetFilters?.addEventListener(

    "click",

    () => {

        supplierSearch.value = "";

        countyFilter.value = "";

        statusFilter.value = "";

        applyFilters();

    }

);

// ------------------------------------------------------
// Filters
// ------------------------------------------------------

function applyFilters() {

    const keyword =

        supplierSearch.value

        .trim()

        .toLowerCase();

    const county =

        countyFilter.value;

    const status =

        statusFilter.value;

    filteredSuppliers =

        suppliers.filter(supplier => {

            const matchesKeyword =

                !keyword ||

                (supplier.fullName || "")

                .toLowerCase()

                .includes(keyword) ||

                (supplier.businessName || "")

                .toLowerCase()

                .includes(keyword) ||

                (supplier.phone || "")

                .includes(keyword);

            const matchesCounty =

                !county ||

                supplier.county === county;

            const matchesStatus =

                !status ||

                supplier.status === status;

            return (

                matchesKeyword &&

                matchesCounty &&

                matchesStatus

            );

        });

    currentPage = 1;

    renderSuppliers();

}

// ------------------------------------------------------
// Extend Initializer
// ------------------------------------------------------

function initializePage() {

    console.log(

        "Admin Suppliers Loaded"

    );

    loadCountyFilter();

    listenForSuppliers();

}

// ======================================================
// Part 3A
// Supplier Details
// Business Profile
// Documents
// ======================================================

import {

    updateDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ------------------------------------------------------
// DOM
// ------------------------------------------------------

const supplierDetailsModal =
document.getElementById("supplierDetailsModal");

const supplierDetailsContent =
document.getElementById("supplierDetailsContent");


// ------------------------------------------------------
// View Supplier
// ------------------------------------------------------

document.addEventListener(

    "click",

    async(event)=>{

        if(

            !event.target.classList.contains(

                "viewSupplierBtn"

            )

        ) return;

        const supplierId =

            event.target.dataset.id;

        await loadSupplierDetails(

            supplierId

        );

    }

);


// ------------------------------------------------------
// Load Supplier
// ------------------------------------------------------

async function loadSupplierDetails(id){

    try{

        showProcessing();

        const supplierRef =

            doc(

                db,

                "suppliers",

                id

            );

        const snapshot =

            await getDoc(

                supplierRef

            );

        if(

            !snapshot.exists()

        ){

            showError(

                "Supplier not found."

            );

            hideProcessing();

            return;

        }

        selectedSupplier={

            id,

            ...snapshot.data()

        };

        populateSupplierProfile();

        const modal=

        new bootstrap.Modal(

            supplierDetailsModal

        );

        modal.show();

        hideProcessing();

    }

    catch(error){

        console.error(error);

        hideProcessing();

        showError(

            "Unable to load supplier."

        );

    }

}


// ------------------------------------------------------
// Populate
// ------------------------------------------------------

function populateSupplierProfile(){

    if(!selectedSupplier) return;

    setText(

        "supplierFullName",

        selectedSupplier.fullName

    );

    setText(

        "supplierBusinessName",

        selectedSupplier.businessName

    );

    setText(

        "supplierEmail",

        selectedSupplier.email

    );

    setText(

        "supplierPhone",

        selectedSupplier.phone

    );

    setText(

        "supplierCounty",

        selectedSupplier.county

    );

    setText(

        "supplierTown",

        selectedSupplier.town

    );

    setText(

        "businessAddress",

        selectedSupplier.address

    );

    setText(

        "businessType",

        selectedSupplier.businessType

    );

    setText(

        "licenseNumber",

        selectedSupplier.licenseNumber

    );

    setText(

        "kraPin",

        selectedSupplier.kraPin

    );

    setText(

        "supplierJoined",

        formatDate(

            selectedSupplier.createdAt

        )

    );

    loadSupplierPhoto();

    loadStatusBadge();

    loadStatistics();

    loadDocuments();

}


// ------------------------------------------------------
// Helper
// ------------------------------------------------------

function setText(id,value){

    const el=

    document.getElementById(id);

    if(!el) return;

    el.textContent=

    value || "-";

}


// ------------------------------------------------------
// Photo
// ------------------------------------------------------

async function loadSupplierPhoto(){

    const image=

    document.getElementById(

        "supplierProfilePhoto"

    );

    if(

        !image ||

        !selectedSupplier.photoPath

    ) return;

    try{

        image.src=

        await getDownloadURL(

            ref(

                storage,

                selectedSupplier.photoPath

            )

        );

    }

    catch{

        image.src=

        "assets/images/default-avatar.png";

    }

}


// ------------------------------------------------------
// Status Badge
// ------------------------------------------------------

function loadStatusBadge(){

    const badge=

    document.getElementById(

        "supplierStatusBadge"

    );

    if(!badge) return;

    badge.className="badge";

    switch(

        selectedSupplier.status

    ){

        case "active":

            badge.classList.add(

                "bg-success"

            );

            badge.textContent=

            "Verified";

            break;

        case "pending":

            badge.classList.add(

                "bg-warning"

            );

            badge.textContent=

            "Pending";

            break;

        case "suspended":

            badge.classList.add(

                "bg-dark"

            );

            badge.textContent=

            "Suspended";

            break;

        case "rejected":

            badge.classList.add(

                "bg-danger"

            );

            badge.textContent=

            "Rejected";

            break;

        default:

            badge.classList.add(

                "bg-secondary"

            );

            badge.textContent=

            "Unknown";

    }

}


// ------------------------------------------------------
// Statistics
// ------------------------------------------------------

async function loadStatistics(){

    const products=

    await getDocs(

        query(

            collection(db,"products"),

            where(

                "supplierId",

                "==",

                selectedSupplier.id

            )

        )

    );

    const orders=

    await getDocs(

        query(

            collection(db,"orders"),

            where(

                "supplierId",

                "==",

                selectedSupplier.id

            )

        )

    );

    let revenue=0;

    orders.forEach(doc=>{

        revenue +=

        Number(

            doc.data().total || 0

        );

    });

    setText(

        "supplierProducts",

        products.size

    );

    setText(

        "supplierOrders",

        orders.size

    );

    setText(

        "supplierRevenue",

        formatCurrency(

            revenue

        )

    );

    setText(

        "supplierRating",

        "⭐ " +

        Number(

            selectedSupplier.rating || 0

        ).toFixed(1)

    );

}


// ------------------------------------------------------
// Documents
// ------------------------------------------------------

async function loadDocuments(){

    loadDocumentButton(

        "viewLicenseBtn",

        selectedSupplier.licenseDocument

    );

    loadDocumentButton(

        "viewIdBtn",

        selectedSupplier.idDocument

    );

    loadDocumentButton(

        "viewKraBtn",

        selectedSupplier.kraDocument

    );

}

function loadDocumentButton(

    buttonId,

    path

){

    const button=

    document.getElementById(

        buttonId

    );

    if(!button) return;

    if(!path){

        button.disabled=true;

        return;

    }

    button.disabled=false;

    button.onclick=

    async()=>{

        try{

            const url=

            await getDownloadURL(

                ref(

                    storage,

                    path

                )

            );

            document

            .getElementById(

                "documentViewer"

            )

            .src=url;

            new bootstrap.Modal(

                document.getElementById(

                    "documentPreviewModal"

                )

            ).show();

        }

        catch{

            showError(

                "Unable to open document."

            );

        }

    };

}
// ======================================================
// Part 3B
// Products
// Orders
// Reviews
// Analytics
// Maps
// ======================================================

// ------------------------------------------------------
// Load Supplier Products
// ------------------------------------------------------

async function loadSupplierProducts() {

    const tbody = document.getElementById("supplierProductsTable");

    if (!tbody || !selectedSupplier) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center py-4">
                Loading products...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(

            query(

                collection(db, "products"),

                where("supplierId", "==", selectedSupplier.id),

                orderBy("createdAt", "desc")

            )

        );

        document.getElementById("supplierProductCount").textContent =
            `${snapshot.size} Products`;

        if (snapshot.empty) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">
                        No products found.
                    </td>
                </tr>
            `;

            return;

        }

        let html = "";

        snapshot.forEach(doc => {

            const product = doc.data();

            html += `
                <tr>

                    <td>${escapeHTML(product.productName || "-")}</td>

                    <td>${escapeHTML(product.size || "-")}</td>

                    <td>${formatCurrency(product.price)}</td>

                    <td>

                        ${product.available
                            ? '<span class="badge bg-success">Available</span>'
                            : '<span class="badge bg-danger">Unavailable</span>'}

                    </td>

                </tr>
            `;

        });

        tbody.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Load Orders
// ------------------------------------------------------

async function loadSupplierOrders() {

    const tbody = document.getElementById("supplierOrdersTable");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                Loading orders...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(

            query(

                collection(db, "orders"),

                where("supplierId", "==", selectedSupplier.id),

                orderBy("createdAt", "desc"),

                limit(30)

            )

        );

        if (snapshot.empty) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        No orders found.
                    </td>
                </tr>
            `;

            return;

        }

        let html = "";

        snapshot.forEach(doc => {

            const order = doc.data();

            html += `

            <tr>

                <td>${doc.id.substring(0,8)}</td>

                <td>${escapeHTML(order.customerName)}</td>

                <td>${escapeHTML(order.productName)}</td>

                <td>${formatCurrency(order.total)}</td>

                <td>

                    ${statusBadge(order.status)}

                </td>

                <td>${formatDate(order.createdAt)}</td>

            </tr>

            `;

        });

        tbody.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Customer Reviews
// ------------------------------------------------------

async function loadSupplierReviews() {

    const container = document.getElementById("supplierReviews");

    if (!container) return;

    try {

        const snapshot = await getDocs(

            query(

                collection(db, "reviews"),

                where("supplierId", "==", selectedSupplier.id),

                orderBy("createdAt", "desc"),

                limit(20)

            )

        );

        if (snapshot.empty) {

            container.innerHTML = `
                <div class="list-group-item text-center py-5">
                    No customer reviews.
                </div>
            `;

            return;

        }

        let html = "";

        snapshot.forEach(doc => {

            const review = doc.data();

            html += `

            <div class="list-group-item">

                <div class="d-flex justify-content-between">

                    <strong>

                        ${escapeHTML(review.customerName)}

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

        container.innerHTML = html;

    }

    catch (error) {

        console.error(error);

    }

}

// ------------------------------------------------------
// Verification Timeline
// ------------------------------------------------------

function loadVerificationTimeline() {

    const timeline = document.getElementById("verificationTimeline");

    if (!timeline) return;

    timeline.innerHTML = "";

    const items = [

        {

            title: "Supplier Registered",

            date: formatDate(selectedSupplier.createdAt)

        },

        {

            title: "Documents Uploaded",

            date: formatDate(selectedSupplier.documentsUploadedAt)

        },

        {

            title: "Verification Status",

            date: selectedSupplier.status || "Pending"

        }

    ];

    items.forEach(item => {

        timeline.innerHTML += `

            <li class="mb-3">

                <strong>${item.title}</strong>

                <br>

                <small>${item.date}</small>

            </li>

        `;

    });

}

// ------------------------------------------------------
// Google Map
// ------------------------------------------------------

function loadSupplierMap() {

    const map = document.getElementById("supplierMap");

    if (!map) return;

    if (

        !selectedSupplier.latitude ||

        !selectedSupplier.longitude

    ){

        map.innerHTML = `
            <div class="text-center text-muted mt-5">
                No GPS coordinates available.
            </div>
        `;

        return;

    }

    map.innerHTML = `

        <iframe

            width="100%"

            height="350"

            style="border:0"

            loading="lazy"

            allowfullscreen

            src="https://maps.google.com/maps?q=${selectedSupplier.latitude},${selectedSupplier.longitude}&z=15&output=embed">

        </iframe>

    `;

}

// ------------------------------------------------------
// Dashboard Analytics
// ------------------------------------------------------

async function loadAnalytics() {

    try {

        let revenue = 0;

        let completed = 0;

        let cancelled = 0;

        const monthly = Array(12).fill(0);

        const snapshot = await getDocs(

            query(

                collection(db,"orders"),

                where("supplierId","==",selectedSupplier.id)

            )

        );

        snapshot.forEach(doc=>{

            const order = doc.data();

            revenue += Number(order.total || 0);

            if(order.status==="completed") completed++;
            if(order.status==="cancelled") cancelled++;

            if(order.createdAt){

                const month =
                order.createdAt.toDate().getMonth();

                monthly[month] += Number(order.total || 0);

            }

        });

        document.getElementById("analyticsRevenue").textContent =
        formatCurrency(revenue);

        document.getElementById("analyticsOrders").textContent =
        snapshot.size;

        document.getElementById("analyticsCompleted").textContent =
        completed;

        document.getElementById("analyticsCancelled").textContent =
        cancelled;

        buildRevenueChart(monthly);

    }

    catch(error){

        console.error(error);

    }

}

// ------------------------------------------------------
// Revenue Chart
// ------------------------------------------------------

let revenueChart = null;

function buildRevenueChart(data){

    const canvas =

    document.getElementById("supplierRevenueChart");

    if(!canvas) return;

    if(revenueChart){

        revenueChart.destroy();

    }

    revenueChart = new Chart(canvas,{

        type:"line",

        data:{

            labels:[

                "Jan","Feb","Mar","Apr","May","Jun",

                "Jul","Aug","Sep","Oct","Nov","Dec"

            ],

            datasets:[{

                label:"Revenue",

                data:data,

                borderWidth:3,

                tension:.35,

                fill:false

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}

// ------------------------------------------------------
// Load Everything
// ------------------------------------------------------

async function loadSupplierDashboard(){

    await loadSupplierProducts();

    await loadSupplierOrders();

    await loadSupplierReviews();

    loadVerificationTimeline();

    loadSupplierMap();

    await loadAnalytics();

}

// Extend existing loader

const originalPopulate = populateSupplierProfile;

populateSupplierProfile = function(){

    originalPopulate();

    loadSupplierDashboard();

};

// ======================================================
// Part 4A
// Approve • Reject • Suspend • Reactivate
// Audit Logs
// ======================================================

import {

    updateDoc,
    addDoc

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ------------------------------------------------------
// Audit Log
// ------------------------------------------------------

async function createAuditLog(

    action,
    supplierId,
    details = ""

){

    try{

        await addDoc(

            collection(db,"adminLogs"),

            {

                action,

                supplierId,

                details,

                adminUid: auth.currentUser.uid,

                adminEmail: auth.currentUser.email,

                createdAt: serverTimestamp()

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
// Update Supplier Status
// ------------------------------------------------------

async function updateSupplierStatus(

    supplierId,

    status,

    reason=""

){

    try{

        showProcessing();

        const supplierRef=

        doc(

            db,

            "suppliers",

            supplierId

        );

        await updateDoc(

            supplierRef,

            {

                status,

                statusReason: reason,

                updatedAt: serverTimestamp()

            }

        );

        await createAuditLog(

            status,

            supplierId,

            reason

        );

        hideProcessing();

        showSuccess(

            "Supplier updated successfully."

        );

    }

    catch(error){

        console.error(error);

        hideProcessing();

        showError(

            "Unable to update supplier."

        );

    }

}


// ------------------------------------------------------
// Approve
// ------------------------------------------------------

async function approveSupplier(){

    if(

        !selectedSupplier

    ) return;

    await updateSupplierStatus(

        selectedSupplier.id,

        "active"

    );

}


// ------------------------------------------------------
// Reject
// ------------------------------------------------------

async function rejectSupplier(){

    if(

        !selectedSupplier

    ) return;

    const reason=

    prompt(

        "Reason for rejection:"

    ) || "";

    await updateSupplierStatus(

        selectedSupplier.id,

        "rejected",

        reason

    );

}


// ------------------------------------------------------
// Suspend
// ------------------------------------------------------

async function suspendSupplier(){

    if(

        !selectedSupplier

    ) return;

    const reason=

    document

    .getElementById(

        "suspensionReason"

    )?.value ||

    "";

    await updateSupplierStatus(

        selectedSupplier.id,

        "suspended",

        reason

    );

}


// ------------------------------------------------------
// Reactivate
// ------------------------------------------------------

async function reactivateSupplier(){

    if(

        !selectedSupplier

    ) return;

    await updateSupplierStatus(

        selectedSupplier.id,

        "active"

    );

}


// ------------------------------------------------------
// Button Events
// ------------------------------------------------------

document

.getElementById(

    "approveSupplierBtn"

)

?.addEventListener(

    "click",

    approveSupplier

);


document

.getElementById(

    "rejectSupplierBtn"

)

?.addEventListener(

    "click",

    rejectSupplier

);


document

.getElementById(

    "confirmSuspendBtn"

)

?.addEventListener(

    "click",

    suspendSupplier

);


document

.getElementById(

    "reactivateSupplierBtn"

)

?.addEventListener(

    "click",

    reactivateSupplier

);


// ------------------------------------------------------
// Enable Buttons
// ------------------------------------------------------

function refreshActionButtons(){

    if(

        !selectedSupplier

    ) return;

    const approve=

    document.getElementById(

        "approveSupplierBtn"

    );

    const reject=

    document.getElementById(

        "rejectSupplierBtn"

    );

    const suspend=

    document.getElementById(

        "suspendSupplierBtn"

    );

    const reactivate=

    document.getElementById(

        "reactivateSupplierBtn"

    );

    if(

        approve

    ){

        approve.disabled=

        selectedSupplier.status===

        "active";

    }

    if(

        reject

    ){

        reject.disabled=

        selectedSupplier.status===

        "rejected";

    }

    if(

        suspend

    ){

        suspend.disabled=

        selectedSupplier.status===

        "suspended";

    }

    if(

        reactivate

    ){

        reactivate.disabled=

        selectedSupplier.status===

        "active";

    }

}


// ------------------------------------------------------
// Extend Existing Profile Loader
// ------------------------------------------------------

const previousPopulateProfile =

populateSupplierProfile;

populateSupplierProfile = function(){

    previousPopulateProfile();

    refreshActionButtons();

};


// ------------------------------------------------------
// Refresh Selected Supplier
// ------------------------------------------------------

async function refreshSelectedSupplier(){

    if(

        !selectedSupplier

    ) return;

    const snap=

    await getDoc(

        doc(

            db,

            "suppliers",

            selectedSupplier.id

        )

    );

    if(

        snap.exists()

    ){

        selectedSupplier={

            id:snap.id,

            ...snap.data()

        };

        populateSupplierProfile();

    }

}


// ------------------------------------------------------
// Listen For Status Changes
// ------------------------------------------------------

function listenToSupplierStatus(){

    if(

        !selectedSupplier

    ) return;

    return onSnapshot(

        doc(

            db,

            "suppliers",

            selectedSupplier.id

        ),

        snapshot=>{

            if(

                snapshot.exists()

            ){

                selectedSupplier={

                    id:snapshot.id,

                    ...snapshot.data()

                };

                refreshActionButtons();

            }

        }

    );

}

// ======================================================
// Part 4B
// Delete Supplier
// Bulk Actions
// Notifications
// Refresh
// ======================================================

import {

    deleteDoc,
    writeBatch

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ------------------------------------------------------
// Delete Supplier
// ------------------------------------------------------

async function deleteSupplier(){

    if(!selectedSupplier) return;

    try{

        showProcessing();

        await deleteDoc(

            doc(

                db,

                "suppliers",

                selectedSupplier.id

            )

        );

        await createAuditLog(

            "delete",

            selectedSupplier.id,

            "Supplier account deleted."

        );

        hideProcessing();

        bootstrap.Modal
        .getInstance(

            document.getElementById(

                "deleteSupplierModal"

            )

        )?.hide();

        showSuccess(

            "Supplier deleted successfully."

        );

    }

    catch(error){

        console.error(error);

        hideProcessing();

        showError(

            "Unable to delete supplier."

        );

    }

}

document

.getElementById(

    "confirmDeleteSupplierBtn"

)

?.addEventListener(

    "click",

    ()=>{

        const value=

        document

        .getElementById(

            "deleteConfirmation"

        )

        ?.value;

        if(value!=="DELETE"){

            showError(

                "Type DELETE to continue."

            );

            return;

        }

        deleteSupplier();

    }

);


// ------------------------------------------------------
// Selected Suppliers
// ------------------------------------------------------

function getSelectedSuppliers(){

    return [

        ...document.querySelectorAll(

            ".supplierCheck:checked"

        )

    ].map(

        item=>item.value

    );

}


// ------------------------------------------------------
// Bulk Update Status
// ------------------------------------------------------

async function bulkUpdateStatus(status){

    const ids=

    getSelectedSuppliers();

    if(ids.length===0){

        showError(

            "No suppliers selected."

        );

        return;

    }

    try{

        showProcessing();

        const batch=

        writeBatch(db);

        ids.forEach(id=>{

            batch.update(

                doc(

                    db,

                    "suppliers",

                    id

                ),

                {

                    status,

                    updatedAt:

                    serverTimestamp()

                }

            );

        });

        await batch.commit();

        for(const id of ids){

            await createAuditLog(

                "bulk-"+status,

                id

            );

        }

        hideProcessing();

        showSuccess(

            `${ids.length} supplier(s) updated.`

        );

    }

    catch(error){

        console.error(error);

        hideProcessing();

        showError(

            "Bulk update failed."

        );

    }

}


// ------------------------------------------------------
// Bulk Delete
// ------------------------------------------------------

async function bulkDelete(){

    const ids=

    getSelectedSuppliers();

    if(ids.length===0){

        showError(

            "Select suppliers first."

        );

        return;

    }

    if(

        !confirm(

            `Delete ${ids.length} suppliers?`

        )

    ) return;

    try{

        showProcessing();

        const batch=

        writeBatch(db);

        ids.forEach(id=>{

            batch.delete(

                doc(

                    db,

                    "suppliers",

                    id

                )

            );

        });

        await batch.commit();

        hideProcessing();

        showSuccess(

            "Bulk delete completed."

        );

    }

    catch(error){

        console.error(error);

        hideProcessing();

        showError(

            "Bulk delete failed."

        );

    }

}


// ------------------------------------------------------
// Notifications
// ------------------------------------------------------

async function sendSupplierNotification(){

    if(!selectedSupplier){

        showError(

            "No supplier selected."

        );

        return;

    }

    const title=

    document

    .getElementById(

        "notificationTitle"

    )?.value.trim();

    const message=

    document

    .getElementById(

        "notificationBody"

    )?.value.trim();

    if(!title || !message){

        showError(

            "Enter title and message."

        );

        return;

    }

    try{

        await addDoc(

            collection(

                db,

                "notifications"

            ),

            {

                supplierId:

                selectedSupplier.id,

                title,

                message,

                read:false,

                createdAt:

                serverTimestamp()

            }

        );

        await createAuditLog(

            "notification",

            selectedSupplier.id,

            title

        );

        bootstrap.Modal
        .getInstance(

            document.getElementById(

                "notificationModal"

            )

        )?.hide();

        showSuccess(

            "Notification sent."

        );

    }

    catch(error){

        console.error(error);

        showError(

            "Unable to send notification."

        );

    }

}

document

.getElementById(

    "sendNotificationNowBtn"

)

?.addEventListener(

    "click",

    sendSupplierNotification

);


// ------------------------------------------------------
// Refresh
// ------------------------------------------------------

async function refreshSuppliers(){

    showLoader();

    listenForSuppliers();

    hideLoader();

    showSuccess(

        "Supplier list refreshed."

    );

}

document

.getElementById(

    "refreshSupplierListBtn"

)

?.addEventListener(

    "click",

    refreshSuppliers

);


// ------------------------------------------------------
// Bulk Buttons
// ------------------------------------------------------

document

.getElementById(

    "bulkApproveBtn"

)

?.addEventListener(

    "click",

    ()=>bulkUpdateStatus("active")

);

document

.getElementById(

    "bulkSuspendBtn"

)

?.addEventListener(

    "click",

    ()=>bulkUpdateStatus("suspended")

);

document

.getElementById(

    "bulkRejectBtn"

)

?.addEventListener(

    "click",

    ()=>bulkUpdateStatus("rejected")

);

document

.getElementById(

    "bulkDeleteBtn"

)

?.addEventListener(

    "click",

    bulkDelete

);


// ------------------------------------------------------
// Select All
// ------------------------------------------------------

document

.getElementById(

    "selectAllSuppliers"

)

?.addEventListener(

    "change",

    e=>{

        document

        .querySelectorAll(

            ".supplierCheck"

        )

        .forEach(box=>{

            box.checked=

            e.target.checked;

        });

    }

);


// ======================================================
// End Part 4B
// ======================================================

/* =====================================================
   PART 5A
   ADMIN SUPPLIERS DASHBOARD ANALYTICS
   ===================================================== */


/* ---------- GLOBAL CHART REFERENCES ---------- */

let salesChart = null;
let supplierChart = null;


/* ---------- LOAD SUPPLIER ANALYTICS ---------- */

async function loadSupplierAnalytics() {

    try {

        const suppliersSnapshot = await getDocs(
            collection(db, "suppliers")
        );

        const ordersSnapshot = await getDocs(
            collection(db, "orders")
        );


        let totalSuppliers = 0;
        let verifiedSuppliers = 0;
        let pendingSuppliers = 0;

        let totalRevenue = 0;
        let totalOrders = 0;


        const monthlySales = {
            Jan:0,
            Feb:0,
            Mar:0,
            Apr:0,
            May:0,
            Jun:0,
            Jul:0,
            Aug:0,
            Sep:0,
            Oct:0,
            Nov:0,
            Dec:0
        };


        const supplierSales = {};



        /* -------- SUPPLIERS -------- */

        suppliersSnapshot.forEach(doc => {

            const supplier = doc.data();

            totalSuppliers++;


            if(
                supplier.status === "verified" ||
                supplier.verified === true
            ){

                verifiedSuppliers++;

            }
            else{

                pendingSuppliers++;

            }


            supplierSales[supplier.businessName || "Unknown"] = 0;

        });



        /* -------- ORDERS -------- */

        ordersSnapshot.forEach(doc => {


            const order = doc.data();


            const amount =
            Number(order.totalAmount || order.amount || 0);



            totalRevenue += amount;

            totalOrders++;



            let date;


            if(order.createdAt?.toDate){

                date = order.createdAt.toDate();

            }
            else{

                date = new Date();

            }



            const month =
            date.toLocaleString(
                "en-US",
                {
                    month:"short"
                }
            );



            if(monthlySales[month] !== undefined){

                monthlySales[month] += amount;

            }



            const supplierName =
            order.supplierName || "Unknown Supplier";



            if(!supplierSales[supplierName]){

                supplierSales[supplierName] = 0;

            }


            supplierSales[supplierName] += amount;



        });



        updateSupplierCards({

            totalSuppliers,
            verifiedSuppliers,
            pendingSuppliers,
            totalRevenue,
            totalOrders

        });



        createSalesChart(monthlySales);


        createSupplierChart(supplierSales);



    }
    catch(error){

        console.error(
            "Analytics loading error:",
            error
        );

    }

}



/* =====================================================
   UPDATE DASHBOARD CARDS
   ===================================================== */


function updateSupplierCards(data){


    const total =
    document.getElementById(
        "totalSuppliers"
    );


    const verified =
    document.getElementById(
        "verifiedSuppliers"
    );


    const pending =
    document.getElementById(
        "pendingSuppliers"
    );


    const revenue =
    document.getElementById(
        "supplierRevenue"
    );


    const orders =
    document.getElementById(
        "supplierOrders"
    );



    if(total)
        total.textContent =
        data.totalSuppliers;



    if(verified)
        verified.textContent =
        data.verifiedSuppliers;



    if(pending)
        pending.textContent =
        data.pendingSuppliers;



    if(revenue)
        revenue.textContent =
        "KES " +
        data.totalRevenue.toLocaleString();



    if(orders)
        orders.textContent =
        data.totalOrders;



}



/* =====================================================
   MONTHLY SALES CHART
   ===================================================== */


function createSalesChart(data){


    const ctx =
    document.getElementById(
        "salesChart"
    );


    if(!ctx)
        return;



    if(salesChart){

        salesChart.destroy();

    }



    salesChart =
    new Chart(
        ctx,
        {

            type:"line",

            data:{

                labels:Object.keys(data),

                datasets:[{

                    label:
                    "Monthly Sales (KES)",

                    data:
                    Object.values(data),

                    tension:0.4

                }]

            },


            options:{

                responsive:true,

                plugins:{

                    legend:{
                        display:true
                    }

                }

            }

        }

    );


}



/* =====================================================
   TOP SUPPLIERS CHART
   ===================================================== */


function createSupplierChart(data){


    const ctx =
    document.getElementById(
        "supplierChart"
    );


    if(!ctx)
        return;



    if(supplierChart){

        supplierChart.destroy();

    }



    const suppliers =
    Object.entries(data)
    .sort(
        (a,b)=>b[1]-a[1]
    )
    .slice(0,5);



    supplierChart =
    new Chart(
        ctx,
        {

            type:"bar",

            data:{

                labels:
                suppliers.map(
                    item=>item[0]
                ),


                datasets:[{

                    label:
                    "Sales Value (KES)",


                    data:
                    suppliers.map(
                        item=>item[1]
                    )

                }]

            },


            options:{

                responsive:true

            }

        }

    );


}



/* AUTO LOAD */

loadSupplierAnalytics();

 /* =====================================================
    PART 5B
    SUPPLIER MANAGEMENT TABLE
    ===================================================== */


/* ---------- GLOBAL VARIABLES ---------- */

let allSuppliers = [];



/* =====================================================
   LOAD SUPPLIER TABLE
   ===================================================== */


async function loadSuppliersTable(){


    const tableBody =
    document.getElementById(
        "suppliersTableBody"
    );


    if(!tableBody)
        return;



    tableBody.innerHTML =
    `
    <tr>
        <td colspan="8" class="text-center">
            Loading suppliers...
        </td>
    </tr>
    `;



    try{


        const snapshot =
        await getDocs(
            collection(
                db,
                "suppliers"
            )
        );



        allSuppliers = [];



        snapshot.forEach(doc=>{


            allSuppliers.push({

                id:doc.id,

                ...doc.data()

            });


        });



        renderSuppliersTable(
            allSuppliers
        );



    }
    catch(error){


        console.error(
            "Supplier loading error:",
            error
        );


        tableBody.innerHTML =
        `
        <tr>
            <td colspan="8">
                Failed loading suppliers
            </td>
        </tr>
        `;


    }


}




/* =====================================================
   RENDER SUPPLIER TABLE
   ===================================================== */


function renderSuppliersTable(
    suppliers
){


    const tableBody =
    document.getElementById(
        "suppliersTableBody"
    );


    if(!tableBody)
        return;



    tableBody.innerHTML = "";



    if(
        suppliers.length === 0
    ){


        tableBody.innerHTML =
        `
        <tr>

            <td colspan="8"
            class="text-center">

            No suppliers found

            </td>

        </tr>
        `;


        return;

    }





    suppliers.forEach(
        supplier=>{


        const status =
        supplier.status ||
        "pending";



        const verifiedBadge =
        status === "verified"

        ?

        `
        <span class="badge bg-success">
        Verified
        </span>
        `

        :

        `
        <span class="badge bg-warning">
        Pending
        </span>
        `;




        const row =
        document.createElement(
            "tr"
        );



        row.innerHTML =

        `

        <td>
        ${supplier.businessName || "-"}
        </td>


        <td>
        ${supplier.ownerName || "-"}
        </td>


        <td>
        ${supplier.phone || "-"}
        </td>


        <td>
        ${supplier.county || "-"}
        </td>


        <td>
        ${supplier.gasBrand || "-"}
        </td>


        <td>
        ${verifiedBadge}
        </td>


        <td>

        <button
        class="btn btn-sm btn-primary"
        onclick="
        viewSupplier('${supplier.id}')
        ">

        View

        </button>


        ${
        status !== "verified"

        ?

        `

        <button
        class="btn btn-sm btn-success"
        onclick="
        verifySupplier('${supplier.id}')
        ">

        Verify

        </button>

        `

        :

        ""

        }



        <button
        class="btn btn-sm btn-danger"
        onclick="
        deleteSupplier('${supplier.id}')
        ">

        Delete

        </button>


        </td>


        `;



        tableBody.appendChild(
            row
        );


    });



}




/* =====================================================
   SEARCH SUPPLIERS
   ===================================================== */


function searchSuppliers(){


    const input =
    document.getElementById(
        "supplierSearch"
    );



    if(!input)
        return;



    const keyword =
    input.value
    .toLowerCase()
    .trim();



    const filtered =
    allSuppliers.filter(
        supplier=>{


        return (

            supplier.businessName
            ?.toLowerCase()
            .includes(keyword)

            ||

            supplier.ownerName
            ?.toLowerCase()
            .includes(keyword)


            ||

            supplier.phone
            ?.includes(keyword)

            ||

            supplier.county
            ?.toLowerCase()
            .includes(keyword)


        );


    });



    renderSuppliersTable(
        filtered
    );


}




/* =====================================================
   FILTER BY STATUS
   ===================================================== */


function filterSuppliersStatus(){


    const filter =
    document.getElementById(
        "supplierStatusFilter"
    );



    if(!filter)
        return;



    const value =
    filter.value;



    if(value==="all"){


        renderSuppliersTable(
            allSuppliers
        );


        return;

    }



    const filtered =
    allSuppliers.filter(
        supplier=>

        (
            supplier.status ||
            "pending"
        )
        === value

    );



    renderSuppliersTable(
        filtered
    );


}




/* =====================================================
   VERIFY SUPPLIER
   ===================================================== */


async function verifySupplier(
    supplierId
){


    try{


        await updateDoc(

            doc(
                db,
                "suppliers",
                supplierId
            ),

            {

                status:
                "verified",


                verified:
                true,


                verifiedAt:
                serverTimestamp()

            }

        );



        alert(
            "Supplier verified successfully"
        );



        loadSuppliersTable();


    }
    catch(error){


        console.error(error);


        alert(
            "Verification failed"
        );


    }


}





/* =====================================================
   DELETE SUPPLIER
   ===================================================== */


async function deleteSupplier(
    supplierId
){


    const confirmDelete =
    confirm(
        "Delete this supplier?"
    );



    if(!confirmDelete)
        return;



    try{


        await deleteDoc(

            doc(
                db,
                "suppliers",
                supplierId
            )

        );



        alert(
            "Supplier deleted"
        );



        loadSuppliersTable();


    }
    catch(error){


        console.error(error);


        alert(
            "Delete failed"
        );


    }


}




/* =====================================================
   INITIALIZE TABLE
   ===================================================== */


loadSuppliersTable();

