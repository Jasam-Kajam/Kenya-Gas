// ======================================================
// Kenya Gas Marketplace
// notifications.js
// Part 1
// ======================================================

// ======================================================
// FIREBASE IMPORTS
// ======================================================

import {

    auth,

    db

} from "./firebase.js";

import {

    onAuthStateChanged,

    signOut

} from

"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {

    doc,

    getDoc,

    collection,

    query,

    where,

    orderBy,

    getDocs,

    onSnapshot,

    updateDoc,

    deleteDoc,

    writeBatch

} from

"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let currentUser = null;

let currentUserData = {};

let allNotifications = [];

let filteredNotifications = [];

let currentNotification = null;

let currentPage = 1;

const notificationsPerPage = 10;

// ======================================================
// DOM ELEMENTS
// ======================================================

// Navbar

const navbarCustomerName =

    document.getElementById(

        "navbarCustomerName"

    );

const navbarProfileImage =

    document.getElementById(

        "navbarProfileImage"

    );

const notificationBadge =

    document.getElementById(

        "notificationBadge"

    );

const logoutBtn =

    document.getElementById(

        "logoutBtn"

    );

// Search & Filters

const notificationSearch =

    document.getElementById(

        "notificationSearch"

    );

const notificationTypeFilter =

    document.getElementById(

        "notificationTypeFilter"

    );

const notificationStatusFilter =

    document.getElementById(

        "notificationStatusFilter"

    );

// List

const notificationsList =

    document.getElementById(

        "notificationsList"

    );

const notificationsPagination =

    document.getElementById(

        "notificationsPagination"

    );

// Statistics

const totalNotificationsCount =

    document.getElementById(

        "totalNotificationsCount"

    );

const unreadNotificationsCount =

    document.getElementById(

        "unreadNotificationsCount"

    );

const readNotificationsCount =

    document.getElementById(

        "readNotificationsCount"

    );

const importantNotificationsCount =

    document.getElementById(

        "importantNotificationsCount"

    );

// Buttons

const markAllReadBtn =

    document.getElementById(

        "markAllReadBtn"

    );

const deleteAllNotificationsBtn =

    document.getElementById(

        "deleteAllNotificationsBtn"

    );

// Loading

const loadingOverlay =

    document.getElementById(

        "loadingOverlay"

    );

// ======================================================
// AUTHENTICATION
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

        await loadCurrentUser();

        listenForNotifications();

    }

);

// ======================================================
// LOAD USER PROFILE
// ======================================================

