// ======================================================
// Kenya Gas Marketplace
// Customer Orders
// Version 1.0
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

    collection,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// CURRENT USER
// ======================================================

let currentUser = null;

let currentUserData = null;

// ======================================================
// ORDERS
// ======================================================

let orders = [];

let filteredOrders = [];

// ======================================================
// PAGINATION
// ======================================================

let currentPage = 1;

const ordersPerPage = 10;

// ======================================================
// ORDER MODAL
// ======================================================

let selectedOrder = null;

// ======================================================
// NAVBAR
// ======================================================

const navbarCustomerName =

    document.getElementById(

        "navbarCustomerName"

    );

const navbarProfileImage =

    document.getElementById(

        "navbarProfileImage"

    );

// ======================================================
// SUMMARY CARDS
// ======================================================

const totalOrders =

    document.getElementById(

        "totalOrders"

    );

const pendingOrders =

    document.getElementById(

        "pendingOrders"

    );

const deliveredOrders =

    document.getElementById(

        "deliveredOrders"

    );

const totalSpent =

    document.getElementById(

        "totalSpent"

    );

// ======================================================
// FILTERS
// ======================================================

const searchOrders =

    document.getElementById(

        "searchOrders"

    );

const statusFilter =

    document.getElementById(

        "statusFilter"

    );

const paymentFilter =

    document.getElementById(

        "paymentFilter"

    );

const countyFilter =

    document.getElementById(

        "countyFilter"

    );

const supplierFilter =

    document.getElementById(

        "supplierFilter"

    );

const sortOrders =

    document.getElementById(

        "sortOrders"

    );

const dateFrom =

    document.getElementById(

        "dateFrom"

    );

const dateTo =

    document.getElementById(

        "dateTo"

    );

const refreshOrdersBtn =

    document.getElementById(

        "refreshOrdersBtn"

    );

const clearFiltersBtn =

    document.getElementById(

        "clearFiltersBtn"

    );

// ======================================================
// TABLE
// ======================================================

const ordersTableBody =

    document.getElementById(

        "ordersTableBody"

    );

const ordersCount =

    document.getElementById(

        "ordersCount"

    );

const emptyOrders =

    document.getElementById(

        "emptyOrders"

    );

const orderTemplate =

    document.getElementById(

        "orderTemplate"

    );

// ======================================================
// PAGINATION
// ======================================================

const showingFrom =

    document.getElementById(

        "showingFrom"

    );

const showingTo =

    document.getElementById(

        "showingTo"

    );

const totalResults =

    document.getElementById(

        "totalResults"

    );

const ordersPagination =

    document.getElementById(

        "ordersPagination"

    );

// ======================================================
// ORDER DETAILS MODAL
// ======================================================

const orderDetailsModal =

    document.getElementById(

        "orderDetailsModal"

    );

const modalOrderNumber =

    document.getElementById(

        "modalOrderNumber"

    );

const modalOrderDate =

    document.getElementById(

        "modalOrderDate"

    );

const modalSupplierName =

    document.getElementById(

        "modalSupplierName"

    );

const modalOrderStatus =

    document.getElementById(

        "modalOrderStatus"

    );

const modalPaymentStatus =

    document.getElementById(

        "modalPaymentStatus"

    );

const modalPaymentMethod =

    document.getElementById(

        "modalPaymentMethod"

    );

const modalItemsTable =

    document.getElementById(

        "modalItemsTable"

    );

const modalDeliveryAddress =

    document.getElementById(

        "modalDeliveryAddress"

    );

const modalSubtotal =

    document.getElementById(

        "modalSubtotal"

    );

const modalDeliveryFee =

    document.getElementById(

        "modalDeliveryFee"

    );

const modalDiscount =

    document.getElementById(

        "modalDiscount"

    );

const modalGrandTotal =

    document.getElementById(

        "modalGrandTotal"

    );

const deliveryProgress =

    document.getElementById(

        "deliveryProgress"

    );

