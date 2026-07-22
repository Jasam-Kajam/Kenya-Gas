// ======================================================
// Kenya Gas Marketplace
// Admin Products
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
    deleteDoc,
    addDoc,
    serverTimestamp

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

let selectedProduct = null;

let products = [];

let filteredProducts = [];

let suppliers = [];

let unsubscribeProducts = null;

// ------------------------------------------------------
// DOM Elements
// ------------------------------------------------------

const tableBody =
document.getElementById("productsTableBody");

const productCountBadge =
document.getElementById("productCountBadge");

const totalProducts =
document.getElementById("totalProducts");

const approvedProducts =
document.getElementById("approvedProducts");

const outOfStockProducts =
document.getElementById("outOfStockProducts");

const featuredProducts =
document.getElementById("featuredProducts");

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

        const adminRef =
        doc(db, "admins", user.uid);

        const adminSnap =
        await getDoc(adminRef);

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

    loadSuppliers();

    listenForProducts();

    registerEventListeners();

}

// ======================================================
// Part 2
// Admin Profile
// Suppliers
// Real-time Products
// Dashboard Statistics
// ======================================================

// ------------------------------------------------------
// Load Administrator Profile
// ------------------------------------------------------

function loadAdminProfile() {

    document.getElementById("topAdminName").textContent =
        currentAdmin.fullName ||
        currentAdmin.name ||
        "Administrator";

    if (currentAdmin.photoURL) {

        document.getElementById("topAdminPhoto").src =
            currentAdmin.photoURL;

    }

}

// ------------------------------------------------------
// Load Suppliers
// ------------------------------------------------------

async function loadSuppliers() {

    try {

        const supplierFilter =
            document.getElementById("supplierFilter");

        supplierFilter.innerHTML =
            `<option value="">All Suppliers</option>`;

        const snapshot = await getDocs(

            query(

                collection(db, "suppliers"),

                orderBy("businessName")

            )

        );

        suppliers = [];

        snapshot.forEach(docSnap => {

            const supplier = {

                id: docSnap.id,

                ...docSnap.data()

            };

            suppliers.push(supplier);

            supplierFilter.innerHTML += `

                <option value="${supplier.id}">

                    ${escapeHTML(
                        supplier.businessName ||
                        "Unnamed Supplier"
                    )}

                </option>

            `;

        });

    }

    catch (error) {

        console.error(error);

        showError("Unable to load suppliers.");

    }

}

// ------------------------------------------------------
// Listen For Products
// ------------------------------------------------------

function listenForProducts() {

    if (unsubscribeProducts) {

        unsubscribeProducts();

    }

    showLoader();

    unsubscribeProducts = onSnapshot(

        query(

            collection(db, "products"),

            orderBy("createdAt", "desc")

        ),

        snapshot => {

            products = [];

            snapshot.forEach(docSnap => {

                products.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });

            });

            filteredProducts = [...products];

            updateDashboardCards();

            updateProductBadge();

            renderProductsTable();

            hideLoader();

        },

        error => {

            console.error(error);

            hideLoader();

            showError("Unable to load products.");

        }

    );

}

// ------------------------------------------------------
// Dashboard Statistics
// ------------------------------------------------------

function updateDashboardCards() {

    totalProducts.textContent =
        products.length;

    approvedProducts.textContent =

        products.filter(product =>

            product.status === "approved"

        ).length;

    outOfStockProducts.textContent =

        products.filter(product =>

            Number(product.stock || 0) <= 0

        ).length;

    featuredProducts.textContent =

        products.filter(product =>

            product.featured === true

        ).length;

}

// ------------------------------------------------------
// Product Badge
// ------------------------------------------------------

function updateProductBadge() {

    productCountBadge.textContent =

        `${filteredProducts.length} Products`;

}

// ------------------------------------------------------
// Initial Table Rendering
// ------------------------------------------------------

