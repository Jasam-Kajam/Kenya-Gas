// ======================================================
// Kenya Gas Marketplace
// Firestore Data Layer
// ======================================================

import { db } from "./firebase.js";

import {

    collection,

    query,

    where,

    getDocs,

    onSnapshot,

    Timestamp

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================================================
// CACHE
// ======================================================

export let orders = [];

export let customers = [];

export let suppliers = [];

// ======================================================
// FILTER
// ======================================================

let selectedFilter = "all";

// ======================================================
// CHANGE FILTER
// ======================================================

export function setDateFilter(filter){

    selectedFilter = filter;

}

// ======================================================
// LOAD ALL DATA
// ======================================================

export async function loadAnalyticsData(){

    orders = [];

    customers = [];

    suppliers = [];

    try{

        // Orders

        const ordersSnapshot =

            await getDocs(

                buildOrdersQuery()

            );

        ordersSnapshot.forEach(doc=>{

            orders.push({

                id:doc.id,

                ...doc.data()

            });

        });

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

        customersSnapshot.forEach(doc=>{

            customers.push({

                id:doc.id,

                ...doc.data()

            });

        });

        // Suppliers

        const suppliersSnapshot =

            await getDocs(

                collection(

                    db,

                    "suppliers"

                )

            );

        suppliersSnapshot.forEach(doc=>{

            suppliers.push({

                id:doc.id,

                ...doc.data()

            });

        });

    }

    catch(error){

        console.error(

            "Firestore Error:",

            error

        );

    }

}
// ======================================================
// BUILD ORDERS QUERY
// ======================================================

function buildOrdersQuery(){

    let startDate = null;

    const today = new Date();

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

                today.getDate()-7

            );

            break;

        case "30days":

            startDate = new Date();

            startDate.setDate(

                today.getDate()-30

            );

            break;

        case "year":

            startDate =

                new Date(

                    today.getFullYear(),

                    0,

                    1

                );

            break;

    }

    if(startDate){

        return query(

            collection(

                db,

                "orders"

            ),

            where(

                "createdAt",

                ">=",

                Timestamp.fromDate(

                    startDate

                )

            )

        );

    }

    return query(

        collection(

            db,

            "orders"

        )

    );

}
// ======================================================
// REAL-TIME ORDERS
// ======================================================

let unsubscribeOrders = null;

export function startRealtimeUpdates(callback){

    if(unsubscribeOrders){

        unsubscribeOrders();

    }

    unsubscribeOrders =

        onSnapshot(

            buildOrdersQuery(),

            async ()=>{

                await loadAnalyticsData();

                if(typeof callback==="function"){

                    callback();

                }

            }

        );

}

// ======================================================
// STOP LISTENER
// ======================================================

export function stopRealtimeUpdates(){

    if(unsubscribeOrders){

        unsubscribeOrders();

        unsubscribeOrders = null;

    }

}