const deliveryMessage =

    document.getElementById(

        "deliveryMessage"

    );

// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.href =

                "login.html";

            return;

        }

        currentUser = user;

        await loadCustomerProfile();

        await loadOrders();

    }

);

// ======================================================
// LOAD CUSTOMER PROFILE
// ======================================================

async function loadCustomerProfile(){

    try{

        const userRef =

            doc(

                db,

                "users",

                currentUser.uid

            );

        const userSnap =

            await getDoc(

                userRef

            );

        if(!userSnap.exists()){

            alert(

                "Profile not found."

            );

            await signOut(auth);

            return;

        }

        currentUserData =

            userSnap.data();

        if(navbarCustomerName){

            navbarCustomerName.textContent =

                `${

                    currentUserData.firstName || ""

                } ${

                    currentUserData.lastName || ""

                }`.trim();

        }

        if(

            navbarProfileImage &&

            currentUserData.photoURL

        ){

            navbarProfileImage.src =

                currentUserData.photoURL;

        }

    }

    catch(error){

        console.error(

            error

        );

    }

}

// ======================================================
// LOAD ORDERS
// ======================================================

async function loadOrders(){

    try{

        showLoading(true);

        orders = [];

        const ordersRef =

            collection(

                db,

                "orders"

            );

        const q =

            query(

                ordersRef,

                where(

                    "customerId",

                    "==",

                    currentUser.uid

                ),

                orderBy(

                    "createdAt",

                    "desc"

                )

            );

        const snapshot =

            await getDocs(

                q

            );

        snapshot.forEach(

            docSnap=>{

                orders.push({

                    id:docSnap.id,

                    ...docSnap.data()

                });

            }

        );

        filteredOrders =

            [...orders];

        populateFilters();

        updateStatistics();

        renderOrders();

        showLoading(false);

    }

    catch(error){

        console.error(

            "Orders:",

            error

        );

        showLoading(false);

        showToast(

            "Unable to load orders.",

            "danger"

        );

    }

}

// ======================================================
// POPULATE FILTERS
// ======================================================

function populateFilters(){

    if(

        supplierFilter

    ){

        supplierFilter.innerHTML =

        `

        <option value="">

            All Suppliers

        </option>

        `;

    }

    if(

        countyFilter

    ){

        countyFilter.innerHTML =

        `

        <option value="">

            All Counties

        </option>

        `;

    }

    const suppliers =

        [...new Set(

            orders.map(

                o=>o.supplierName

            ).filter(Boolean)

        )];

    const counties =

        [...new Set(

            orders.map(

                o=>o.county

            ).filter(Boolean)

        )];

    suppliers

    .sort()

    .forEach(

        supplier=>{

            const option =

                document.createElement(

                    "option"

                );

            option.value =

                supplier;

            option.textContent =

                supplier;

            supplierFilter.appendChild(

                option

            );

        }

    );

    counties

    .sort()

    .forEach(

        county=>{

            const option =

                document.createElement(

                    "option"

                );

            option.value =

                county;

            option.textContent =

                county;

            countyFilter.appendChild(

                option

            );

        }

    );

}

// ======================================================
// UPDATE DASHBOARD STATISTICS
// ======================================================

function updateStatistics(){

    if(totalOrders){

        totalOrders.textContent =

            orders.length;

    }

    if(pendingOrders){

        pendingOrders.textContent =

            orders.filter(

                order=>

                    order.status==="Pending"

            ).length;

    }

    if(deliveredOrders){

        deliveredOrders.textContent =

            orders.filter(

                order=>

                    order.status==="Delivered"

            ).length;

    }

    if(totalSpent){

        const spent =

            orders.reduce(

                (sum,order)=>

                    sum +

                    Number(

                        order.totalPrice || 0

                    ),

                0

            );

        totalSpent.textContent =

            "KES " +

            spent.toLocaleString(

                "en-KE"

            );

    }

}

// ======================================================
// APPLY FILTERS
// ======================================================

