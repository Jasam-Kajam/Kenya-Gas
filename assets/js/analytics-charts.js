// ======================================================
// Kenya Gas Marketplace
// Analytics Charts
// Part 1 - Foundation
// ======================================================

import {

    orders

} from "./analytics-firestore.js";

import {

    destroyChart

} from "./analytics-helpers.js";

// ======================================================
// CHART INSTANCES
// ======================================================

let revenueChart = null;

let ordersChart = null;

let gasChart = null;

let supplierChart = null;

// ======================================================
// CANVAS ELEMENTS
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
// KENYA GAS COLOR PALETTE
// ======================================================

const COLORS = {

    primary:"#198754",

    secondary:"#20c997",

    success:"#198754",

    warning:"#ffc107",

    danger:"#dc3545",

    info:"#0dcaf0",

    blue:"#0d6efd",

    purple:"#6f42c1",

    orange:"#fd7e14",

    gray:"#6c757d",

    light:"#f8f9fa"

};

// ======================================================
// GLOBAL CHART CONFIGURATION
// ======================================================

Chart.defaults.responsive = true;

Chart.defaults.maintainAspectRatio = false;

Chart.defaults.animation.duration = 900;

Chart.defaults.font.family =

    "'Poppins', sans-serif";

Chart.defaults.font.size = 13;

Chart.defaults.color = "#495057";

Chart.defaults.plugins.legend.position =

    "bottom";

Chart.defaults.plugins.legend.labels.usePointStyle =

    true;

Chart.defaults.plugins.legend.labels.padding =

    18;

// ======================================================
// MONTH TEMPLATE
// ======================================================

function createMonthTemplate(){

    return{

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

}

// ======================================================
// GET ORDER MONTH
// ======================================================

function getOrderMonth(order){

    if(!order.createdAt) return null;

    return order.createdAt

        .toDate()

        .toLocaleString(

            "default",

            {

                month:"short"

            }

        );

}

// ======================================================
// SAFE NUMBER
// ======================================================

function safeNumber(value){

    return Number(value || 0);

}

// ======================================================
// CHECK EMPTY DATA
// ======================================================

function hasOrders(){

    return Array.isArray(orders)

        &&

        orders.length>0;

}

// ======================================================
// DESTROY ALL CHARTS
// ======================================================

function destroyAllCharts(){

    destroyChart(revenueChart);

    destroyChart(ordersChart);

    destroyChart(gasChart);

    destroyChart(supplierChart);

}

// ======================================================
// MAIN RENDER FUNCTION
// ======================================================

export function renderCharts(){

    destroyAllCharts();

    loadRevenueChart();

    loadOrdersChart();

    loadGasChart();

    loadSupplierChart();

}

// ======================================================
// MONTHLY REVENUE CHART
// ======================================================

function loadRevenueChart(){

    if(!revenueCanvas) return;

    const monthlyRevenue =

        createMonthTemplate();

    if(hasOrders()){

        orders.forEach(order=>{

            const month =

                getOrderMonth(order);

            if(!month) return;

            monthlyRevenue[month] +=

                safeNumber(

                    order.totalPrice

                );

        });

    }

    revenueChart =

        new Chart(

            revenueCanvas,

            {

                type:"bar",

                data:{

                    labels:

                        Object.keys(

                            monthlyRevenue

                        ),

                    datasets:[

                        {

                            label:

                                "Revenue (KES)",

                            data:

                                Object.values(

                                    monthlyRevenue

                                ),

                            backgroundColor:

                                COLORS.primary,

                            hoverBackgroundColor:

                                COLORS.secondary,

                            borderRadius:10,

                            borderSkipped:false,

                            maxBarThickness:40

                        }

                    ]

                },

                options:{

                    interaction:{

                        mode:"index",

                        intersect:false

                    },

                    plugins:{

                        title:{

                            display:true,

                            text:

                                "Monthly Revenue"

                        },

                        tooltip:{

                            callbacks:{

                                label(context){

                                    return(

                                        "KES " +

                                        safeNumber(

                                            context.raw

                                        )

                                        .toLocaleString(

                                            "en-KE"

                                        )

                                    );

                                }

                            }

                        }

                    },

                    scales:{

                        x:{

                            grid:{

                                display:false

                            }

                        },

                        y:{

                            beginAtZero:true,

                            ticks:{

                                callback(value){

                                    return(

                                        "KES " +

                                        Number(value)

                                        .toLocaleString(

                                            "en-KE"

                                        )

                                    );

                                }

                            },

                            title:{

                                display:true,

                                text:

                                    "Revenue (KES)"

                            }

                        }

                    }

                }

            }

        );

}
// ======================================================
// MONTHLY ORDERS CHART
// ======================================================

function loadOrdersChart(){

    if(!ordersCanvas) return;

    const monthlyOrders =

        createMonthTemplate();

    if(hasOrders()){

        orders.forEach(order=>{

            const month =

                getOrderMonth(order);

            if(!month) return;

            monthlyOrders[month]++;

        });

    }

    ordersChart =

        new Chart(

            ordersCanvas,

            {

                type:"line",

                data:{

                    labels:

                        Object.keys(

                            monthlyOrders

                        ),

                    datasets:[

                        {

                            label:

                                "Orders",

                            data:

                                Object.values(

                                    monthlyOrders

                                ),

                            borderColor:

                                COLORS.blue,

                            backgroundColor:

                                "rgba(13,110,253,0.15)",

                            fill:true,

                            tension:0.35,

                            borderWidth:3,

                            pointRadius:5,

                            pointHoverRadius:8,

                            pointBackgroundColor:

                                COLORS.blue,

                            pointBorderColor:

                                "#ffffff",

                            pointBorderWidth:2

                        }

                    ]

                },

                options:{

                    interaction:{

                        mode:"index",

                        intersect:false

                    },

                    plugins:{

                        title:{

                            display:true,

                            text:

                                "Monthly Orders"

                        },

                        tooltip:{

                            callbacks:{

                                label(context){

                                    return(

                                        safeNumber(

                                            context.raw

                                        ) +

                                        " Orders"

                                    );

                                }

                            }

                        }

                    },

                    scales:{

                        x:{

                            grid:{

                                display:false

                            },

                            title:{

                                display:true,

                                text:"Month"

                            }

                        },

                        y:{

                            beginAtZero:true,

                            ticks:{

                                precision:0,

                                stepSize:1

                            },

                            title:{

                                display:true,

                                text:

                                    "Number of Orders"

                            }

                        }

                    }

                }

            }

        );

}