function renderProductsTable() {

    if (!filteredProducts.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center py-5 text-muted">

                    No products found.

                </td>

            </tr>

        `;

        return;

    }

    tableBody.innerHTML = "";

    filteredProducts.forEach(product => {

        tableBody.innerHTML += createProductRow(product);

    });

}

// ======================================================
// Part 3
// Product Table
// Row Builder
// Status & Stock Badges
// Product Details
// ======================================================

// ------------------------------------------------------
// Create Product Table Row
// ------------------------------------------------------

function createProductRow(product) {

    return `

    <tr>

        <td>

            <input

                type="checkbox"

                class="productCheck"

                value="${product.id}">

        </td>

        <td>

            <div class="d-flex align-items-center">

                <img

                    src="${product.imageURL || "assets/images/product-placeholder.png"}"

                    class="rounded border me-3"

                    width="60"

                    height="60"

                    style="object-fit:cover;">

                <div>

                    <strong>

                        ${escapeHTML(product.name || "Unnamed Product")}

                    </strong>

                    <br>

                    <small class="text-muted">

                        ${escapeHTML(product.description || "")}

                    </small>

                </div>

            </div>

        </td>

        <td>

            ${getSupplierName(product.supplierId)}

        </td>

        <td>

            ${escapeHTML(product.category || "-")}

        </td>

        <td>

            ${formatCurrency(product.price)}

        </td>

        <td>

            ${stockBadge(product.stock)}

        </td>

        <td>

            ${statusBadge(product.status)}

        </td>

        <td>

            ${formatDate(product.createdAt)}

        </td>

        <td class="text-center">

            <div class="btn-group btn-group-sm">

                <button

                    class="btn btn-outline-primary"

                    onclick="openProductDetails('${product.id}')"

                    title="View">

                    <i class="bi bi-eye"></i>

                </button>

                <button

                    class="btn btn-outline-success"

                    onclick="approveProduct('${product.id}')"

                    title="Approve">

                    <i class="bi bi-check-circle"></i>

                </button>

                <button

                    class="btn btn-outline-warning"

                    onclick="featureProduct('${product.id}')"

                    title="Feature">

                    <i class="bi bi-star"></i>

                </button>

                <button

                    class="btn btn-outline-danger"

                    onclick="deleteProduct('${product.id}')"

                    title="Delete">

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        </td>

    </tr>

    `;

}

// ------------------------------------------------------
// Supplier Name
// ------------------------------------------------------

function getSupplierName(id){

    const supplier = suppliers.find(

        item => item.id === id

    );

    return supplier

        ? escapeHTML(supplier.businessName)

        : "<span class='text-muted'>Unknown</span>";

}

// ------------------------------------------------------
// Product Status Badge
// ------------------------------------------------------

function statusBadge(status){

    switch(status){

        case "approved":

            return `<span class="badge bg-success">
                        Approved
                    </span>`;

        case "pending":

            return `<span class="badge bg-warning text-dark">
                        Pending
                    </span>`;

        case "rejected":

            return `<span class="badge bg-danger">
                        Rejected
                    </span>`;

        case "hidden":

            return `<span class="badge bg-secondary">
                        Hidden
                    </span>`;

        default:

            return `<span class="badge bg-light text-dark">
                        Unknown
                    </span>`;

    }

}

// ------------------------------------------------------
// Stock Badge
// ------------------------------------------------------

function stockBadge(stock){

    stock = Number(stock || 0);

    if(stock <= 0){

        return `<span class="badge bg-danger">
                    Out of Stock
                </span>`;

    }

    if(stock <= 10){

        return `<span class="badge bg-warning text-dark">
                    Low (${stock})
                </span>`;

    }

    return `<span class="badge bg-success">
                ${stock} Available
            </span>`;

}

// ------------------------------------------------------
// Open Product Details
// ------------------------------------------------------

async function openProductDetails(productId){

    selectedProduct = products.find(

        product => product.id === productId

    );

    if(!selectedProduct){

        showError("Product not found.");

        return;

    }

    populateProductDetails();

    bootstrap.Modal

    .getOrCreateInstance(

        document.getElementById(

            "productDetailsModal"

        )

    )

    .show();

}

// ------------------------------------------------------
// Populate Product Details
// ------------------------------------------------------

function populateProductDetails(){

    document.getElementById(

        "productName"

    ).textContent =

    selectedProduct.name || "-";

    document.getElementById(

        "productDescription"

    ).textContent =

    selectedProduct.description || "-";

    document.getElementById(

        "productPrice"

    ).textContent =

    formatCurrency(selectedProduct.price);

    document.getElementById(

        "productStock"

    ).textContent =

    selectedProduct.stock || 0;

    document.getElementById(

        "productCategory"

    ).textContent =

    selectedProduct.category || "-";

    document.getElementById(

        "productCounty"

    ).textContent =

    selectedProduct.county || "-";

    document.getElementById(

        "productTown"

    ).textContent =

    selectedProduct.town || "-";

    document.getElementById(

        "productSupplier"

    ).textContent =

    getSupplierName(selectedProduct.supplierId);

    document.getElementById(

        "productCreatedAt"

    ).textContent =

    formatDate(selectedProduct.createdAt);

    document.getElementById(

        "productStatus"

    ).innerHTML =

    statusBadge(selectedProduct.status);

    document.getElementById(

        "productMainImage"

    ).src =

    selectedProduct.imageURL ||

    "assets/images/product-placeholder.png";

}

// ======================================================
// Part 4
// Product Details
// Gallery
// Reviews
// Orders
// History
// Supplier Information
// ======================================================

// ------------------------------------------------------
// Product Image Gallery
// ------------------------------------------------------

function loadProductGallery() {

    const gallery =
        document.getElementById("productGallery");

    gallery.innerHTML = "";

    const images = selectedProduct.images ||
        (selectedProduct.imageURL ? [selectedProduct.imageURL] : []);

    if (!images.length) {

        gallery.innerHTML =
            "<small class='text-muted'>No images available.</small>";

        return;

    }

    images.forEach(image => {

        gallery.innerHTML += `

            <img

                src="${image}"

                class="rounded border"

                width="70"

                height="70"

                style="
                    object-fit:cover;
                    cursor:pointer;
                "

                onclick="
                    document.getElementById('productMainImage').src='${image}'
                ">

        `;

    });

}

// ------------------------------------------------------
// Product Statistics
// ------------------------------------------------------

function loadProductStatistics() {

    document.getElementById("productViews").textContent =
        selectedProduct.views || 0;

    document.getElementById("productOrders").textContent =
        selectedProduct.orders || 0;

    document.getElementById("productRating").textContent =
        `★ ${Number(selectedProduct.rating || 0).toFixed(1)}`;

    document.getElementById("productRevenue").textContent =
        formatCurrency(selectedProduct.revenue || 0);

}

// ------------------------------------------------------
// Product Specifications
// ------------------------------------------------------

function loadSpecifications() {

    const container =
        document.getElementById("productSpecifications");

    const specs =
        selectedProduct.specifications || {};

    if (!Object.keys(specs).length) {

        container.innerHTML =
            "<p class='text-muted'>No specifications available.</p>";

        return;

    }

    let html = "<div class='table-responsive'><table class='table table-sm'>";

    Object.entries(specs).forEach(([key, value]) => {

        html += `

            <tr>

                <th width="35%">

                    ${escapeHTML(key)}

                </th>

                <td>

                    ${escapeHTML(String(value))}

                </td>

            </tr>

        `;

    });

    html += "</table></div>";

    container.innerHTML = html;

}

// ------------------------------------------------------
// Customer Reviews
// ------------------------------------------------------

async function loadProductReviews() {

    const container =
        document.getElementById("productReviewsContainer");

    container.innerHTML = "Loading reviews...";

    try {

        const snapshot = await getDocs(

            query(

                collection(db, "reviews"),

                where("productId", "==", selectedProduct.id),

                orderBy("createdAt", "desc"),

                limit(10)

            )

        );

        if (snapshot.empty) {

            container.innerHTML =
                "<p class='text-muted'>No reviews found.</p>";

            return;

        }

        let html = "";

        snapshot.forEach(docSnap => {

            const review = docSnap.data();

            html += `

                <div class="border-bottom pb-3 mb-3">

                    <div class="d-flex justify-content-between">

                        <strong>

                            ${escapeHTML(review.customerName || "Customer")}

                        </strong>

                        <span>

                            ⭐ ${review.rating || 0}

                        </span>

                    </div>

                    <p class="mb-1">

                        ${escapeHTML(review.comment || "")}

                    </p>

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

        container.innerHTML =
            "<p class='text-danger'>Unable to load reviews.</p>";

    }

}