function applyFilters(){

    filteredOrders =

        [...orders];

    // ===============================
    // SEARCH
    // ===============================

    const keyword =

        searchOrders.value

        .trim()

        .toLowerCase();

    if(keyword){

        filteredOrders =

            filteredOrders.filter(

                order=>{

                    return(

                        (order.id || "")

                        .toLowerCase()

                        .includes(keyword)

                        ||

                        (order.supplierName || "")

                        .toLowerCase()

                        .includes(keyword)

                        ||

                        (order.gasType || "")

                        .toLowerCase()

                        .includes(keyword)

                    );

                }

            );

    }

    // ===============================
    // STATUS
    // ===============================

    if(statusFilter.value){

        filteredOrders =

            filteredOrders.filter(

                order=>

                    order.status===

                    statusFilter.value

            );

    }

    // ===============================
    // PAYMENT
    // ===============================

    if(paymentFilter.value){

        filteredOrders =

            filteredOrders.filter(

                order=>

                    order.paymentStatus===

                    paymentFilter.value

            );

    }

    // ===============================
    // COUNTY
    // ===============================

    if(countyFilter.value){

        filteredOrders =

            filteredOrders.filter(

                order=>

                    order.county===

                    countyFilter.value

            );

    }

    // ===============================
    // SUPPLIER
    // ===============================

    if(supplierFilter.value){

        filteredOrders =

            filteredOrders.filter(

                order=>

                    order.supplierName===

                    supplierFilter.value

            );

    }

    // ===============================
    // DATE RANGE
    // ===============================

    if(dateFrom.value){

        const from =

            new Date(

                dateFrom.value

            );

        filteredOrders =

            filteredOrders.filter(

                order=>{

                    if(!order.createdAt)

                        return false;

                    return(

                        order.createdAt

                        .toDate()

                        >=

                        from

                    );

                }

            );

    }

    if(dateTo.value){

        const to =

            new Date(

                dateTo.value

            );

        to.setHours(

            23,

            59,

            59,

            999

        );

        filteredOrders =

            filteredOrders.filter(

                order=>{

                    if(!order.createdAt)

                        return false;

                    return(

                        order.createdAt

                        .toDate()

                        <=

                        to

                    );

                }

            );

    }

    sortFilteredOrders();

}

// ======================================================
// SORT ORDERS
// ======================================================

function sortFilteredOrders(){

    switch(

        sortOrders.value

    ){

        case "oldest":

            filteredOrders.sort(

                (a,b)=>

                    a.createdAt

                    .toDate()

                    -

                    b.createdAt

                    .toDate()

            );

            break;

        case "highest":

            filteredOrders.sort(

                (a,b)=>

                    (b.totalPrice||0)

                    -

                    (a.totalPrice||0)

            );

            break;

        case "lowest":

            filteredOrders.sort(

                (a,b)=>

                    (a.totalPrice||0)

                    -

                    (b.totalPrice||0)

            );

            break;

        case "status":

            filteredOrders.sort(

                (a,b)=>

                    (a.status||"")

                    .localeCompare(

                        b.status||""

                    )

            );

            break;

        default:

            filteredOrders.sort(

                (a,b)=>

                    b.createdAt

                    .toDate()

                    -

                    a.createdAt

                    .toDate()

            );

    }

    currentPage = 1;

    renderOrders();

}

// ======================================================
// CLEAR FILTERS
// ======================================================

function clearFilters(){

    searchOrders.value = "";

    statusFilter.value = "";

    paymentFilter.value = "";

    countyFilter.value = "";

    supplierFilter.value = "";

    sortOrders.value = "latest";

    dateFrom.value = "";

    dateTo.value = "";

    applyFilters();

}

// ======================================================
// RENDER ORDERS
// ======================================================

