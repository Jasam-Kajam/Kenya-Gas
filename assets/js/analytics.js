// ======================================================
// Kenya Gas Marketplace
// Professional Analytics Dashboard
// Part 1
// ======================================================

// ======================================================
// FIREBASE
// ======================================================

import { auth, db } from "./firebase.js";

import {

    collection,

    query,

    where,

    getDocs,

    onSnapshot,

    Timestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// CHART.JS
// ======================================================

import Chart from

"https://cdn.jsdelivr.net/npm/chart.js@4.4.3/+esm";

// ======================================================
// DOM ELEMENTS
// ======================================================

// KPI Cards

const totalRevenue =
    document.getElementById("totalRevenue");

const totalOrders =
    document.getElementById("totalOrders");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalSuppliers =
    document.getElementById("totalSuppliers");

// Charts

const revenueCanvas =
    document.getElementById("revenueChart");

const ordersCanvas =
    document.getElementById("ordersChart");

const gasCanvas =
    document.getElementById("gasChart");

const supplierCanvas =
    document.getElementById("supplierChart");

// Filters

const dateFilter =
    document.getElementById("dateFilter");

const refreshAnalytics =
    document.getElementById("refreshAnalytics");

// ======================================================
// GLOBAL VARIABLES
// ======================================================

// Cached Firestore data

let ordersData = [];

let customersData = [];

let suppliersData = [];

// Current filter

let selectedFilter = "all";

// Chart instances

let revenueChart = null;

let ordersChart = null;

let gasChart = null;

let supplierChart = null;

// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeDashboard

);

async function initializeDashboard(){

    setupEventListeners();

    await refreshDashboard();

    startRealtimeUpdates();

}// ======================================================
// EVENT LISTENERS
// ======================================================

function setupEventListeners(){

    if(dateFilter){

        dateFilter.addEventListener(

            "change",

            async ()=>{

                selectedFilter =
                    dateFilter.value;

                await refreshDashboard();

            }

        );

    }

    if(refreshAnalytics){

        refreshAnalytics.addEventListener(

            "click",

            refreshDashboard

        );

    }

}

// ======================================================
// LOADING INDICATOR
// ======================================================

function setLoading(isLoading){

    document.body.style.cursor =

        isLoading

        ? "progress"

        : "default";

}// ======================================================
// PART 2
// DATA LOADER & REAL-TIME UPDATES
// ======================================================

// ======================================================
// LOAD ANALYTICS DATA
// ======================================================