// ------------------------------------------------------
// Supplier Information
// ------------------------------------------------------

function loadSupplierInformation() {

    const supplier = suppliers.find(

        item => item.id === selectedProduct.supplierId

    );

    if (!supplier) return;

    document.getElementById("supplierLogo").src =
        supplier.logoURL ||
        supplier.photoURL ||
        "assets/images/default-avatar.png";

    document.getElementById("supplierBusinessName").textContent =
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

    document.getElementById("supplierStatus").textContent =
        supplier.status || "-";

    document.getElementById("supplierProducts").textContent =
        products.filter(

            item => item.supplierId === supplier.id

        ).length;

}

// ------------------------------------------------------
// Load All Product Details
// ------------------------------------------------------

async function loadCompleteProductDetails() {

    loadProductGallery();

    loadProductStatistics();

    loadSpecifications();

    loadSupplierInformation();

    await loadProductReviews();

}

// ======================================================
// Part 5
// Search
// Filters
// Pagination
// Bulk Actions
// Export & Print
// ======================================================

// ------------------------------------------------------
// Pagination Variables
// ------------------------------------------------------

const ROWS_PER_PAGE = 10;

let currentPage = 1;

// ------------------------------------------------------
// Search & Filters
// ------------------------------------------------------

function registerEventListeners() {

    document.getElementById("productSearch")
        ?.addEventListener("input", applyFilters);

    document.getElementById("categoryFilter")
        ?.addEventListener("change", applyFilters);

    document.getElementById("supplierFilter")
        ?.addEventListener("change", applyFilters);

    document.getElementById("countyFilter")
        ?.addEventListener("change", applyFilters);

    document.getElementById("stockFilter")
        ?.addEventListener("change", applyFilters);

    document.getElementById("resetFilters")
        ?.addEventListener("click", resetFilters);

    document.getElementById("selectAllProducts")
        ?.addEventListener("change", toggleSelectAll);

    document.getElementById("exportProductsBtn")
        ?.addEventListener("click", exportProductsCSV);

    document.getElementById("printProductsBtn")
        ?.addEventListener("click", () => window.print());

    document.getElementById("refreshProductsBtn")
        ?.addEventListener("click", listenForProducts);

}