function renderOrders(){

    if(!ordersTableBody) return;

    ordersTableBody.innerHTML = "";

    if(filteredOrders.length===0){

        if(emptyOrders){

            emptyOrders.classList.remove(

                "d-none"

            );

        }

        ordersCount.textContent =

            "0 Orders";

        updatePagination();

        return;

    }

    if(emptyOrders){

        emptyOrders.classList.add(

            "d-none"

        );

    }

    const start =

        (currentPage-1) *

        ordersPerPage;

    const end =

        start +

        ordersPerPage;

    const pageOrders =

        filteredOrders.slice(

            start,

            end

        );

    pageOrders.forEach(

        order=>{

            const card =

                orderTemplate.content

                .cloneNode(true);

            // =====================================
            // ORDER ID
            // =====================================

            card.querySelector(

                ".order-id"

            ).textContent =

                order.id;

            card.querySelector(

                ".order-reference"

            ).textContent =

                order.reference ||

                "-";

            // =====================================
            // SUPPLIER
            // =====================================

            const logo =

                card.querySelector(

                    ".supplier-logo"

                );

            logo.src =

                order.supplierLogo ||

                "assets/images/default-supplier.png";

            logo.alt =

                order.supplierName ||

                "Supplier";

            card.querySelector(

                ".supplier-name"

            ).textContent =

                order.supplierName ||

                "Unknown Supplier";

            card.querySelector(

                ".supplier-location"

            ).textContent =

                `${

                    order.town || ""

                }, ${

                    order.county || ""

                }`;

            // =====================================
            // GAS
            // =====================================

            card.querySelector(

                ".gas-type"

            ).textContent =

                order.gasType ||

                "-";

            card.querySelector(

                ".gas-brand"

            ).textContent =

                order.brand ||

                "-";

            // =====================================
            // PRICE
            // =====================================

            card.querySelector(

                ".order-total"

            ).textContent =

                "KES " +

                Number(

                    order.totalPrice || 0

                ).toLocaleString(

                    "en-KE"

                );

            // =====================================
            // PAYMENT
            // =====================================

            const paymentBadge =

                card.querySelector(

                    ".payment-status"

                );

            paymentBadge.textContent =

                order.paymentStatus ||

                "Pending";

            paymentBadge.className =

                "badge payment-status";

            switch(

                order.paymentStatus

            ){

                case "Paid":

                    paymentBadge.classList.add(

                        "bg-success"

                    );

                    break;

                case "Failed":

                    paymentBadge.classList.add(

                        "bg-danger"

                    );

                    break;

                default:

                    paymentBadge.classList.add(

                        "bg-warning"

                    );

            }

            // =====================================
            // STATUS
            // =====================================

            const statusBadge =

                card.querySelector(

                    ".order-status"

                );

            statusBadge.textContent =

                order.status ||

                "Pending";

            statusBadge.className =

                "badge order-status";

            switch(order.status){

                case "Delivered":

                    statusBadge.classList.add(

                        "bg-success"

                    );

                    break;

                case "Cancelled":

                    statusBadge.classList.add(

                        "bg-danger"

                    );

                    break;

                case "Out for Delivery":

                    statusBadge.classList.add(

                        "bg-primary"

                    );

                    break;

                case "Preparing":

                    statusBadge.classList.add(

                        "bg-info"

                    );

                    break;

                default:

                    statusBadge.classList.add(

                        "bg-warning"

                    );

            }

            // =====================================
            // DATE
            // =====================================

            if(order.createdAt){

                const date =

                    order.createdAt.toDate();

                card.querySelector(

                    ".order-date"

                ).textContent =

                    date.toLocaleDateString(

                        "en-KE"

                    );

                card.querySelector(

                    ".order-time"

                ).textContent =

                    date.toLocaleTimeString(

                        "en-KE"

                    );

            }

            // =====================================
            // ACTION BUTTONS
            // =====================================

            card.querySelector(

                ".view-order-btn"

            ).addEventListener(

                "click",

                ()=>{

                    openOrderModal(

                        order

                    );

                }

            );

            card.querySelector(

                ".track-order-btn"

            ).addEventListener(

                "click",

                ()=>{

                    openTracking(

                        order

                    );

                }

            );

            card.querySelector(

                ".reorder-btn"

            ).addEventListener(

                "click",

                ()=>{

                    reorder(

                        order

                    );

                }

            );

            card.querySelector(

                ".cancel-order-btn"

            ).addEventListener(

                "click",

                ()=>{

                    cancelOrder(

                        order

                    );

                }

            );

            ordersTableBody.appendChild(

                card

            );

        }

    );

    ordersCount.textContent =

        `${filteredOrders.length} Orders`;

    updatePagination();

}