async function loadAnalyticsData(){

    ordersData = [];

    customersData = [];

    suppliersData = [];

    try{

        // -----------------------------
        // Orders
        // -----------------------------

        const ordersSnapshot =
            await getDocs(
                buildOrdersQuery()
            );

        ordersSnapshot.forEach(doc=>{

            ordersData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        // -----------------------------
        // Customers
        // -----------------------------

        const customersSnapshot =
            await getDocs(

                query(

                    collection(db,"users"),

                    where(
                        "role",
                        "==",
                        "customer"
                    )

                )

            );

        customersSnapshot.forEach(doc=>{

            customersData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        // -----------------------------
        // Suppliers
        // -----------------------------

        const suppliersSnapshot =
            await getDocs(
                collection(db,"suppliers")
            );

        suppliersSnapshot.forEach(doc=>{

            suppliersData.push({

                id:doc.id,

                ...doc.data()

            });

        });

    }

    catch(error){

        console.error(

            "Failed loading analytics",

            error

        );

    }

}// ======================================================
// BUILD FILTERED QUERY
// ======================================================

function buildOrdersQuery(){

    let startDate = null;

    const now = new Date();

    switch(selectedFilter){

        case "today":

            startDate = new Date();

            startDate.setHours(

                0,

                0,

                0,

                0

            );

            break;

        case "7days":

            startDate = new Date();

            startDate.setDate(

                now.getDate()-7

            );

            break;

        case "30days":

            startDate = new Date();

            startDate.setDate(

                now.getDate()-30

            );

            break;

        case "year":

            startDate =

                new Date(

                    now.getFullYear(),

                    0,

                    1

                );

            break;

    }

    if(startDate){

        return query(

            collection(db,"orders"),

            where(

                "createdAt",

                ">=",

                Timestamp.fromDate(startDate)

            )

        );

    }

    return query(

        collection(db,"orders")

    );

}// ======================================================
// REAL-TIME DASHBOARD
// ======================================================

let unsubscribeOrders = null;

function startRealtimeUpdates(){

    if(unsubscribeOrders){

        unsubscribeOrders();

    }

    unsubscribeOrders =

        onSnapshot(

            buildOrdersQuery(),

            async ()=>{

                console.log(

                    "Analytics Updated"

                );

                await refreshDashboard();

            }

        );

}// ======================================================
// HELPER FUNCTIONS
// ======================================================

function currency(amount){

    return "KES " +

        Number(amount)

        .toLocaleString(

            "en-KE"

        );

}

function formatNumber(number){

    return Number(number)

        .toLocaleString(

            "en-KE"

        );

}// ======================================================
// PART 3
// KPI DASHBOARD
// ======================================================

async function loadDashboardCards(){

    // -----------------------------------
    // Empty Dashboard
    // -----------------------------------

    if(ordersData.length===0){

        totalRevenue.textContent="KES 0";

        totalOrders.textContent="0";

        totalCustomers.textContent=
            formatNumber(customersData.length);

        totalSuppliers.textContent=
            formatNumber(suppliersData.length);

        updateExtraCards({

            averageOrder:0,

            pending:0,

            completed:0,

            cancelled:0

        });

        return;

    }

    // -----------------------------------
    // Revenue
    // -----------------------------------

    let revenue=0;

    let pending=0;

    let completed=0;

    let cancelled=0;

    ordersData.forEach(order=>{

        revenue += Number(

            order.totalPrice || 0

        );

        switch(order.status){

            case "pending":

                pending++;

                break;

            case "completed":

                completed++;

                break;

            case "cancelled":

                cancelled++;

                break;

        }

    });

    const averageOrder=

        revenue/ordersData.length;

    // -----------------------------------
    // Update Cards
    // -----------------------------------

    totalRevenue.textContent=

        currency(revenue);

    totalOrders.textContent=

        formatNumber(

            ordersData.length

        );

    totalCustomers.textContent=

        formatNumber(

            customersData.length

        );

    totalSuppliers.textContent=

        formatNumber(

            suppliersData.length

        );

    updateExtraCards({

        averageOrder,

        pending,

        completed,

        cancelled

    });

}// ======================================================
// EXTRA KPI CARDS
// ======================================================

function updateExtraCards(stats){

    const averageCard=

        document.getElementById(

            "averageOrderValue"

        );

    const pendingCard=

        document.getElementById(

            "pendingOrders"

        );

    const completedCard=

        document.getElementById(

            "completedOrders"

        );

    const cancelledCard=

        document.getElementById(

            "cancelledOrders"

        );

    if(averageCard){

        averageCard.textContent=

            currency(

                stats.averageOrder

            );

    }

    if(pendingCard){

        pendingCard.textContent=

            formatNumber(

                stats.pending

            );

    }

    if(completedCard){

        completedCard.textContent=

            formatNumber(

                stats.completed

            );

    }

    if(cancelledCard){

        cancelledCard.textContent=

            formatNumber(

                stats.cancelled

            );

    }

}// ======================================================
// PART 4
// CHARTS
// ======================================================

// =====================================
// MONTHLY REVENUE
// =====================================

async function loadRevenueChart(){

    const revenue={

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

    ordersData.forEach(order=>{

        if(!order.createdAt) return;

        const month=

            order.createdAt

            .toDate()

            .toLocaleString(

                "default",

                {

                    month:"short"

                }

            );

        revenue[month]+=

            Number(order.totalPrice||0);

    });

    if(revenueChart){

        revenueChart.destroy();

    }

    revenueChart=

        new Chart(

            revenueCanvas,

            {

                type:"bar",

                data:{

                    labels:Object.keys(revenue),

                    datasets:[

                        {

                            label:"Revenue (KES)",

                            data:Object.values(revenue),

                            borderWidth:2,

                            borderRadius:8

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }

        );

}// =====================================
// MONTHLY ORDERS
// =====================================

async function loadOrdersChart(){

    const monthly={

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

    ordersData.forEach(order=>{

        if(!order.createdAt) return;

        const month=

            order.createdAt

            .toDate()

            .toLocaleString(

                "default",

                {

                    month:"short"

                }

            );

        monthly[month]++;

    });

    if(ordersChart){

        ordersChart.destroy();

    }

    ordersChart=

        new Chart(

            ordersCanvas,

            {

                type:"line",

                data:{

                    labels:Object.keys(monthly),

                    datasets:[

                        {

                            label:"Orders",

                            data:Object.values(monthly),

                            tension:.4,

                            fill:false

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }

        );

}// =====================================
// GAS SIZE DISTRIBUTION
// =====================================

async function loadGasChart(){

    const gas={};

    ordersData.forEach(order=>{

        const size=

            order.gasType ||

            "Unknown";

        gas[size]=

            (gas[size]||0)+1;

    });

    if(gasChart){

        gasChart.destroy();

    }

    gasChart=

        new Chart(

            gasCanvas,

            {

                type:"pie",

                data:{

                    labels:Object.keys(gas),

                    datasets:[

                        {

                            data:Object.values(gas)

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false

                }

            }

        );

}// =====================================
// TOP SUPPLIERS
// =====================================

async function loadSupplierChart(){

    const suppliers={};

    ordersData.forEach(order=>{

        const supplier=

            order.supplierName ||

            "Unknown";

        suppliers[supplier]=

            (suppliers[supplier]||0)+1;

    });

    const sorted=

        Object.entries(suppliers)

        .sort(

            (a,b)=>b[1]-a[1]

        )

        .slice(0,10);

    if(supplierChart){

        supplierChart.destroy();

    }

    supplierChart=

        new Chart(

            supplierCanvas,

            {

                type:"bar",

                data:{

                    labels:

                        sorted.map(

                            x=>x[0]

                        ),

                    datasets:[

                        {

                            label:"Orders",

                            data:

                                sorted.map(

                                    x=>x[1]

                                )

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    indexAxis:"y"

                }

            }

        );

}