// ------------------------------------------------------
// Apply Filters
// ------------------------------------------------------

function applyFilters() {

    const search =
        document.getElementById("productSearch")
        .value
        .trim()
        .toLowerCase();

    const category =
        document.getElementById("categoryFilter").value;

    const supplier =
        document.getElementById("supplierFilter").value;

    const county =
        document.getElementById("countyFilter").value;

    const stock =
        document.getElementById("stockFilter").value;

    filteredProducts = products.filter(product => {

        const matchesSearch =
            !search ||

            (product.name || "")
            .toLowerCase()
            .includes(search) ||

            (product.description || "")
            .toLowerCase()
            .includes(search);

        const matchesCategory =
            !category ||
            product.category === category;

        const matchesSupplier =
            !supplier ||
            product.supplierId === supplier;

        const matchesCounty =
            !county ||
            product.county === county;

        let matchesStock = true;

        const qty = Number(product.stock || 0);

        if (stock === "in_stock")
            matchesStock = qty > 10;

        if (stock === "low_stock")
            matchesStock = qty > 0 && qty <= 10;

        if (stock === "out_of_stock")
            matchesStock = qty <= 0;

        return (

            matchesSearch &&
            matchesCategory &&
            matchesSupplier &&
            matchesCounty &&
            matchesStock

        );

    });

    currentPage = 1;

    updateProductBadge();

    renderCurrentPage();

}