// ======================================================
// PAGINATION
// ======================================================

function updatePagination(){

    if(!ordersPagination) return;

    ordersPagination.innerHTML = "";

    const pages =

        Math.ceil(

            filteredOrders.length /

            ordersPerPage

        );

    showingFrom.textContent =

        filteredOrders.length===0

        ? 0

        :

        (currentPage-1)

        *

        ordersPerPage

        +

        1;

    showingTo.textContent =

        Math.min(

            currentPage *

            ordersPerPage,

            filteredOrders.length

        );

    totalResults.textContent =

        filteredOrders.length;

    if(pages<=1) return;

    for(

        let i=1;

        i<=pages;

        i++

    ){

        const li =

            document.createElement(

                "li"

            );

        li.className =

            `page-item ${

                currentPage===i

                ? "active"

                : ""

            }`;

        li.innerHTML =

        `

        <button class="page-link">

            ${i}

        </button>

        `;

        li.addEventListener(

            "click",

            ()=>{

                currentPage = i;

                renderOrders();

            }

        );

        ordersPagination.appendChild(

            li

        );

    }

}

// ======================================================
// OPEN ORDER DETAILS MODAL
// ======================================================

function openOrderModal(order){

    selectedOrder = order;

    if(modalOrderNumber){

        modalOrderNumber.textContent =

            order.id;

    }

    if(modalOrderDate){

        modalOrderDate.textContent =

            order.createdAt

            ?

            order.createdAt

            .toDate()

            .toLocaleString("en-KE")

            :

            "-";

    }

    if(modalSupplierName){

        modalSupplierName.textContent =

            order.supplierName ||

            "-";

    }

    if(modalPaymentMethod){

        modalPaymentMethod.textContent =

            order.paymentMethod ||

            "Not Specified";

    }

    updateStatusBadges(order);

    loadOrderItems(order);

    loadDeliveryAddress(order);

    loadSummary(order);

    updateDeliveryProgress(order);

    const modal =

        new bootstrap.Modal(

            orderDetailsModal

        );

    modal.show();

}

// ======================================================
// STATUS BADGES
// ======================================================

function updateStatusBadges(order){

    if(modalOrderStatus){

        modalOrderStatus.textContent =

            order.status ||

            "Pending";

        modalOrderStatus.className =

            "badge";

        switch(order.status){

            case "Delivered":

                modalOrderStatus.classList.add(

                    "bg-success"

                );

                break;

            case "Cancelled":

                modalOrderStatus.classList.add(

                    "bg-danger"

                );

                break;

            case "Out for Delivery":

                modalOrderStatus.classList.add(

                    "bg-primary"

                );

                break;

            case "Preparing":

                modalOrderStatus.classList.add(

                    "bg-info"

                );

                break;

            default:

                modalOrderStatus.classList.add(

                    "bg-warning"

                );

        }

    }

    if(modalPaymentStatus){

        modalPaymentStatus.textContent =

            order.paymentStatus ||

            "Pending";

        modalPaymentStatus.className =

            "badge";

        switch(order.paymentStatus){

            case "Paid":

                modalPaymentStatus.classList.add(

                    "bg-success"

                );

                break;

            case "Failed":

                modalPaymentStatus.classList.add(

                    "bg-danger"

                );

                break;

            default:

                modalPaymentStatus.classList.add(

                    "bg-warning"

                );

        }

    }

}

// ======================================================
// ORDER ITEMS
// ======================================================

