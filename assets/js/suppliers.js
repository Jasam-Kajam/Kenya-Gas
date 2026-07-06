// ======================================================
// Kenya Gas Marketplace
// Suppliers Page
// Part 1 - Foundation
// ======================================================

import { db } from "./firebase.js";

import {

    collection,

    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// FIRESTORE COLLECTION
// ======================================================

const suppliersRef =

    collection(

        db,

        "suppliers"

    );

// ======================================================
// DOM ELEMENTS
// ======================================================

// Search

const searchSupplier =

    document.getElementById(

        "searchSupplier"

    );

// Filters

const countyFilter =

    document.getElementById(

        "countyFilter"

    );

const townFilter =

    document.getElementById(

        "townFilter"

    );

const brandFilter =

    document.getElementById(

        "brandFilter"

    );

const statusFilter =

    document.getElementById(

        "statusFilter"

    );

const sortSuppliers =

    document.getElementById(

        "sortSuppliers"

    );

// Supplier Grid

const suppliersGrid =

    document.getElementById(

        "suppliersGrid"

    );

const supplierTemplate =

    document.getElementById(

        "supplierCardTemplate"

    );

// Loading

const loadingSuppliers =

    document.getElementById(

        "loadingSuppliers"

    );

const emptySuppliers =

    document.getElementById(

        "emptySuppliers"

    );

// Pagination

const pagination =

    document.getElementById(

        "pagination"

    );

const loadMoreBtn =

    document.getElementById(

        "loadMoreBtn"

    );

const loadMoreSection =

    document.getElementById(

        "loadMoreSection"

    );

// Statistics

const supplierCount =

    document.getElementById(

        "supplierCount"

    );

const verifiedSuppliers =

    document.getElementById(

        "verifiedSuppliers"

    );

const averageRating =

    document.getElementById(

        "averageRating"

    );

const countiesServed =

    document.getElementById(

        "countiesServed"

    );

const averageDelivery =

    document.getElementById(

        "averageDelivery"

    );

const displayedSuppliers =

    document.getElementById(

        "displayedSuppliers"

    );

const verifiedCount =

    document.getElementById(

        "verifiedCount"

    );

const openCount =

    document.getElementById(

        "openCount"

    );

const marketRating =

    document.getElementById(

        "marketRating"

    );

// Modal

const supplierModal =

    document.getElementById(

        "supplierModal"

    );

// Toast

const appToast =

    document.getElementById(

        "appToast"

    );

const toastMessage =

    document.getElementById(

        "toastMessage"

    );

// ======================================================
// APPLICATION STATE
// ======================================================

let suppliers = [];

let filteredSuppliers = [];

let currentPage = 1;

let suppliersPerPage = 9;

// ======================================================
// DEFAULT FILTERS
// ======================================================

const filters = {

    search: "",

    county: "",

    town: "",

    brand: "",

    status: "",

    sort: "rating"

};

// ======================================================
// LOADING HELPERS
// ======================================================

function showLoading(){

    if(loadingSuppliers)

        loadingSuppliers.classList.remove(

            "d-none"

        );

}

function hideLoading(){

    if(loadingSuppliers)

        loadingSuppliers.classList.add(

            "d-none"

        );

}

// ======================================================
// EMPTY STATE
// ======================================================

function showEmptyState(){

    if(emptySuppliers)

        emptySuppliers.classList.remove(

            "d-none"

        );

}

function hideEmptyState(){

    if(emptySuppliers)

        emptySuppliers.classList.add(

            "d-none"

        );

}

// ======================================================
// TOAST
// ======================================================

function showToast(

    message,

    type="success"

){

    if(

        !appToast ||

        !toastMessage

    ) return;

    toastMessage.textContent =

        message;

    appToast.classList.remove(

        "text-bg-success",

        "text-bg-danger",

        "text-bg-warning",

        "text-bg-info"

    );

    switch(type){

        case "danger":

            appToast.classList.add(

                "text-bg-danger"

            );

            break;

        case "warning":

            appToast.classList.add(

                "text-bg-warning"

            );

            break;

        case "info":

            appToast.classList.add(

                "text-bg-info"

            );

            break;

        default:

            appToast.classList.add(

                "text-bg-success"

            );

    }

    new bootstrap.Toast(

        appToast

    ).show();

}

// ======================================================
// LOAD SUPPLIERS FROM FIRESTORE
// ======================================================

function initializeSuppliers(){

    showLoading();

    onSnapshot(

        suppliersRef,

        (snapshot)=>{

            suppliers = [];

            snapshot.forEach(doc=>{

                suppliers.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            populateCountyFilter();

            populateTownFilter();

            applyFilters();

            hideLoading();

            console.log(

                suppliers.length,

                "suppliers loaded."

            );

        },

        (error)=>{

            console.error(

                error

            );

            hideLoading();

            showToast(

                "Unable to load suppliers.",

                "danger"

            );

        }

    );

}

// ======================================================
// POPULATE COUNTY FILTER
// ======================================================

function populateCountyFilter(){

    if(!countyFilter) return;

    const counties =

        [

            ...new Set(

                suppliers

                .map(

                    supplier=>

                    supplier.county

                )

                .filter(Boolean)

            )

        ]

        .sort();

    countyFilter.innerHTML =

        `<option value="">All Counties</option>`;

    counties.forEach(county=>{

        countyFilter.innerHTML +=

        `

        <option value="${county}">

            ${county}

        </option>

        `;

    });

}

// ======================================================
// POPULATE TOWN FILTER
// ======================================================

function populateTownFilter(){

    if(!townFilter) return;

    let towns = suppliers;

    if(filters.county){

        towns =

            towns.filter(

                supplier=>

                supplier.county===

                filters.county

            );

    }

    const uniqueTowns =

        [

            ...new Set(

                towns

                .map(

                    supplier=>

                    supplier.town

                )

                .filter(Boolean)

            )

        ]

        .sort();

    townFilter.innerHTML =

        `<option value="">All Towns</option>`;

    uniqueTowns.forEach(town=>{

        townFilter.innerHTML +=

        `

        <option value="${town}">

            ${town}

        </option>

        `;

    });

}

// ======================================================
// RESET FILTERS
// ======================================================

function resetFilters(){

    filters.search="";

    filters.county="";

    filters.town="";

    filters.brand="";

    filters.status="";

    filters.sort="rating";

    if(searchSupplier)

        searchSupplier.value="";

    if(countyFilter)

        countyFilter.value="";

    if(townFilter)

        townFilter.value="";

    if(brandFilter)

        brandFilter.value="";

    if(statusFilter)

        statusFilter.value="";

    if(sortSuppliers)

        sortSuppliers.value="rating";

    populateTownFilter();

    applyFilters();

}

// ======================================================
// RESET BUTTON
// ======================================================

const resetFiltersBtn =

    document.getElementById(

        "resetFiltersBtn"

    );

if(resetFiltersBtn){

    resetFiltersBtn.addEventListener(

        "click",

        resetFilters

    );

}

// ======================================================
// APPLY FILTERS
// ======================================================

function applyFilters(){

    filteredSuppliers =

        [...suppliers];

    // =====================================
    // SEARCH
    // =====================================

    if(filters.search){

        const search =

            filters.search

            .toLowerCase()

            .trim();

        filteredSuppliers =

            filteredSuppliers.filter(

                supplier=>

                    (supplier.businessName || "")

                    .toLowerCase()

                    .includes(search)

                    ||

                    (supplier.ownerName || "")

                    .toLowerCase()

                    .includes(search)

            );

    }

    // =====================================
    // COUNTY
    // =====================================

    if(filters.county){

        filteredSuppliers =

            filteredSuppliers.filter(

                supplier=>

                    supplier.county===

                    filters.county

            );

    }

    // =====================================
    // TOWN
    // =====================================

    if(filters.town){

        filteredSuppliers =

            filteredSuppliers.filter(

                supplier=>

                    supplier.town===

                    filters.town

            );

    }

    // =====================================
    // BRAND
    // =====================================

    if(filters.brand){

        filteredSuppliers =

            filteredSuppliers.filter(

                supplier=>{

                    const brands =

                        supplier.brands || [];

                    return brands.includes(

                        filters.brand

                    );

                }

            );

    }

    // =====================================
    // STATUS
    // =====================================

    if(filters.status){

        filteredSuppliers =

            filteredSuppliers.filter(

                supplier=>

                    (supplier.status || "")

                    .toLowerCase()===

                    filters.status

            );

    }

    sortFilteredSuppliers();

    currentPage = 1;

    renderSuppliers();

    updateStatistics();

}

// ======================================================
// SORT SUPPLIERS
// ======================================================

function sortFilteredSuppliers(){

    switch(filters.sort){

        case "price":

            filteredSuppliers.sort(

                (a,b)=>

                    (a.startingPrice||0)

                    -

                    (b.startingPrice||0)

            );

            break;

        case "delivery":

            filteredSuppliers.sort(

                (a,b)=>

                    (a.deliveryMinutes||999)

                    -

                    (b.deliveryMinutes||999)

            );

            break;

        case "reviews":

            filteredSuppliers.sort(

                (a,b)=>

                    (b.reviewCount||0)

                    -

                    (a.reviewCount||0)

            );

            break;

        case "newest":

            filteredSuppliers.sort(

                (a,b)=>{

                    const first =

                        a.createdAt?.seconds || 0;

                    const second =

                        b.createdAt?.seconds || 0;

                    return second-first;

                }

            );

            break;

        default:

            filteredSuppliers.sort(

                (a,b)=>

                    (b.rating||0)

                    -

                    (a.rating||0)

            );

    }

}

// ======================================================
// FILTER EVENTS
// ======================================================

searchSupplier?.addEventListener(

    "input",

    e=>{

        filters.search =

            e.target.value;

        applyFilters();

    }

);

countyFilter?.addEventListener(

    "change",

    e=>{

        filters.county =

            e.target.value;

        filters.town = "";

        if(townFilter){

            townFilter.value="";

        }

        populateTownFilter();

        applyFilters();

    }

);

townFilter?.addEventListener(

    "change",

    e=>{

        filters.town =

            e.target.value;

        applyFilters();

    }

);

brandFilter?.addEventListener(

    "change",

    e=>{

        filters.brand =

            e.target.value;

        applyFilters();

    }

);

statusFilter?.addEventListener(

    "change",

    e=>{

        filters.status =

            e.target.value;

        applyFilters();

    }

);

sortSuppliers?.addEventListener(

    "change",

    e=>{

        filters.sort =

            e.target.value;

        applyFilters();

    }

);

// ======================================================
// RENDER SUPPLIERS
// ======================================================

function renderSuppliers(){

    if(!suppliersGrid) return;

    suppliersGrid.innerHTML = "";

    hideEmptyState();

    if(filteredSuppliers.length===0){

        showEmptyState();

        updatePagination();

        return;

    }

    const start =

        (currentPage-1) *

        suppliersPerPage;

    const end =

        start +

        suppliersPerPage;

    const pageSuppliers =

        filteredSuppliers.slice(

            start,

            end

        );

    pageSuppliers.forEach(

        supplier=>{

            const card =

                supplierTemplate.content

                .cloneNode(true);

            // =====================================
            // LOGO
            // =====================================

            const logo =

                card.querySelector(

                    ".supplier-logo"

                );

            logo.src =

                supplier.logo ||

                "assets/images/default-supplier.png";

            logo.alt =

                supplier.businessName ||

                "Supplier";

            // =====================================
            // NAME
            // =====================================

            card.querySelector(

                ".supplier-name"

            ).textContent =

                supplier.businessName ||

                "Unknown Supplier";

            // =====================================
            // STATUS
            // =====================================

            const statusBadge =

                card.querySelector(

                    ".supplier-status"

                );

            if(

                supplier.status==="open"

            ){

                statusBadge.className =

                    "badge bg-success supplier-status";

                statusBadge.textContent =

                    "Open";

            }

            else{

                statusBadge.className =

                    "badge bg-danger supplier-status";

                statusBadge.textContent =

                    "Closed";

            }

            // =====================================
            // RATING
            // =====================================

            const rating =

                Number(

                    supplier.rating || 0

                );

            card.querySelector(

                ".supplier-rating"

            ).textContent =

                rating.toFixed(1);

            card.querySelector(

                ".supplier-reviews"

            ).textContent =

                `(${supplier.reviewCount||0} Reviews)`;

            // =====================================
            // LOCATION
            // =====================================

            card.querySelector(

                ".supplier-county"

            ).textContent =

                supplier.county ||

                "-";

            card.querySelector(

                ".supplier-town"

            ).textContent =

                supplier.town ||

                "-";

            // =====================================
            // PRICE
            // =====================================

            card.querySelector(

                ".supplier-price"

            ).textContent =

                "KES " +

                Number(

                    supplier.startingPrice||0

                ).toLocaleString(

                    "en-KE"

                );

            // =====================================
            // DELIVERY
            // =====================================

            card.querySelector(

                ".supplier-delivery"

            ).textContent =

                supplier.deliveryMinutes ||

                30;

            card.querySelector(

                ".supplier-fee"

            ).textContent =

                "KES " +

                Number(

                    supplier.deliveryFee||0

                ).toLocaleString(

                    "en-KE"

                );

            // =====================================
            // BRANDS
            // =====================================

            const brandsContainer =

                card.querySelector(

                    ".supplier-brands"

                );

            brandsContainer.innerHTML="";

            (

                supplier.brands ||

                []

            ).forEach(

                brand=>{

                    const badge =

                        document.createElement(

                            "span"

                        );

                    badge.className =

                        "badge bg-success me-1 mb-1";

                    badge.textContent =

                        brand;

                    brandsContainer.appendChild(

                        badge

                    );

                }

            );

            // =====================================
            // PROFILE BUTTON
            // =====================================

            card.querySelector(

                ".supplier-profile-btn"

            ).addEventListener(

                "click",

                ()=>{

                    openSupplierModal(

                        supplier

                    );

                }

            );

            // =====================================
            // ORDER BUTTON
            // =====================================

            card.querySelector(

                ".supplier-order-btn"

            ).addEventListener(

                "click",

                ()=>{

                    window.location.href =

                    `order.html?supplier=${supplier.id}`;

                }

            );

            // =====================================
            // CALL BUTTON
            // =====================================

            card.querySelector(

                ".supplier-call-btn"

            ).href =

                `tel:${supplier.phone||""}`;

            suppliersGrid.appendChild(

                card

            );

        }

    );

    updatePagination();

}

// ======================================================
// UPDATE MARKETPLACE STATISTICS
// ======================================================

function updateStatistics(){

    if(supplierCount){

        supplierCount.textContent =

            filteredSuppliers.length;

    }

    if(displayedSuppliers){

        displayedSuppliers.textContent =

            filteredSuppliers.length;

    }

    if(verifiedSuppliers){

        verifiedSuppliers.textContent =

            filteredSuppliers.filter(

                supplier=>supplier.verified===true

            ).length;

    }

    if(verifiedCount){

        verifiedCount.textContent =

            filteredSuppliers.filter(

                supplier=>supplier.verified===true

            ).length;

    }

    if(openCount){

        openCount.textContent =

            filteredSuppliers.filter(

                supplier=>supplier.status==="open"

            ).length;

    }

    if(countiesServed){

        countiesServed.textContent =

            new Set(

                filteredSuppliers.map(

                    supplier=>supplier.county

                )

            ).size;

    }

    let totalRating = 0;

    filteredSuppliers.forEach(

        supplier=>{

            totalRating +=

                Number(

                    supplier.rating || 0

                );

        }

    );

    const average =

        filteredSuppliers.length

        ?

        (

            totalRating /

            filteredSuppliers.length

        ).toFixed(1)

        :

        "0.0";

    if(averageRating){

        averageRating.textContent =

            average;

    }

    if(marketRating){

        marketRating.textContent =

            average;

    }

    let totalDelivery = 0;

    filteredSuppliers.forEach(

        supplier=>{

            totalDelivery +=

                Number(

                    supplier.deliveryMinutes || 0

                );

        }

    );

    if(averageDelivery){

        averageDelivery.textContent =

            filteredSuppliers.length

            ?

            Math.round(

                totalDelivery /

                filteredSuppliers.length

            ) + " min"

            :

            "0 min";

    }

}

// ======================================================
// PAGINATION
// ======================================================

function updatePagination(){

    if(!pagination) return;

    pagination.innerHTML = "";

    const totalPages =

        Math.ceil(

            filteredSuppliers.length /

            suppliersPerPage

        );

    if(totalPages<=1) return;

    for(

        let page=1;

        page<=totalPages;

        page++

    ){

        const li =

            document.createElement(

                "li"

            );

        li.className =

            "page-item " +

            (

                page===currentPage

                ?

                "active"

                :

                ""

            );

        const btn =

            document.createElement(

                "button"

            );

        btn.className =

            "page-link";

        btn.textContent =

            page;

        btn.addEventListener(

            "click",

            ()=>{

                currentPage = page;

                renderSuppliers();

                window.scrollTo({

                    top:0,

                    behavior:"smooth"

                });

            }

        );

        li.appendChild(btn);

        pagination.appendChild(li);

    }

}

// ======================================================
// SUPPLIER PROFILE MODAL
// ======================================================

function openSupplierModal(

    supplier

){

    const modalSupplierLogo =
    document.getElementById("modalSupplierLogo");

modalSupplierLogo.src =
    supplier.logo ||
    "assets/images/default-supplier.png";

    document.getElementById(

        "modalSupplierName"

    ).textContent =

        supplier.businessName ||

        "Supplier";

    document.getElementById(

        "modalCounty"

    ).textContent =

        supplier.county ||

        "-";

    document.getElementById(

        "modalTown"

    ).textContent =

        supplier.town ||

        "-";

    document.getElementById(

        "modalPhone"

    ).textContent =

        supplier.phone ||

        "-";

    document.getElementById(

        "modalEmail"

    ).textContent =

        supplier.email ||

        "-";

    document.getElementById(

        "modalBrands"

    ).textContent =

        (

            supplier.brands ||

            []

        ).join(", ");

    document.getElementById(

        "modalDelivery"

    ).textContent =

        (

            supplier.deliveryMinutes ||

            30

        ) +

        " minutes";

    document.getElementById(

        "modalFee"

    ).textContent =

        "KES " +

        Number(

            supplier.deliveryFee || 0

        ).toLocaleString(

            "en-KE"

        );

    document.getElementById(

        "modalRating"

    ).textContent =

        Number(

            supplier.rating || 0

        ).toFixed(1);

    const modal =

        new bootstrap.Modal(

            supplierModal

        );

    modal.show();

}

// ======================================================
// QUICK FILTER BUTTONS
// ======================================================

document

    .querySelectorAll(

        ".quick-filter"

    )

    .forEach(button=>{

        button.addEventListener(

            "click",

            ()=>{

                document

                    .querySelectorAll(

                        ".quick-filter"

                    )

                    .forEach(btn=>{

                        btn.classList.remove(

                            "active"

                        );

                    });

                button.classList.add(

                    "active"

                );

                const filter =

                    button.dataset.filter;

                filteredSuppliers =

                    [...suppliers];

                switch(filter){

                    case "verified":

                        filteredSuppliers =

                            filteredSuppliers.filter(

                                supplier=>

                                    supplier.verified===true

                            );

                        break;

                    case "open":

                        filteredSuppliers =

                            filteredSuppliers.filter(

                                supplier=>

                                    supplier.status==="open"

                            );

                        break;

                    case "freeDelivery":

                        filteredSuppliers =

                            filteredSuppliers.filter(

                                supplier=>

                                    Number(

                                        supplier.deliveryFee||0

                                    )===0

                            );

                        break;

                    case "topRated":

                        filteredSuppliers =

                            filteredSuppliers.filter(

                                supplier=>

                                    Number(

                                        supplier.rating||0

                                    )>=4.5

                            );

                        break;

                    default:

                        applyFilters();

                        return;

                }

                currentPage = 1;

                renderSuppliers();

                updateStatistics();

            }

        );

    });

// ======================================================
// LOAD MORE
// ======================================================

if(loadMoreBtn){

    loadMoreBtn.addEventListener(

        "click",

        ()=>{

            suppliersPerPage += 9;

            renderSuppliers();

        }

    );

}

// ======================================================
// ORDER BUTTON FROM MODAL
// ======================================================

const modalOrderBtn =

    document.getElementById(

        "modalOrderBtn"

    );

if(modalOrderBtn){

    modalOrderBtn.addEventListener(

        "click",

        ()=>{

            showToast(

                "Redirecting to order page..."

            );

        }

    );

}

// ======================================================
// BACK TO TOP
// ======================================================

const backToTop =

    document.getElementById(

        "backToTop"

    );

if(backToTop){

    window.addEventListener(

        "scroll",

        ()=>{

            backToTop.style.display =

                window.scrollY>300

                ?

                "block"

                :

                "none";

        }

    );

    backToTop.addEventListener(

        "click",

        ()=>{

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }

    );

}

// ======================================================
// INITIALIZE PAGE
// ======================================================

function initializePage(){

    initializeSuppliers();

    showToast(

        "Welcome to Kenya Gas Marketplace",

        "success"

    );

}

// ======================================================
// START APPLICATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initializePage();

    }

);