// ------------------------------------------------------
// Reset Filters
// ------------------------------------------------------

function resetFilters() {

    document.getElementById("productSearch").value = "";

    document.getElementById("categoryFilter").value = "";

    document.getElementById("supplierFilter").value = "";

    document.getElementById("countyFilter").value = "";

    document.getElementById("stockFilter").value = "";

    filteredProducts = [...products];

    currentPage = 1;

    updateProductBadge();

    renderCurrentPage();

}

// ------------------------------------------------------
// Render Current Page
// ------------------------------------------------------

function renderCurrentPage() {

    const start =
        (currentPage - 1) *
        ROWS_PER_PAGE;

    const end =
        start +
        ROWS_PER_PAGE;

    const original =
        filteredProducts;

    filteredProducts =
        original.slice(start, end);

    renderProductsTable();

    filteredProducts =
        original;

    updatePagination();

}

// ------------------------------------------------------
// Pagination
// ------------------------------------------------------

function updatePagination() {

    const pages = Math.max(

        1,

        Math.ceil(

            filteredProducts.length /
            ROWS_PER_PAGE

        )

    );

    document.getElementById(

        "paginationInfo"

    ).textContent =

        `Showing ${filteredProducts.length}
         Products`;

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

            "productsPagination"

        );

    pagination.innerHTML = html;

    pagination

    .querySelectorAll(".page-link")

    .forEach(btn => {

        btn.onclick = () => {

            currentPage =

                Number(btn.dataset.page);

            renderCurrentPage();

        };

    });

}

// ------------------------------------------------------
// Select All Products
// ------------------------------------------------------

function toggleSelectAll(event) {

    document

    .querySelectorAll(".productCheck")

    .forEach(item => {

        item.checked = event.target.checked;

    });

    updateSelectedProducts();

}

// ------------------------------------------------------
// Selected Count
// ------------------------------------------------------

function updateSelectedProducts() {

    const total =

        document

        .querySelectorAll(

            ".productCheck:checked"

        )

        .length;

    document.getElementById(

        "selectedProductsLabel"

    ).textContent =

        `${total} Selected`;

}

document.addEventListener(

    "change",

    event => {

        if (

            event.target.classList.contains(

                "productCheck"

            )

        ) {

            updateSelectedProducts();

        }

    }

);

// ------------------------------------------------------
// Export CSV
// ------------------------------------------------------

function exportProductsCSV() {

    let csv =

        "Product,Supplier,Category,Price,Stock,Status\n";

    filteredProducts.forEach(product => {

        csv +=

            `"${product.name || ""}",` +

            `"${getSupplierName(product.supplierId)}",` +

            `"${product.category || ""}",` +

            `"${product.price || 0}",` +

            `"${product.stock || 0}",` +

            `"${product.status || ""}"\n`;

    });

    const blob = new Blob(

        [csv],

        {

            type: "text/csv"

        }

    );

    const link =

        document.createElement("a");

    link.href =

        URL.createObjectURL(blob);

    link.download =

        "products.csv";

    link.click();

}

// ======================================================
// End Part 5
// ======================================================

// ======================================================
// Part 6
// Product Actions
// Utilities
// Logout
// Session
// Cleanup
// ======================================================

// ------------------------------------------------------
// Update Product Status
// ------------------------------------------------------

async function updateProduct(productId, data) {

    try {

        showLoader();

        await updateDoc(

            doc(db, "products", productId),

            {

                ...data,

                updatedAt: serverTimestamp()

            }

        );

        await createAuditLog(

            "product_update",

            productId,

            JSON.stringify(data)

        );

        hideLoader();

        showSuccess("Product updated successfully.");

    }

    catch (error) {

        console.error(error);

        hideLoader();

        showError("Unable to update product.");

    }

}