function loadOrderItems(order){

    if(!modalItemsTable) return;

    modalItemsTable.innerHTML = "";

    const items =

        order.items || [];

    items.forEach(item=>{

        modalItemsTable.innerHTML +=

        `

        <tr>

            <td>${item.gasType || "-"}</td>

            <td>${item.brand || "-"}</td>

            <td>${item.quantity || 1}</td>

            <td>KES ${Number(item.price||0).toLocaleString("en-KE")}</td>

            <td>KES ${Number(item.total||item.price||0).toLocaleString("en-KE")}</td>

        </tr>

        `;

    });

}

// ======================================================
// DELIVERY ADDRESS
// ======================================================

function loadDeliveryAddress(order){

    if(!modalDeliveryAddress)

        return;

    modalDeliveryAddress.textContent =

        order.deliveryAddress ||

        `${

            order.town || ""

        }, ${

            order.county || ""

        }`;

}

// ======================================================
// ORDER SUMMARY
// ======================================================

function loadSummary(order){

    if(modalSubtotal){

        modalSubtotal.textContent =

            "KES " +

            Number(

                order.subtotal ||

                order.totalPrice ||

                0

            ).toLocaleString("en-KE");

    }

    if(modalDeliveryFee){

        modalDeliveryFee.textContent =

            "KES " +

            Number(

                order.deliveryFee || 0

            ).toLocaleString("en-KE");

    }

    if(modalDiscount){

        modalDiscount.textContent =

            "KES " +

            Number(

                order.discount || 0

            ).toLocaleString("en-KE");

    }

    if(modalGrandTotal){

        modalGrandTotal.textContent =

            "KES " +

            Number(

                order.totalPrice || 0

            ).toLocaleString("en-KE");

    }

}

// ======================================================
// DELIVERY PROGRESS
// ======================================================

function updateDeliveryProgress(order){

    if(!deliveryProgress ||

       !deliveryMessage)

       return;

    let percent = 0;

    let message =

        "Waiting for supplier confirmation";

    switch(order.status){

        case "Pending":

            percent = 10;

            message =

                "Order received.";

            break;

        case "Confirmed":

            percent = 30;

            message =

                "Supplier confirmed your order.";

            break;

        case "Preparing":

            percent = 55;

            message =

                "Gas is being prepared.";

            break;

        case "Out for Delivery":

            percent = 80;

            message =

                "Driver is on the way.";

            break;

        case "Delivered":

            percent = 100;

            message =

                "Order delivered successfully.";

            break;

        case "Cancelled":

            percent = 0;

            message =

                "Order cancelled.";

            break;

    }

    deliveryProgress.style.width =

        percent + "%";

    deliveryProgress.textContent =

        percent + "%";

    deliveryMessage.textContent =

        message;

}

// ======================================================
// TRACK ORDER
// ======================================================

function openTracking(order){

    const timeline =

        document.getElementById(

            "trackingTimeline"

        );

    if(!timeline) return;

    timeline.innerHTML = "";

    const stages = [

        "Pending",

        "Confirmed",

        "Preparing",

        "Out for Delivery",

        "Delivered"

    ];

    let reached = true;

    stages.forEach(stage=>{

        if(stage===order.status){

            reached = false;

        }

        timeline.innerHTML +=

        `
        <li class="list-group-item">

            <i class="bi ${reached ? "bi-check-circle-fill text-success" : "bi-circle text-secondary"}"></i>

            ${stage}

        </li>
        `;

    });

    new bootstrap.Modal(

        document.getElementById(

            "trackingModal"

        )

    ).show();

}

// ======================================================
// DOWNLOAD INVOICE
// ======================================================

const downloadInvoiceBtn =

    document.getElementById(

        "downloadInvoiceBtn"

    );

