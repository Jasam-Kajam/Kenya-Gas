// ======================================================
// Kenya Gas Marketplace
// Helpers
// ======================================================

// ===========================================
// Currency Formatter
// ===========================================

export function formatCurrency(amount){

    return "KES " +

        Number(amount || 0)

        .toLocaleString(

            "en-KE",

            {

                minimumFractionDigits:0,

                maximumFractionDigits:0

            }

        );

}

// ===========================================
// Number Formatter
// ===========================================

export function formatNumber(number){

    return Number(number || 0)

        .toLocaleString("en-KE");

}

// ===========================================
// Date Formatter
// ===========================================

export function formatDate(timestamp){

    if(!timestamp) return "-";

    return timestamp

        .toDate()

        .toLocaleDateString(

            "en-KE",

            {

                year:"numeric",

                month:"short",

                day:"numeric"

            }

        );

}

// ===========================================
// Loading Cursor
// ===========================================

export function showLoading(show){

    document.body.style.cursor =

        show

        ? "progress"

        : "default";

}

// ===========================================
// Destroy Chart
// ===========================================

export function destroyChart(chart){

    if(chart){

        chart.destroy();

    }

}

// ===========================================
// Empty Check
// ===========================================

export function isEmpty(array){

    return !array || array.length===0;

}

// ===========================================
// Status Badge
// ===========================================

export function statusClass(status){

    switch(status){

        case "completed":

            return "success";

        case "pending":

            return "warning";

        case "cancelled":

            return "danger";

        case "processing":

            return "primary";

        default:

            return "secondary";

    }

}

// ===========================================
// Toast
// ===========================================

export function toast(message){

    console.log(message);

}