// ------------------------------------------------------
// Approve Product
// ------------------------------------------------------

window.approveProduct = async function(productId) {

    await updateProduct(productId, {

        status: "approved"

    });

};

// ------------------------------------------------------
// Reject Product
// ------------------------------------------------------

window.rejectProduct = async function(productId) {

    await updateProduct(productId, {

        status: "rejected"

    });

};

// ------------------------------------------------------
// Feature Product
// ------------------------------------------------------

window.featureProduct = async function(productId) {

    await updateProduct(productId, {

        featured: true

    });

};

// ------------------------------------------------------
// Hide Product
// ------------------------------------------------------

window.hideProduct = async function(productId) {

    await updateProduct(productId, {

        status: "hidden"

    });

};

// ------------------------------------------------------
// Delete Product
// ------------------------------------------------------

window.deleteProduct = async function(productId) {

    if (!confirm("Delete this product permanently?")) {

        return;

    }

    try {

        showLoader();

        await deleteDoc(

            doc(db, "products", productId)

        );

        await createAuditLog(

            "delete_product",

            productId,

            "Product deleted"

        );

        hideLoader();

        showSuccess("Product deleted.");

    }

    catch (error) {

        console.error(error);

        hideLoader();

        showError("Unable to delete product.");

    }

};

// ------------------------------------------------------
// Save Admin Notes
// ------------------------------------------------------

document

.getElementById("saveProductNotesBtn")

?.addEventListener(

    "click",

    async () => {

        if (!selectedProduct) return;

        const notes =

            document.getElementById(

                "productAdminNotes"

            ).value;

        await updateProduct(

            selectedProduct.id,

            {

                adminNotes: notes

            }

        );

    }

);

// ------------------------------------------------------
// Toast Helpers
// ------------------------------------------------------

function showSuccess(message) {

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

function showError(message) {

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

// ------------------------------------------------------
// Audit Log
// ------------------------------------------------------

async function createAuditLog(

    action,

    targetId,

    description = ""

) {

    try {

        await addDoc(

            collection(

                db,

                "adminLogs"

            ),

            {

                adminId: currentAdmin.uid,

                adminName:

                    currentAdmin.fullName ||

                    "Administrator",

                action,

                targetId,

                description,

                createdAt:

                    serverTimestamp()

            }

        );

    }

    catch (error) {

        console.error(

            "Audit Log:",

            error

        );

    }

}

// ------------------------------------------------------
// Utility Functions
// ------------------------------------------------------

function formatCurrency(value) {

    return new Intl.NumberFormat(

        "en-KE",

        {

            style: "currency",

            currency: "KES",

            minimumFractionDigits: 0

        }

    ).format(Number(value || 0));

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

.getElementById("confirmLogoutBtn")

?.addEventListener(

    "click",

    async () => {

        await signOut(auth);

        window.location.href =

            "login.html";

    }

);

// ------------------------------------------------------
// Session Monitoring
// ------------------------------------------------------

auth.onIdTokenChanged?.(

    user => {

        if (!user) {

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

document

.getElementById("loginAgainBtn")

?.addEventListener(

    "click",

    () => {

        window.location.href =

            "login.html";

    }

);

// ------------------------------------------------------
// Online / Offline
// ------------------------------------------------------

window.addEventListener(

    "online",

    () => {

        document

            .getElementById(

                "offlineBanner"

            )

            ?.classList.add("d-none");

    }

);

window.addEventListener(

    "offline",

    () => {

        document

            .getElementById(

                "offlineBanner"

            )

            ?.classList.remove("d-none");

    }

);

// ------------------------------------------------------
// Cleanup
// ------------------------------------------------------

window.addEventListener(

    "beforeunload",

    () => {

        if (unsubscribeProducts) {

            unsubscribeProducts();

        }

    }

);

// ======================================================
// End of File
// admin-products.js
// ======================================================

