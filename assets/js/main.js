// ======================================================
// Kenya Gas Marketplace
// assets/js/main.js
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // LOADER
    // =========================================

    window.addEventListener("load", () => {

        const loader = document.getElementById("loader");

        if (loader) {

            loader.style.opacity = "0";

            setTimeout(() => {

                loader.style.display = "none";

            }, 500);

        }

    });

    // =========================================
    // MOBILE MENU
    // =========================================

    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {

        hamburger.addEventListener("click", () => {

            navLinks.classList.toggle("active");

            const icon = hamburger.querySelector("i");

            if (icon) {

                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-times");

            }

        });

    }

    // =========================================
    // CLOSE MENU AFTER CLICK
    // =========================================

    document.querySelectorAll("#navLinks a").forEach(link => {

        link.addEventListener("click", () => {

            if (navLinks) {

                navLinks.classList.remove("active");

            }

            const icon = hamburger?.querySelector("i");

            if (icon) {

                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");

            }

        });

    });

    // =========================================
    // SEARCH
    // =========================================

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    if (searchBtn && searchInput) {

        searchBtn.addEventListener("click", () => {

            const value = searchInput.value.trim();

            if (value === "") {

                alert("Please enter a county, town or supplier.");

                return;

            }

            alert("Searching for: " + value);

            // Future:
            // window.location.href =
            // "search.html?q=" + encodeURIComponent(value);

        });

    }

    // =========================================
    // NEWSLETTER
    // =========================================

    const newsletterForm =
        document.getElementById("newsletterForm");

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", (e) => {

            e.preventDefault();

            const email =
                newsletterForm.querySelector("input").value;

            if (!email) return;

            alert("Thank you for subscribing!");

            newsletterForm.reset();

        });

    }

    // =========================================
    // ACTIVE NAVIGATION
    // =========================================

    const currentPage =
        window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-links a").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {

            link.classList.add("active");

        }

    });

    // =========================================
    // FADE-IN ANIMATION
    // =========================================

    const sections = document.querySelectorAll(

        "section"

    );

    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";

                    entry.target.style.transform = "translateY(0)";

                }

            });

        },

        {

            threshold:0.15

        }

    );

    sections.forEach(section => {

        section.style.opacity = "0";

        section.style.transform = "translateY(40px)";

        section.style.transition =

            "all .6s ease";

        observer.observe(section);

    });

});


window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.style.display = "none";

        }, 400);

    }

});