async function loadCurrentUser(){

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

        if(userSnap.exists()){

            currentUserData =

                userSnap.data();

        }

        const fullName =

            currentUserData.firstName &&

            currentUserData.lastName

            ?

            `${currentUserData.firstName} ${currentUserData.lastName}`

            :

            currentUser.displayName ||

            "Customer";

        navbarCustomerName.textContent =

            fullName;

        navbarProfileImage.src =

            currentUserData.photoURL ||

            currentUser.photoURL ||

            "assets/images/default-user.png";

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// READY
// ======================================================

console.log(

    "notifications.js loaded."

);

// ======================================================
// REAL-TIME NOTIFICATIONS LISTENER
// ======================================================

function listenForNotifications(){

    if(!currentUser) return;

    showLoading(true);

    const q =

        query(

            collection(

                db,

                "notifications"

            ),

            where(

                "userId",

                "==",

                currentUser.uid

            ),

            orderBy(

                "createdAt",

                "desc"

            )

        );

    onSnapshot(

        q,

        snapshot=>{

            allNotifications = [];

            snapshot.forEach(

                docSnap=>{

                    allNotifications.push({

                        id:docSnap.id,

                        ...docSnap.data()

                    });

                }

            );

            filteredNotifications =

                [...allNotifications];

            updateNotificationStatistics();

            renderNotifications();

            updateLastRefresh();

            showLoading(false);

        },

        error=>{

            console.error(error);

            showLoading(false);

            showToast(

                "Unable to load notifications.",

                "danger"

            );

        }

    );

}

// ======================================================
// UPDATE STATISTICS
// ======================================================

function updateNotificationStatistics(){

    const unread =

        allNotifications.filter(

            n=>!n.read

        ).length;

    const read =

        allNotifications.filter(

            n=>n.read

        ).length;

    const important =

        allNotifications.filter(

            n=>n.important===true

        ).length;

    totalNotificationsCount.textContent =

        allNotifications.length;

    unreadNotificationsCount.textContent =

        unread;

    readNotificationsCount.textContent =

        read;

    importantNotificationsCount.textContent =

        important;

    notificationBadge.textContent =

        unread;

    notificationBadge.style.display =

        unread>0 ?

        "inline-block" :

        "none";

}

// ======================================================
// RENDER NOTIFICATIONS
// ======================================================

function renderNotifications(){

    notificationsList.innerHTML = "";

    if(filteredNotifications.length===0){

        notificationsList.innerHTML =

        `

        <div class="text-center py-5 text-muted">

            <i class="bi bi-bell-slash display-4"></i>

            <h5 class="mt-3">

                No notifications found

            </h5>

        </div>

        `;

        updatePagination();

        return;

    }

    const start =

        (currentPage-1) *

        notificationsPerPage;

    const pageItems =

        filteredNotifications.slice(

            start,

            start +

            notificationsPerPage

        );

    pageItems.forEach(

        notification=>{

            const icon =

                getNotificationIcon(

                    notification.type

                );

            const badge =

                getNotificationBadge(

                    notification.type

                );

            const date =

                formatDate(

                    notification.createdAt

                );

            notificationsList.innerHTML +=

            `

            <div

            class="list-group-item list-group-item-action ${notification.read ? "" : "bg-light"}">

                <div class="d-flex justify-content-between">

                    <div class="me-3">

                        <div class="d-flex align-items-center">

                            <i class="${icon} fs-3 me-3 text-success"></i>

                            <div>

                                <h6 class="mb-1">

                                    ${notification.title}

                                </h6>

                                <p class="mb-1 text-muted">

                                    ${notification.message}

                                </p>

                                <small>

                                    ${date}

                                </small>

                            </div>

                        </div>

                    </div>

                    <div class="text-end">

                        <span class="badge bg-${badge} mb-2">

                            ${notification.type}

                        </span>

                        <br>

                        <button

                        class="btn btn-sm btn-outline-success view-notification"

                        data-id="${notification.id}">

                            View

                        </button>

                    </div>

                </div>

            </div>

            `;

        }

    );

    document.querySelectorAll(

        ".view-notification"

    ).forEach(

        button=>{

            button.addEventListener(

                "click",

                ()=>{

                    openNotification(

                        button.dataset.id

                    );

                }

            );

        }

    );

    updatePagination();

}

// ======================================================
// LAST REFRESH
// ======================================================

function updateLastRefresh(){

    const label =

        document.getElementById(

            "lastRefreshTime"

        );

    if(label){

        label.textContent =

            "Last updated: " +

            new Date()

            .toLocaleTimeString(

                "en-KE"

            );

    }

}

// ======================================================
// SEARCH & FILTER NOTIFICATIONS
// ======================================================

function filterNotifications(){

    const search =

        notificationSearch.value

        .trim()

        .toLowerCase();

    const type =

        notificationTypeFilter.value;

    const status =

        notificationStatusFilter.value;

    filteredNotifications =

        allNotifications.filter(

            notification=>{

                const matchesSearch =

                    notification.title

                    ?.toLowerCase()

                    .includes(search)

                    ||

                    notification.message

                    ?.toLowerCase()

                    .includes(search);

                const matchesType =

                    !type ||

                    notification.type===type;

                const matchesStatus =

                    !status ||

                    (

                        status==="read"

                        ?

                        notification.read===true

                        :

                        notification.read===false

                    );

                return(

                    matchesSearch &&

                    matchesType &&

                    matchesStatus

                );

            }

        );

    currentPage = 1;

    renderNotifications();

}

// ======================================================
// PAGINATION
// ======================================================

function updatePagination(){

    notificationsPagination.innerHTML = "";

    const totalPages =

        Math.max(

            1,

            Math.ceil(

                filteredNotifications.length /

                notificationsPerPage

            )

        );

    // Previous

    const previous =

        document.createElement(

            "li"

        );

    previous.className =

        `page-item ${currentPage===1?"disabled":""}`;

    previous.innerHTML =

        `<a class="page-link" href="#">Previous</a>`;

    previous.onclick =

        e=>{

            e.preventDefault();

            if(currentPage>1){

                currentPage--;

                renderNotifications();

            }

        };

    notificationsPagination.appendChild(

        previous

    );

    // Pages

    for(

        let i=1;

        i<=totalPages;

        i++

    ){

        const page =

            document.createElement(

                "li"

            );

        page.className =

            `page-item ${i===currentPage?"active":""}`;

        page.innerHTML =

            `<a class="page-link" href="#">${i}</a>`;

        page.onclick =

            e=>{

                e.preventDefault();

                currentPage=i;

                renderNotifications();

            };

        notificationsPagination.appendChild(

            page

        );

    }

    // Next

    const next =

        document.createElement(

            "li"

        );

    next.className =

        `page-item ${currentPage===totalPages?"disabled":""}`;

    next.innerHTML =

        `<a class="page-link" href="#">Next</a>`;

    next.onclick =

        e=>{

            e.preventDefault();

            if(currentPage<totalPages){

                currentPage++;

                renderNotifications();

            }

        };

    notificationsPagination.appendChild(

        next

    );

}

// ======================================================
// SEARCH EVENTS
// ======================================================

notificationSearch?.addEventListener(

    "input",

    filterNotifications

);

notificationTypeFilter?.addEventListener(

    "change",

    filterNotifications

);

notificationStatusFilter?.addEventListener(

    "change",

    filterNotifications

);

// ======================================================
// OPEN NOTIFICATION
// ======================================================

function openNotification(id){

    currentNotification =

        allNotifications.find(

            notification=>

                notification.id===id

        );

    if(!currentNotification)

        return;

    document.getElementById(

        "notificationTitle"

    ).textContent =

        currentNotification.title;

    document.getElementById(

        "notificationMessage"

    ).textContent =

        currentNotification.message;

    document.getElementById(

        "notificationTypeBadge"

    ).textContent =

        currentNotification.type;

    document.getElementById(

        "notificationStatusBadge"

    ).textContent =

        currentNotification.read ?

        "Read" :

        "Unread";

    document.getElementById(

        "notificationDate"

    ).textContent =

        formatDate(

            currentNotification.createdAt

        );

    document.getElementById(

        "notificationTime"

    ).textContent =

        currentNotification.createdAt?.toDate()

        ?.toLocaleTimeString(

            "en-KE"

        ) ||

        "-";

    document.getElementById(

        "notificationReference"

    ).textContent =

        currentNotification.reference ||

        "-";

    document.getElementById(

        "notificationRelatedItem"

    ).textContent =

        currentNotification.relatedItem ||

        "-";

    document.getElementById(

        "notificationExtraInfo"

    ).textContent =

        currentNotification.extraInfo ||

        "No additional information available.";

    const modal =

        new bootstrap.Modal(

            document.getElementById(

                "notificationModal"

            )

        );

    modal.show();

}

// ======================================================
// MARK NOTIFICATION AS READ
// ======================================================

async function markNotificationAsRead(){

    if(!currentNotification) return;

    if(currentNotification.read){

        showToast(

            "Notification already marked as read.",

            "info"

        );

        return;

    }

    showLoading(true);

    try{

        await updateDoc(

            doc(

                db,

                "notifications",

                currentNotification.id

            ),

            {

                read:true,

                readAt:new Date()

            }

        );

        currentNotification.read = true;

        showToast(

            "Notification marked as read."

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to update notification.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// DELETE NOTIFICATION
// ======================================================

async function deleteNotification(){

    if(!currentNotification) return;

    if(

        !confirm(

            "Delete this notification?"

        )

    ){

        return;

    }

    showLoading(true);

    try{

        await deleteDoc(

            doc(

                db,

                "notifications",

                currentNotification.id

            )

        );

        bootstrap.Modal

            .getInstance(

                document.getElementById(

                    "notificationModal"

                )

            )?.hide();

        showToast(

            "Notification deleted."

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to delete notification.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// MARK ALL AS READ
// ======================================================

async function markAllNotificationsRead(){

    if(

        allNotifications.length===0

    ){

        return;

    }

    showLoading(true);

    try{

        const batch =

            writeBatch(db);

        allNotifications.forEach(

            notification=>{

                if(

                    !notification.read

                ){

                    batch.update(

                        doc(

                            db,

                            "notifications",

                            notification.id

                        ),

                        {

                            read:true,

                            readAt:new Date()

                        }

                    );

                }

            }

        );

        await batch.commit();

        showToast(

            "All notifications marked as read."

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to update notifications.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// DELETE ALL NOTIFICATIONS
// ======================================================

async function deleteAllNotifications(){

    if(

        allNotifications.length===0

    ){

        return;

    }

    if(

        !confirm(

            "Delete all notifications?"

        )

    ){

        return;

    }

    showLoading(true);

    try{

        const batch =

            writeBatch(db);

        allNotifications.forEach(

            notification=>{

                batch.delete(

                    doc(

                        db,

                        "notifications",

                        notification.id

                    )

                );

            }

        );

        await batch.commit();

        showToast(

            "All notifications deleted."

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to delete notifications.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// BUTTON EVENTS
// ======================================================

document.getElementById(

    "markAsReadBtn"

)?.addEventListener(

    "click",

    markNotificationAsRead

);

markAllReadBtn?.addEventListener(

    "click",

    markAllNotificationsRead

);

document.getElementById(

    "markAllReadFab"

)?.addEventListener(

    "click",

    markAllNotificationsRead

);

deleteAllNotificationsBtn?.addEventListener(

    "click",

    deleteAllNotifications

);

document.getElementById(

    "deleteNotificationBtn"

)?.addEventListener(

    "click",

    deleteNotification

);

document.getElementById(

    "refreshNotificationsBtn"

)?.addEventListener(

    "click",

    ()=>{

        listenForNotifications();

        showToast(

            "Notifications refreshed."

        );

    }

);

// ======================================================
// LOAD NOTIFICATION PREFERENCES
// ======================================================

async function loadNotificationPreferences(){

    if(!currentUser) return;

    try{

        const userSnap =

            await getDoc(

                doc(

                    db,

                    "users",

                    currentUser.uid

                )

            );

        if(!userSnap.exists()) return;

        const preferences =

            userSnap.data()

            .notificationPreferences ||

            {};

        document.getElementById(

            "ordersNotifications"

        ).checked =

            preferences.orders ?? true;

        document.getElementById(

            "paymentNotifications"

        ).checked =

            preferences.payments ?? true;

        document.getElementById(

            "supportNotifications"

        ).checked =

            preferences.support ?? true;

        document.getElementById(

            "promotionNotifications"

        ).checked =

            preferences.promotions ?? false;

        document.getElementById(

            "emailNotifications"

        ).checked =

            preferences.email ?? true;

        document.getElementById(

            "pushNotifications"

        ).checked =

            preferences.push ?? true;

        document.getElementById(

            "smsNotifications"

        ).checked =

            preferences.sms ?? false;

        document.getElementById(

            "soundNotifications"

        ).checked =

            preferences.sound ?? true;

    }

    catch(error){

        console.error(error);

    }

}

// ======================================================
// SAVE NOTIFICATION PREFERENCES
// ======================================================

async function saveNotificationPreferences(){

    if(!currentUser) return;

    showLoading(true);

    try{

        await updateDoc(

            doc(

                db,

                "users",

                currentUser.uid

            ),

            {

                notificationPreferences:{

                    orders:

                        document.getElementById(

                            "ordersNotifications"

                        ).checked,

                    payments:

                        document.getElementById(

                            "paymentNotifications"

                        ).checked,

                    support:

                        document.getElementById(

                            "supportNotifications"

                        ).checked,

                    promotions:

                        document.getElementById(

                            "promotionNotifications"

                        ).checked,

                    email:

                        document.getElementById(

                            "emailNotifications"

                        ).checked,

                    push:

                        document.getElementById(

                            "pushNotifications"

                        ).checked,

                    sms:

                        document.getElementById(

                            "smsNotifications"

                        ).checked,

                    sound:

                        document.getElementById(

                            "soundNotifications"

                        ).checked

                }

            }

        );

        showToast(

            "Preferences saved successfully."

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to save preferences.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// RESET PREFERENCES
// ======================================================

function resetNotificationPreferences(){

    document.getElementById(

        "ordersNotifications"

    ).checked = true;

    document.getElementById(

        "paymentNotifications"

    ).checked = true;

    document.getElementById(

        "supportNotifications"

    ).checked = true;

    document.getElementById(

        "promotionNotifications"

    ).checked = false;

    document.getElementById(

        "emailNotifications"

    ).checked = true;

    document.getElementById(

        "pushNotifications"

    ).checked = true;

    document.getElementById(

        "smsNotifications"

    ).checked = false;

    document.getElementById(

        "soundNotifications"

    ).checked = true;

}

// ======================================================
// ANALYTICS
// ======================================================

function updateNotificationAnalytics(){

    const today = new Date();

    let todayCount = 0;

    let weekCount = 0;

    let monthCount = 0;

    let orderCount = 0;

    let paymentCount = 0;

    let supportCount = 0;

    let promotionCount = 0;

    let systemCount = 0;

    allNotifications.forEach(

        notification=>{

            const created =

                notification.createdAt?.toDate();

            if(!created) return;

            if(

                created.toDateString()===

                today.toDateString()

            ){

                todayCount++;

            }

            const days =

                (today-created)/86400000;

            if(days<=7){

                weekCount++;

            }

            if(

                created.getMonth()===

                today.getMonth()

            ){

                monthCount++;

            }

            switch(notification.type){

                case "order":

                    orderCount++;

                    break;

                case "payment":

                    paymentCount++;

                    break;

                case "support":

                    supportCount++;

                    break;

                case "promotion":

                    promotionCount++;

                    break;

                default:

                    systemCount++;

            }

        }

    );

    document.getElementById("todayNotifications").textContent = todayCount;

    document.getElementById("weekNotifications").textContent = weekCount;

    document.getElementById("monthNotifications").textContent = monthCount;

    document.getElementById("ordersTypeCount").textContent = orderCount;

    document.getElementById("paymentsTypeCount").textContent = paymentCount;

    document.getElementById("supportTypeCount").textContent = supportCount;

    document.getElementById("promotionsTypeCount").textContent = promotionCount;

    document.getElementById("systemTypeCount").textContent = systemCount;

}

// ======================================================
// BUTTON EVENTS
// ======================================================

document.getElementById(

    "savePreferencesBtn"

)?.addEventListener(

    "click",

    saveNotificationPreferences

);

document.getElementById(

    "resetPreferencesBtn"

)?.addEventListener(

    "click",

    resetNotificationPreferences

);

// ======================================================
// ACTIVITY TIMELINE
// ======================================================

function renderActivityTimeline(){

    const timeline =

        document.getElementById(

            "notificationTimeline"

        );

    const emptyTimeline =

        document.getElementById(

            "emptyTimeline"

        );

    const timelineCount =

        document.getElementById(

            "timelineCount"

        );

    if(!timeline) return;

    timeline.innerHTML = "";

    if(allNotifications.length===0){

        if(emptyTimeline){

            timeline.appendChild(

                emptyTimeline

            );

            emptyTimeline.classList.remove(

                "d-none"

            );

        }

        timelineCount.textContent =

            "0 Activities";

        return;

    }

    timelineCount.textContent =

        `${allNotifications.length} Activities`;

    allNotifications.slice(0,10).forEach(

        notification=>{

            const item =

                document.createElement(

                    "div"

                );

            item.className =

                "border-start border-3 border-success ps-3 mb-4";

            item.innerHTML =

            `

            <div class="d-flex justify-content-between">

                <div>

                    <h6 class="mb-1">

                        ${notification.title}

                    </h6>

                    <p class="text-muted mb-1">

                        ${notification.message}

                    </p>

                    <small class="text-secondary">

                        ${formatDate(notification.createdAt)}

                    </small>

                </div>

                <span class="badge bg-${getNotificationBadge(notification.type)}">

                    ${notification.type}

                </span>

            </div>

            `;

            timeline.appendChild(

                item

            );

        }

    );

}

// ======================================================
// PRINT NOTIFICATIONS
// ======================================================

document.getElementById(

    "printNotificationsBtn"

)?.addEventListener(

    "click",

    ()=>{

        window.print();

    }

);

// ======================================================
// SHARE NOTIFICATIONS
// ======================================================

document.getElementById(

    "shareNotificationsBtn"

)?.addEventListener(

    "click",

    async()=>{

        if(

            navigator.share

        ){

            try{

                await navigator.share({

                    title:

                        "Kenya Gas Notifications",

                    text:

                        `I have ${allNotifications.length} notifications on Kenya Gas Marketplace.`,

                    url:

                        window.location.href

                });

            }

            catch(error){

                console.error(error);

            }

        }

        else{

            showToast(

                "Sharing is not supported on this browser.",

                "warning"

            );

        }

    }

);

// ======================================================
// BACK TO TOP
// ======================================================

const backToTopBtn =

    document.getElementById(

        "backToTopBtn"

    );

window.addEventListener(

    "scroll",

    ()=>{

        if(

            window.scrollY>400

        ){

            backToTopBtn.style.display =

                "block";

        }

        else{

            backToTopBtn.style.display =

                "none";

        }

    }

);

backToTopBtn?.addEventListener(

    "click",

    ()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }

);

// ======================================================
// BROWSER NOTIFICATIONS
// ======================================================

async function requestNotificationPermission(){

    if(

        !("Notification" in window)

    ){

        return;

    }

    if(

        Notification.permission==="default"

    ){

        await Notification.requestPermission();

    }

}

function showBrowserNotification(

    title,

    message

){

    if(

        Notification.permission==="granted"

    ){

        new Notification(

            title,

            {

                body:message,

                icon:"assets/images/favicon.png"

            }

        );

    }

}

// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        requestNotificationPermission();

        loadNotificationPreferences();

        renderActivityTimeline();

        updateNotificationAnalytics();

        document.getElementById(

            "currentYear"

        ).textContent =

            new Date().getFullYear();

        showLoading(false);

    }

);

// ======================================================
// UPDATE UI AFTER DATA CHANGES
// ======================================================

const originalRender =

    renderNotifications;

renderNotifications = function(){

    originalRender();

    updateNotificationAnalytics();

    renderActivityTimeline();

};

// ======================================================
// LOGOUT
// ======================================================

logoutBtn?.addEventListener(

    "click",

    async()=>{

        try{

            await signOut(auth);

            window.location.href =

                "login.html";

        }

        catch(error){

            console.error(error);

            showToast(

                "Logout failed.",

                "danger"

            );

        }

    }

);

console.log(

    "notifications.js initialized successfully."

);
