// ======================================================
// Kenya Gas Marketplace
// Analytics Dashboard
// Part 1
// ======================================================

import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    onSnapshot,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// CHART.JS
// ======================================================

import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/+esm";

// ======================================================
// DOM
// ======================================================

const totalRevenue =
    document.getElementById("totalRevenue");

const totalOrders =
    document.getElementById("totalOrders");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalSuppliers =
    document.getElementById("totalSuppliers");

// ======================================================
// CHART REFERENCES
// ======================================================

const revenueCanvas =
    document.getElementById("revenueChart");

const ordersCanvas =
    document.getElementById("ordersChart");

const gasCanvas =
    document.getElementById("gasChart");

const supplierCanvas =
    document.getElementById("supplierChart");

let revenueChart;
let ordersChart;
let gasChart;
let supplierChart;

// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeAnalytics

);

async function initializeAnalytics(){

    await loadDashboardCards();

    await loadRevenueChart();

    await loadAllCharts();

startRealtimeAnalytics();

}// ======================================================
// DASHBOARD CARDS
// ======================================================

async function loadDashboardCards(){

    try{

        // Orders

        const ordersSnapshot =
            await getDocs(
                collection(db,"orders")
            );

        let revenue = 0;

        ordersSnapshot.forEach(doc=>{

            const order = doc.data();

            revenue +=
                Number(order.totalPrice || 0);

        });

        totalRevenue.textContent =
            "KES " +
            revenue.toLocaleString();

        totalOrders.textContent =
            ordersSnapshot.size;

        // Customers

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

        totalCustomers.textContent =
            customersSnapshot.size;

        // Suppliers

        const suppliersSnapshot =
            await getDocs(
                collection(db,"suppliers")
            );

        totalSuppliers.textContent =
            suppliersSnapshot.size;

    }

    catch(error){

        console.error(error);

    }

}// ======================================================
// MONTHLY REVENUE CHART
// ======================================================

async function loadRevenueChart(){

    try{

        const snapshot =
            await getDocs(
                collection(db,"orders")
            );

        const monthlyRevenue = {

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

        snapshot.forEach(doc=>{

            const order =
                doc.data();

            if(!order.createdAt) return;

            const date =
                order.createdAt.toDate();

            const month =
                date.toLocaleString(

                    "default",

                    {

                        month:"short"

                    }

                );

            monthlyRevenue[month] +=
                Number(order.totalPrice || 0);

        });

        revenueChart =
            new Chart(

                revenueCanvas,

                {

                    type:"bar",

                    data:{

                        labels:
                            Object.keys(monthlyRevenue),

                        datasets:[

                            {

                                label:"Revenue",

                                data:
                                    Object.values(monthlyRevenue),

                                borderWidth:1

                            }

                        ]

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

    catch(error){

        console.error(error);

    }

}// ======================================================
// PART 2
// ORDERS • GAS SIZES • TOP SUPPLIERS
// ======================================================

// ======================================
// LOAD ALL CHARTS
// ======================================

async function loadAllCharts(){

    await loadOrdersChart();

    await loadGasChart();

    await loadSupplierChart();

}

// ======================================
// ORDERS PER MONTH
// ======================================

async function loadOrdersChart(){

    try{

        const snapshot =
            await getDocs(
                collection(db,"orders")
            );

        const monthlyOrders={

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

        snapshot.forEach(doc=>{

            const order=doc.data();

            if(!order.createdAt) return;

            const month=
                order.createdAt
                .toDate()
                .toLocaleString(
                    "default",
                    {month:"short"}
                );

            monthlyOrders[month]++;

        });

        if(ordersChart){

            ordersChart.destroy();

        }

        ordersChart=new Chart(

            ordersCanvas,

            {

                type:"line",

                data:{

                    labels:Object.keys(monthlyOrders),

                    datasets:[

                        {

                            label:"Orders",

                            data:Object.values(monthlyOrders),

                            tension:0.4,

                            fill:false

                        }

                    ]

                },

                options:{

                    responsive:true

                }

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// GAS SIZE DISTRIBUTION
// ======================================

async function loadGasChart(){

    try{

        const snapshot=
            await getDocs(
                collection(db,"orders")
            );

        const gasTypes={};

        snapshot.forEach(doc=>{

            const order=
                doc.data();

            const gas=
                order.gasType || "Unknown";

            gasTypes[gas]=
                (gasTypes[gas] || 0)+1;

        });

        if(gasChart){

            gasChart.destroy();

        }

        gasChart=new Chart(

            gasCanvas,

            {

                type:"pie",

                data:{

                    labels:Object.keys(gasTypes),

                    datasets:[

                        {

                            data:Object.values(gasTypes)

                        }

                    ]

                },

                options:{

                    responsive:true

                }

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// TOP SUPPLIERS
// ======================================

async function loadSupplierChart(){

    try{

        const snapshot=
            await getDocs(
                collection(db,"orders")
            );

        const suppliers={};

        snapshot.forEach(doc=>{

            const order=
                doc.data();

            const supplier=
                order.supplierName ||
                "Unknown";

            suppliers[supplier]=
                (suppliers[supplier] || 0)+1;

        });

        const sorted=
            Object.entries(suppliers)
            .sort((a,b)=>b[1]-a[1])
            .slice(0,10);

        if(supplierChart){

            supplierChart.destroy();

        }

        supplierChart=new Chart(

            supplierCanvas,

            {

                type:"bar",

                data:{

                    labels:
                        sorted.map(x=>x[0]),

                    datasets:[

                        {

                            label:"Completed Orders",

                            data:
                                sorted.map(x=>x[1])

                        }

                    ]

                },

                options:{

                    responsive:true,

                    indexAxis:"y"

                }

            }

        );

    }

    catch(error){

        console.error(error);

    }

}// ======================================================
// PART 3
// REAL-TIME ANALYTICS & DATE FILTERS
// ======================================================

// ======================================
// FILTER ELEMENTS
// ======================================

const dateFilter =
    document.getElementById("dateFilter");

const refreshAnalytics =
    document.getElementById("refreshAnalytics");

// ======================================
// CURRENT FILTER
// ======================================

let selectedFilter = "all";

// ======================================
// EVENTS
// ======================================

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

// ======================================
// REFRESH EVERYTHING
// ======================================

async function refreshDashboard(){

    await loadDashboardCards();

    await loadRevenueChart();

    await loadAllCharts();

}

// ======================================
// BUILD QUERY
// ======================================

function buildOrdersQuery(){

    let q =
        collection(db,"orders");

    if(selectedFilter==="all"){

        return query(q);

    }

    const now =
        new Date();

    let start =
        new Date();

    switch(selectedFilter){

        case "today":

            start.setHours(
                0,0,0,0
            );

            break;

        case "7days":

            start.setDate(
                now.getDate()-7
            );

            break;

        case "30days":

            start.setDate(
                now.getDate()-30
            );

            break;

        case "year":

            start =
                new Date(
                    now.getFullYear(),
                    0,
                    1
                );

            break;

        default:

            return query(q);

    }

    return query(

        q,

        where(

            "createdAt",

            ">=",

            Timestamp.fromDate(start)

        )

    );

}

// ======================================
// REAL-TIME LISTENER
// ======================================

function startRealtimeAnalytics(){

    const q =
        buildOrdersQuery();

    onSnapshot(

        q,

        async ()=>{

            console.log(
                "Analytics updated."
            );

            await refreshDashboard();

        }

    );

}
