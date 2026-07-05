// ======================================================
// Kenya Gas Marketplace
// Analytics Charts
// ======================================================

import { orders } from "./analytics-firestore.js";

import { destroyChart } from "./analytics-helpers.js";

// ======================================================
// CHART INSTANCES
// ======================================================

let revenueChart = null;

let ordersChart = null;

let gasChart = null;

let supplierChart = null;

// ======================================================
// CHART CANVASES
// ======================================================

const revenueCanvas =
    document.getElementById("revenueChart");

const ordersCanvas =
    document.getElementById("ordersChart");

const gasCanvas =
    document.getElementById("gasChart");

const supplierCanvas =
    document.getElementById("supplierChart");

// ======================================================
// CHART COLORS
// ======================================================

const COLORS = {

    primary: "#198754",

    secondary: "#20c997",

    warning: "#ffc107",

    danger: "#dc3545",

    info: "#0dcaf0",

    purple: "#6f42c1",

    orange: "#fd7e14",

    blue: "#0d6efd"

};

// ======================================================
// GLOBAL CHART SETTINGS
// ======================================================

Chart.defaults.font.family = "Poppins";

Chart.defaults.font.size = 13;

Chart.defaults.color = "#555";

Chart.defaults.responsive = true;

Chart.defaults.maintainAspectRatio = false;

Chart.defaults.plugins.legend.position = "bottom";

Chart.defaults.plugins.legend.labels.usePointStyle = true;

Chart.defaults.plugins.legend.labels.padding = 20;

Chart.defaults.animation.duration = 1000;

// ======================================================
// MAIN RENDER FUNCTION
// ======================================================

export function renderCharts(){

    loadRevenueChart();

    loadOrdersChart();

    loadGasChart();

    loadSupplierChart();

}