if(downloadInvoiceBtn){

    downloadInvoiceBtn.addEventListener(

        "click",

        ()=>{

            if(!selectedOrder) return;

            document.getElementById(

                "invoiceNumber"

            ).textContent =

                selectedOrder.id;

            document.getElementById(

                "invoiceDate"

            ).textContent =

                selectedOrder.createdAt

                ?

                selectedOrder.createdAt

                .toDate()

                .toLocaleDateString()

                :

                "-";

            document.getElementById(

                "invoiceCustomer"

            ).textContent =

                navbarCustomerName

                ?

                navbarCustomerName.textContent

                :

                "";

            document.getElementById(

                "invoiceSupplier"

            ).textContent =

                selectedOrder.supplierName ||

                "-";

            const invoiceItems =

                document.getElementById(

                    "invoiceItems"

                );

            invoiceItems.innerHTML = "";

            (selectedOrder.items || [])

            .forEach(item=>{

                invoiceItems.innerHTML +=

                `
                <tr>

                    <td>${item.gasType}</td>

                    <td>${item.quantity}</td>

                    <td>KES ${Number(item.price).toLocaleString("en-KE")}</td>

                    <td>KES ${Number(item.total || item.price).toLocaleString("en-KE")}</td>

                </tr>
                `;

            });

            document.getElementById(

                "invoiceTotal"

            ).textContent =

                "KES " +

                Number(

                    selectedOrder.totalPrice || 0

                ).toLocaleString(

                    "en-KE"

                );

            new bootstrap.Modal(

                document.getElementById(

                    "invoiceModal"

                )

            ).show();

        }

    );

}

// ======================================================
// PRINT
// ======================================================

const printInvoiceBtn =

    document.getElementById(

        "printInvoiceBtn"

    );

if(printInvoiceBtn){

    printInvoiceBtn.addEventListener(

        "click",

        ()=>{

            window.print();

        }

    );

}

// ======================================================
// REORDER
// ======================================================

function reorder(order){

    window.location.href =

    `order.html?supplier=${order.supplierId}`;

}

// ======================================================
// CANCEL ORDER
// ======================================================

async function cancelOrder(order){

    if(

        !confirm(

            "Cancel this order?"

        )

    ) return;

    try{

        await updateDoc(

            doc(

                db,

                "orders",

                order.id

            ),

            {

                status:"Cancelled",

                updatedAt:

                serverTimestamp()

            }

        );

        showToast(

            "Order cancelled."

        );

        loadOrders();

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to cancel order.",

            "danger"

        );

    }

}

// ======================================================
// TOAST
// ======================================================

function showToast(

    message,

    type="success"

){

    const toastEl =

        document.getElementById(

            "ordersToast"

        );

    if(!toastEl) return;

    toastEl.className =

    `toast align-items-center border-0 text-bg-${type}`;

    document.getElementById(

        "toastMessage"

    ).textContent =

        message;

    new bootstrap.Toast(

        toastEl

    ).show();

}

// ======================================================
// LOADING
// ======================================================

function showLoading(show){

    const overlay =

        document.getElementById(

            "loadingOverlay"

        );

    if(!overlay) return;

    if(show){

        overlay.classList.remove(

            "d-none"

        );

        overlay.classList.add(

            "d-flex"

        );

    }

    else{

        overlay.classList.remove(

            "d-flex"

        );

        overlay.classList.add(

            "d-none"

        );

    }

}

// ======================================================
// EVENT LISTENERS
// ======================================================

searchOrders?.addEventListener(

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

countyFilter?.addEventListener(

    "change",

    applyFilters

);

supplierFilter?.addEventListener(

    "change",

    applyFilters

);

sortOrders?.addEventListener(

    "change",

    applyFilters

);

dateFrom?.addEventListener(

    "change",

    applyFilters

);

dateTo?.addEventListener(

    "change",

    applyFilters

);

refreshOrdersBtn?.addEventListener(

    "click",

    loadOrders

);

clearFiltersBtn?.addEventListener(

    "click",

    clearFilters

);

// ======================================================
// PAGE READY
// ======================================================

console.log(

    "Orders page initialized."

);
