// ======================================================
// Kenya Gas Marketplace
// Analytics Dashboard
// KPI Calculations
// ======================================================

import {

    orders,

    customers,

    suppliers

} from "./analytics-firestore.js";

import {

    formatCurrency,

    formatNumber

} from "./analytics-helpers.js";

// ======================================================
// KPI ELEMENTS
// ======================================================

const totalRevenue =
    document.getElementById("totalRevenue");

const totalOrders =
    document.getElementById("totalOrders");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalSuppliers =
    document.getElementById("totalSuppliers");

const averageOrderValue =
    document.getElementById("averageOrderValue");

const pendingOrders =
    document.getElementById("pendingOrders");

const completedOrders =
    document.getElementById("completedOrders");

const cancelledOrders =
    document.getElementById("cancelledOrders");// ======================================================
// UPDATE DASHBOARD
// ======================================================

export function updateDashboard(){

    const stats = calculateStatistics();

    updateCards(stats);

}// ======================================================
// CALCULATE STATISTICS
// ======================================================

function calculateStatistics(){

    let revenue = 0;

    let pending = 0;

    let completed = 0;

    let cancelled = 0;

    orders.forEach(order=>{

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

    return{

        revenue,

        averageOrderValue:

            orders.length

            ? revenue/orders.length

            : 0,

        totalOrders:

            orders.length,

        totalCustomers:

            customers.length,

        totalSuppliers:

            suppliers.length,

        pending,

        completed,

        cancelled

    };

}// ======================================================
// UPDATE KPI CARDS
// ======================================================

function updateCards(stats){

    if(totalRevenue){

        totalRevenue.textContent =

            formatCurrency(

                stats.revenue

            );

    }

    if(totalOrders){

        totalOrders.textContent =

            formatNumber(

                stats.totalOrders

            );

    }

    if(totalCustomers){

        totalCustomers.textContent =

            formatNumber(

                stats.totalCustomers

            );

    }

    if(totalSuppliers){

        totalSuppliers.textContent =

            formatNumber(

                stats.totalSuppliers

            );

    }

    if(averageOrderValue){

        averageOrderValue.textContent =

            formatCurrency(

                stats.averageOrderValue

            );

    }

    if(pendingOrders){

        pendingOrders.textContent =

            formatNumber(

                stats.pending

            );

    }

    if(completedOrders){

        completedOrders.textContent =

            formatNumber(

                stats.completed

            );

    }

    if(cancelledOrders){

        cancelledOrders.textContent =

            formatNumber(

                stats.cancelled

            );

    }

}// ======================================================
// BEST SELLING GAS SIZE
// ======================================================

export function getBestSellingGas(){

    const gasTypes = {};

    orders.forEach(order=>{

        const gas =

            order.gasType ||

            "Unknown";

        gasTypes[gas] =

            (gasTypes[gas] || 0) + 1;

    });

    let bestGas = "-";

    let total = 0;

    Object.entries(gasTypes)

        .forEach(([gas,count])=>{

            if(count > total){

                bestGas = gas;

                total = count;

            }

        });

    return{

        gasType:bestGas,

        total

    };

}// ======================================================
// TOP SUPPLIER
// ======================================================

export function getTopSupplier(){

    const suppliersMap = {};

    orders.forEach(order=>{

        const supplier =

            order.supplierName ||

            "Unknown";

        suppliersMap[supplier] =

            (suppliersMap[supplier] || 0) + 1;

    });

    let topSupplier = "-";

    let totalOrders = 0;

    Object.entries(suppliersMap)

        .forEach(([supplier,count])=>{

            if(count > totalOrders){

                topSupplier = supplier;

                totalOrders = count;

            }

        });

    return{

        supplier:topSupplier,

        totalOrders

    };

}

// ======================================================
// DASHBOARD SUMMARY
// ======================================================

export function getDashboardSummary(){

    return calculateStatistics();

}
