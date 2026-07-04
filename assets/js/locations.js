// ======================================================
// Kenya Gas
// Dynamic County & Town Loader
// Version 1.0
// ======================================================

document.addEventListener("DOMContentLoaded", initLocations);

async function initLocations() {

    const countySelect = document.getElementById("county");
    const townSelect = document.getElementById("town");

    if (!countySelect || !townSelect) return;

    try {

        const countiesResponse = await fetch("assets/data/counties.json");
        const counties = await countiesResponse.json();

        const townsResponse = await fetch("assets/data/towns.json");
        const towns = await townsResponse.json();

        loadCounties(counties, countySelect);

        countySelect.addEventListener("change", () => {

            loadTowns(
                towns,
                countySelect.value,
                townSelect
            );

        });

    }

    catch (error) {

        console.error("Failed to load Kenya locations.", error);

    }

}

// ======================================================
// Load Counties
// ======================================================

function loadCounties(counties, countySelect) {

    countySelect.innerHTML =
        '<option value="">Select County</option>';

    counties.sort().forEach(county => {

        const option = document.createElement("option");

        option.value = county;

        option.textContent = county;

        countySelect.appendChild(option);

    });

}

// ======================================================
// Load Towns
// ======================================================

function loadTowns(towns, county, townSelect) {

    townSelect.innerHTML =
        '<option value="">Select Town</option>';

    if (!county) return;

    const countyTowns = towns[county] || [];

    countyTowns.sort().forEach(town => {

        const option = document.createElement("option");

        option.value = town;

        option.textContent = town;

        townSelect.appendChild(option);

    });

}
