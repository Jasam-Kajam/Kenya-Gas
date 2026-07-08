// ======================================================
// Kenya Gas Marketplace
// support.js
// Part 1
// ======================================================

// ======================================================
// FIREBASE IMPORTS
// ======================================================

import {

    auth,

    db,

    storage

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

    addDoc,

    getDocs,

    serverTimestamp

} from

"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {

    ref,

    uploadBytes,

    getDownloadURL

} from

"https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let currentUser = null;

let currentUserData = {};

let allTickets = [];

let filteredTickets = [];

let currentPage = 1;

const ticketsPerPage = 10;

let selectedRating = 0;

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

// Support Form

const supportTicketForm =

    document.getElementById(

        "supportTicketForm"

    );

const ticketCategory =

    document.getElementById(

        "ticketCategory"

    );

const ticketPriority =

    document.getElementById(

        "ticketPriority"

    );

const ticketSubject =

    document.getElementById(

        "ticketSubject"

    );

const orderNumber =

    document.getElementById(

        "orderNumber"

    );

const contactPhone =

    document.getElementById(

        "contactPhone"

    );

const ticketDescription =

    document.getElementById(

        "ticketDescription"

    );

const ticketAttachment =

    document.getElementById(

        "ticketAttachment"

    );

const emailCopy =

    document.getElementById(

        "emailCopy"

    );

// Tickets

const ticketsTableBody =

    document.getElementById(

        "ticketsTableBody"

    );

const ticketSearch =

    document.getElementById(

        "ticketSearch"

    );

const ticketStatusFilter =

    document.getElementById(

        "ticketStatusFilter"

    );

const ticketCategoryFilter =

    document.getElementById(

        "ticketCategoryFilter"

    );

// Feedback

const supportFeedback =

    document.getElementById(

        "supportFeedback"

    );

const submitFeedbackBtn =

    document.getElementById(

        "submitFeedbackBtn"

    );

// Buttons

const logoutBtn =

    document.getElementById(

        "logoutBtn"

    );

const contactSupplierBtn =

    document.getElementById(

        "contactSupplierBtn"

    );

// Toast

const supportToast =

    document.getElementById(

        "supportToast"

    );

const toastMessage =

    document.getElementById(

        "toastMessage"

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

        await loadSupportTickets();

    }

);

// ======================================================
// PAGE READY
// ======================================================

console.log(

    "Support Center Loaded"

);

// ======================================================
// SUBMIT SUPPORT TICKET
// ======================================================

async function submitSupportTicket(){

    if(!currentUser) return;

    showLoading(true);

    try{

        let attachmentURL = "";

        let attachmentName = "";

        // =====================================
        // UPLOAD ATTACHMENT (OPTIONAL)
        // =====================================

        const file =

            ticketAttachment.files[0];

        if(file){

            if(file.size > 5 * 1024 * 1024){

                showToast(

                    "Attachment must not exceed 5 MB.",

                    "danger"

                );

                showLoading(false);

                return;

            }

            attachmentName = file.name;

            const extension =

                file.name.split(".").pop();

            const storageRef =

                ref(

                    storage,

                    `support/${currentUser.uid}/${Date.now()}.${extension}`

                );

            await uploadBytes(

                storageRef,

                file

            );

            attachmentURL =

                await getDownloadURL(

                    storageRef

                );

        }

        // =====================================
        // CREATE TICKET NUMBER
        // =====================================

        const ticketNumber =

            "SUP-" +

            Date.now();

        // =====================================
        // SAVE TO FIRESTORE
        // =====================================

        await addDoc(

            collection(

                db,

                "supportTickets"

            ),

            {

                ticketNumber,

                userId:

                    currentUser.uid,

                customerName:

                    currentUser.displayName ||

                    "",

                customerEmail:

                    currentUser.email,

                category:

                    ticketCategory.value,

                priority:

                    ticketPriority.value,

                subject:

                    ticketSubject.value.trim(),

                description:

                    ticketDescription.value.trim(),

                orderNumber:

                    orderNumber.value.trim(),

                phone:

                    contactPhone.value.trim(),

                attachmentURL,

                attachmentName,

                emailCopy:

                    emailCopy.checked,

                status:

                    "open",

                createdAt:

                    serverTimestamp(),

                updatedAt:

                    serverTimestamp()

            }

        );

        showToast(

            "Support ticket submitted successfully."

        );

        supportTicketForm.reset();

        document.getElementById(

            "descriptionCount"

        ).textContent =

            "0";

        await loadSupportTickets();

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to submit ticket.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// SUPPORT FORM
// ======================================================

supportTicketForm?.addEventListener(

    "submit",

    e=>{

        e.preventDefault();

        submitSupportTicket();

    }

);

// ======================================================
// NEW TICKET BUTTON
// ======================================================

document.getElementById(

    "newTicketBtn"

)?.addEventListener(

    "click",

    ()=>{

        document.getElementById(

            "ticketSection"

        ).scrollIntoView({

            behavior:"smooth"

        });

        ticketSubject.focus();

    }

);

// ======================================================
// LOAD SUPPORT TICKETS
// ======================================================

async function loadSupportTickets(){

    if(!currentUser) return;

    showLoading(true);

    try{

        const q =

            query(

                collection(

                    db,

                    "supportTickets"

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

        const snapshot =

            await getDocs(q);

        allTickets = [];

        snapshot.forEach(

            docSnap=>{

                allTickets.push({

                    id:docSnap.id,

                    ...docSnap.data()

                });

            }

        );

        filteredTickets =

            [...allTickets];

        updateTicketStatistics();

        renderTickets();

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to load support tickets.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// UPDATE STATISTICS
// ======================================================

function updateTicketStatistics(){

    document.getElementById(

        "totalTicketsBadge"

    ).textContent =

        `${allTickets.length} Tickets`;

    document.getElementById(

        "openTicketsCount"

    ).textContent =

        allTickets.filter(

            t=>t.status==="open"

        ).length;

    document.getElementById(

        "pendingTicketsCount"

    ).textContent =

        allTickets.filter(

            t=>t.status==="pending"

        ).length;

    document.getElementById(

        "resolvedTicketsCount"

    ).textContent =

        allTickets.filter(

            t=>t.status==="resolved"

        ).length;

    document.getElementById(

        "closedTicketsCount"

    ).textContent =

        allTickets.filter(

            t=>t.status==="closed"

        ).length;

}

// ======================================================
// RENDER TICKETS TABLE
// ======================================================

function renderTickets(){

    ticketsTableBody.innerHTML = "";

    if(filteredTickets.length===0){

        ticketsTableBody.innerHTML =

        `

        <tr>

            <td

                colspan="7"

                class="text-center py-5 text-muted">

                <i class="bi bi-inbox display-5 d-block mb-3"></i>

                No support tickets found.

            </td>

        </tr>

        `;

        return;

    }

    const start =

        (currentPage-1) *

        ticketsPerPage;

    const end =

        start +

        ticketsPerPage;

    const pageTickets =

        filteredTickets.slice(

            start,

            end

        );

    pageTickets.forEach(

        ticket=>{

            const created =

                ticket.createdAt?.toDate ?

                ticket.createdAt

                    .toDate()

                    .toLocaleDateString() :

                "-";

            let badge =

                "secondary";

            switch(ticket.status){

                case "open":

                    badge="success";

                    break;

                case "pending":

                    badge="warning";

                    break;

                case "resolved":

                    badge="primary";

                    break;

                case "closed":

                    badge="dark";

                    break;

            }

            ticketsTableBody.innerHTML +=

            `

            <tr>

                <td>

                    ${ticket.ticketNumber}

                </td>

                <td>

                    ${ticket.subject}

                </td>

                <td>

                    ${ticket.category}

                </td>

                <td>

                    <span class="badge bg-info">

                        ${ticket.priority}

                    </span>

                </td>

                <td>

                    <span class="badge bg-${badge}">

                        ${ticket.status}

                    </span>

                </td>

                <td>

                    ${created}

                </td>

                <td>

                    <button

                        class="btn btn-sm btn-outline-success view-ticket"

                        data-id="${ticket.id}">

                        <i class="bi bi-eye"></i>

                    </button>

                </td>

            </tr>

            `;

        }

    );

    document.querySelectorAll(

        ".view-ticket"

    ).forEach(

        button=>{

            button.addEventListener(

                "click",

                ()=>{

                    openTicketDetails(

                        button.dataset.id

                    );

                }

            );

        }

    );

    updatePagination();

}

// ======================================================
// SEARCH & FILTER TICKETS
// ======================================================

function filterTickets(){

    const search =

        ticketSearch.value

        .trim()

        .toLowerCase();

    const status =

        ticketStatusFilter.value;

    const category =

        ticketCategoryFilter.value;

    filteredTickets =

        allTickets.filter(

            ticket=>{

                const matchesSearch =

                    ticket.ticketNumber

                    ?.toLowerCase()

                    .includes(search)

                    ||

                    ticket.subject

                    ?.toLowerCase()

                    .includes(search);

                const matchesStatus =

                    !status ||

                    ticket.status===status;

                const matchesCategory =

                    !category ||

                    ticket.category===category;

                return (

                    matchesSearch &&

                    matchesStatus &&

                    matchesCategory

                );

            }

        );

    currentPage = 1;

    renderTickets();

}

// ======================================================
// PAGINATION
// ======================================================

function updatePagination(){

    const pagination =

        document.getElementById(

            "ticketsPagination"

        );

    if(!pagination) return;

    pagination.innerHTML = "";

    const totalPages =

        Math.max(

            1,

            Math.ceil(

                filteredTickets.length /

                ticketsPerPage

            )

        );

    // Previous

    const previous =

        document.createElement("li");

    previous.className =

        `page-item ${currentPage===1?"disabled":""}`;

    previous.innerHTML =

        `<a class="page-link" href="#">Previous</a>`;

    previous.addEventListener(

        "click",

        e=>{

            e.preventDefault();

            if(currentPage>1){

                currentPage--;

                renderTickets();

            }

        }

    );

    pagination.appendChild(previous);

    // Page Numbers

    for(

        let i=1;

        i<=totalPages;

        i++

    ){

        const page =

            document.createElement("li");

        page.className =

            `page-item ${i===currentPage?"active":""}`;

        page.innerHTML =

            `<a class="page-link" href="#">${i}</a>`;

        page.addEventListener(

            "click",

            e=>{

                e.preventDefault();

                currentPage=i;

                renderTickets();

            }

        );

        pagination.appendChild(page);

    }

    // Next

    const next =

        document.createElement("li");

    next.className =

        `page-item ${currentPage===totalPages?"disabled":""}`;

    next.innerHTML =

        `<a class="page-link" href="#">Next</a>`;

    next.addEventListener(

        "click",

        e=>{

            e.preventDefault();

            if(currentPage<totalPages){

                currentPage++;

                renderTickets();

            }

        }

    );

    pagination.appendChild(next);

}

// ======================================================
// SEARCH EVENTS
// ======================================================

ticketSearch?.addEventListener(

    "input",

    filterTickets

);

ticketStatusFilter?.addEventListener(

    "change",

    filterTickets

);

ticketCategoryFilter?.addEventListener(

    "change",

    filterTickets

);

// ======================================================
// OPEN TICKET DETAILS
// ======================================================

function openTicketDetails(ticketId){

    const ticket =

        allTickets.find(

            t=>t.id===ticketId

        );

    if(!ticket) return;

    const container =

        document.getElementById(

            "ticketDetailsContent"

        );

    let statusBadge =

        "secondary";

    switch(ticket.status){

        case "open":

            statusBadge="success";

            break;

        case "pending":

            statusBadge="warning";

            break;

        case "resolved":

            statusBadge="primary";

            break;

        case "closed":

            statusBadge="dark";

            break;

    }

    const createdDate =

        ticket.createdAt?.toDate ?

        ticket.createdAt

            .toDate()

            .toLocaleString(

                "en-KE"

            ) :

        "-";

    const updatedDate =

        ticket.updatedAt?.toDate ?

        ticket.updatedAt

            .toDate()

            .toLocaleString(

                "en-KE"

            ) :

        "-";

    container.innerHTML =

    `

    <div class="row">

        <div class="col-md-6 mb-3">

            <strong>Ticket Number</strong>

            <p>

                ${ticket.ticketNumber}

            </p>

        </div>

        <div class="col-md-6 mb-3">

            <strong>Status</strong>

            <p>

                <span class="badge bg-${statusBadge}">

                    ${ticket.status}

                </span>

            </p>

        </div>

        <div class="col-md-6 mb-3">

            <strong>Category</strong>

            <p>

                ${ticket.category}

            </p>

        </div>

        <div class="col-md-6 mb-3">

            <strong>Priority</strong>

            <p>

                <span class="badge bg-info">

                    ${ticket.priority}

                </span>

            </p>

        </div>

        <div class="col-12 mb-3">

            <strong>Subject</strong>

            <p>

                ${ticket.subject}

            </p>

        </div>

        <div class="col-12 mb-3">

            <strong>Description</strong>

            <div class="border rounded p-3 bg-light">

                ${ticket.description}

            </div>

        </div>

        <div class="col-md-6 mb-3">

            <strong>Order Number</strong>

            <p>

                ${ticket.orderNumber || "-"}

            </p>

        </div>

        <div class="col-md-6 mb-3">

            <strong>Phone</strong>

            <p>

                ${ticket.phone || "-"}

            </p>

        </div>

        <div class="col-md-6 mb-3">

            <strong>Created</strong>

            <p>

                ${createdDate}

            </p>

        </div>

        <div class="col-md-6 mb-3">

            <strong>Last Updated</strong>

            <p>

                ${updatedDate}

            </p>

        </div>

    </div>

    `;

    // =====================================
    // ATTACHMENT
    // =====================================

    if(ticket.attachmentURL){

        container.innerHTML +=

        `

        <hr>

        <h6>

            Attachment

        </h6>

        <a

            href="${ticket.attachmentURL}"

            target="_blank"

            class="btn btn-outline-success">

            <i class="bi bi-paperclip"></i>

            ${ticket.attachmentName || "Download Attachment"}

        </a>

        `;

    }

    // =====================================
    // ADMIN RESPONSE
    // =====================================

    if(ticket.adminReply){

        container.innerHTML +=

        `

        <hr>

        <div class="alert alert-success">

            <h6>

                <i class="bi bi-person-check-fill"></i>

                Support Response

            </h6>

            <p class="mb-0">

                ${ticket.adminReply}

            </p>

        </div>

        `;

    }

    const modal =

        new bootstrap.Modal(

            document.getElementById(

                "ticketDetailsModal"

            )

        );

    modal.show();

}

// ======================================================
// SUPPORT FEEDBACK
// ======================================================

async function submitSupportFeedback(){

    if(!currentUser){

        return;

    }

    if(selectedRating===0){

        showToast(

            "Please select a star rating.",

            "warning"

        );

        return;

    }

    if(

        supportFeedback.value

        .trim()

        .length===0

    ){

        showToast(

            "Please enter your feedback.",

            "warning"

        );

        return;

    }

    showLoading(true);

    try{

        await addDoc(

            collection(

                db,

                "supportFeedback"

            ),

            {

                userId:

                    currentUser.uid,

                customerName:

                    currentUserData.name ||

                    currentUser.displayName ||

                    "",

                customerEmail:

                    currentUser.email,

                rating:

                    selectedRating,

                feedback:

                    supportFeedback

                        .value

                        .trim(),

                createdAt:

                    serverTimestamp()

            }

        );

        showToast(

            "Thank you for your feedback."

        );

        supportFeedback.value = "";

        selectedRating = 0;

        resetStarRating();

    }

    catch(error){

        console.error(error);

        showToast(

            "Unable to submit feedback.",

            "danger"

        );

    }

    finally{

        showLoading(false);

    }

}

// ======================================================
// STAR RATING
// ======================================================

const ratingButtons =

    document.querySelectorAll(

        ".support-rating"

    );

ratingButtons.forEach(

    button=>{

        button.addEventListener(

            "click",

            ()=>{

                selectedRating =

                    Number(

                        button.dataset.rating

                    );

                updateStarRating();

            }

        );

    }

);

function updateStarRating(){

    ratingButtons.forEach(

        button=>{

            const icon =

                button.querySelector("i");

            if(

                Number(

                    button.dataset.rating

                )<=selectedRating

            ){

                icon.className =

                    "bi bi-star-fill";

            }

            else{

                icon.className =

                    "bi bi-star";

            }

        }

    );

}

function resetStarRating(){

    ratingButtons.forEach(

        button=>{

            button.querySelector(

                "i"

            ).className =

                "bi bi-star";

        }

    );

}

// ======================================================
// FEEDBACK BUTTON
// ======================================================

submitFeedbackBtn?.addEventListener(

    "click",

    submitSupportFeedback

);

// ======================================================
// DESCRIPTION CHARACTER COUNTER
// ======================================================

const descriptionCount =

    document.getElementById(

        "descriptionCount"

    );

ticketDescription?.addEventListener(

    "input",

    ()=>{

        descriptionCount.textContent =

            ticketDescription.value.length;

    }

);

// ======================================================
// ATTACHMENT VALIDATION
// ======================================================

ticketAttachment?.addEventListener(

    "change",

    ()=>{

        const file =

            ticketAttachment.files[0];

        if(!file) return;

        const allowedTypes =

            [

                "image/jpeg",

                "image/png",

                "application/pdf"

            ];

        if(

            !allowedTypes.includes(

                file.type

            )

        ){

            showToast(

                "Only JPG, PNG and PDF files are allowed.",

                "warning"

            );

            ticketAttachment.value="";

            return;

        }

        if(

            file.size >

            5 * 1024 * 1024

        ){

            showToast(

                "File size must not exceed 5 MB.",

                "warning"

            );

            ticketAttachment.value="";

            return;

        }

        showToast(

            `${file.name} selected.`,

            "success"

        );

    }

);

// ======================================================
// RESET SUPPORT FORM
// ======================================================

supportTicketForm?.addEventListener(

    "reset",

    ()=>{

        setTimeout(()=>{

            descriptionCount.textContent =

                "0";

            ticketAttachment.value="";

        },50);

    }

);

// ======================================================
// CONTACT SUPPLIER BUTTON
// ======================================================

contactSupplierBtn?.addEventListener(

    "click",

    ()=>{

        if(allTickets.length===0){

            showToast(

                "You have no recent orders. Please contact support instead.",

                "warning"

            );

            return;

        }

        window.location.href =

            "orders.html";

    }

);

// ======================================================
// AUTO SCROLL TO FIRST ERROR
// ======================================================

function scrollToFirstInvalidField(){

    const invalid =

        document.querySelector(

            ":invalid"

        );

    if(!invalid) return;

    invalid.scrollIntoView({

        behavior:"smooth",

        block:"center"

    });

    invalid.focus();

}

// ======================================================
// FORM VALIDATION
// ======================================================

supportTicketForm?.addEventListener(

    "submit",

    e=>{

        if(

            !supportTicketForm.checkValidity()

        ){

            e.preventDefault();

            scrollToFirstInvalidField();

        }

    }

);

// ======================================================
// SHOW TOAST
// ======================================================

function showToast(

    message,

    type="success"

){

    if(

        !supportToast ||

        !toastMessage

    ) return;

    toastMessage.textContent =

        message;

    supportToast.className =

        "toast align-items-center border-0";

    switch(type){

        case "success":

            supportToast.classList.add(

                "text-bg-success"

            );

            break;

        case "warning":

            supportToast.classList.add(

                "text-bg-warning"

            );

            break;

        case "danger":

            supportToast.classList.add(

                "text-bg-danger"

            );

            break;

        case "info":

            supportToast.classList.add(

                "text-bg-info"

            );

            break;

        default:

            supportToast.classList.add(

                "text-bg-success"

            );

    }

    const toast =

        new bootstrap.Toast(

            supportToast,

            {

                delay:3500

            }

        );

    toast.show();

}

// ======================================================
// SHOW / HIDE LOADING
// ======================================================

function showLoading(show=true){

    if(!loadingOverlay) return;

    if(show){

        loadingOverlay.classList.remove(

            "d-none"

        );

        loadingOverlay.classList.add(

            "d-flex"

        );

    }

    else{

        loadingOverlay.classList.remove(

            "d-flex"

        );

        loadingOverlay.classList.add(

            "d-none"

        );

    }

}

// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(timestamp){

    if(

        !timestamp ||

        !timestamp.toDate

    ){

        return "-";

    }

    return timestamp

        .toDate()

        .toLocaleString(

            "en-KE",

            {

                dateStyle:"medium",

                timeStyle:"short"

            }

        );

}

// ======================================================
// STATUS BADGE CLASS
// ======================================================

function getStatusBadge(status){

    switch(status){

        case "open":

            return "success";

        case "pending":

            return "warning";

        case "resolved":

            return "primary";

        case "closed":

            return "dark";

        default:

            return "secondary";

    }

}

// ======================================================
// PRIORITY BADGE CLASS
// ======================================================

function getPriorityBadge(priority){

    switch(priority){

        case "low":

            return "secondary";

        case "medium":

            return "info";

        case "high":

            return "warning";

        case "urgent":

            return "danger";

        default:

            return "secondary";

    }

}

// ======================================================
// GENERATE TICKET NUMBER
// ======================================================

function generateTicketNumber(){

    const now =

        new Date();

    const year =

        now.getFullYear();

    const random =

        Math.floor(

            100000 +

            Math.random() *

            900000

        );

    return `SUP-${year}-${random}`;

}

// ======================================================
// SCROLL TO TOP
// ======================================================

function scrollToTop(){

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}

// ======================================================
// NETWORK STATUS
// ======================================================

window.addEventListener(

    "offline",

    ()=>{

        showToast(

            "You are offline.",

            "warning"

        );

    }

);

window.addEventListener(

    "online",

    ()=>{

        showToast(

            "Internet connection restored."

        );

    }

);

// ======================================================
// PAGE READY
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        showLoading(false);

    }

);

// ======================================================
// LOAD CURRENT USER
// ======================================================

async function loadCurrentUser(){

    if(!currentUser) return;

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

        if(

            userSnap.exists()

        ){

            currentUserData =

                userSnap.data();

        }

        // =====================================
        // NAME
        // =====================================

        const fullName =

            currentUserData.firstName &&

            currentUserData.lastName

            ?

            `${

                currentUserData.firstName

            } ${

                currentUserData.lastName

            }`

            :

            currentUser.displayName ||

            "Customer";

        if(navbarCustomerName){

            navbarCustomerName.textContent =

                fullName;

        }

        // =====================================
        // PROFILE IMAGE
        // =====================================

        const profileImage =

            currentUserData.photoURL ||

            currentUser.photoURL ||

            "assets/images/default-user.png";

        if(navbarProfileImage){

            navbarProfileImage.src =

                profileImage;

        }

        // =====================================
        // PHONE
        // =====================================

        if(

            !contactPhone.value &&

            currentUserData.phone

        ){

            contactPhone.value =

                currentUserData.phone;

        }

    }

    catch(error){

        console.error(

            "Error loading user:",

            error

        );

        showToast(

            "Unable to load your profile.",

            "danger"

        );

    }

}

// ======================================================
// LOGOUT
// ======================================================

logoutBtn?.addEventListener(

    "click",

    async(e)=>{

        e.preventDefault();

        if(

            !confirm(

                "Are you sure you want to logout?"

            )

        ){

            return;

        }

        showLoading(true);

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

            showLoading(false);

        }

    }

);

// ======================================================
// AUTO-FILL EMAIL
// ======================================================

if(currentUser){

    const emailField =

        document.getElementById(

            "customerEmail"

        );

    if(emailField){

        emailField.value =

            currentUser.email;

    }

}

// ======================================================
// WELCOME MESSAGE
// ======================================================

function showWelcomeMessage(){

    const hour =

        new Date().getHours();

    let greeting =

        "Welcome";

    if(hour < 12){

        greeting =

            "Good Morning";

    }

    else if(hour < 18){

        greeting =

            "Good Afternoon";

    }

    else{

        greeting =

            "Good Evening";

    }

    console.log(

        `${greeting}, ${navbarCustomerName?.textContent || "Customer"}!`

    );

}

showWelcomeMessage();

// ======================================================
// PART 10
// FINAL INITIALIZATION
// ======================================================

// =====================================
// NEW TICKET BUTTON
// =====================================

newTicketBtn?.addEventListener(

    "click",

    ()=>{

        document.getElementById(

            "ticketSection"

        ).scrollIntoView({

            behavior:"smooth"

        });

    }

);

// =====================================
// START CHAT
// =====================================

startChatBtn?.addEventListener(

    "click",

    ()=>{

        showToast(

            "Live Chat will be available soon.",

            "info"

        );

    }

);

// =====================================
// CONTACT SUPPLIER
// =====================================

contactSupplierBtn?.addEventListener(

    "click",

    ()=>{

        window.location.href =

            "suppliers.html";

    }

);

// =====================================
// REFRESH TICKETS
// =====================================

window.addEventListener(

    "focus",

    ()=>{

        if(currentUser){

            loadSupportTickets();

        }

    }

);

// =====================================
// PREVENT DOUBLE SUBMISSION
// =====================================

let submittingTicket = false;

supportTicketForm?.addEventListener(

    "submit",

    async e=>{

        e.preventDefault();

        if(submittingTicket){

            return;

        }

        submittingTicket = true;

        try{

            await submitSupportTicket();

        }

        finally{

            submittingTicket = false;

        }

    }

);

// =====================================
// AUTO-REFRESH EVERY 60 SECONDS
// =====================================

setInterval(

    ()=>{

        if(currentUser){

            loadSupportTickets();

        }

    },

    60000

);

// =====================================
// ESC KEY CLOSES MODAL
// =====================================

document.addEventListener(

    "keydown",

    e=>{

        if(e.key==="Escape"){

            const modal =

                document.querySelector(

                    ".modal.show"

                );

            if(modal){

                bootstrap.Modal

                    .getInstance(

                        modal

                    )

                    ?.hide();

            }

        }

    }

);

// =====================================
// PAGE INITIALIZATION
// =====================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        console.log(

            "Support Center Ready"

        );

        showLoading(false);

        if(descriptionCount){

            descriptionCount.textContent =

                ticketDescription?.value

                ?.length || 0;

        }

    }

);

// =====================================
// GLOBAL ERROR HANDLER
// =====================================

window.addEventListener(

    "error",

    event=>{

        console.error(

            event.error

        );

    }

);

// =====================================
// UNHANDLED PROMISES
// =====================================

window.addEventListener(

    "unhandledrejection",

    event=>{

        console.error(

            event.reason

        );

    }

);

console.log(

    "support.js fully initialized."

);
