const state = {
  destinations: [],
  filtered: []
};


const searchInput = document.getElementById("searchInput");
const interestSelect = document.getElementById("interestSelect");
const seasonSelect = document.getElementById("seasonSelect");
const budgetSelect = document.getElementById("budgetSelect");
const durationSelect = document.getElementById("durationSelect");
const resetBtn = document.getElementById("resetBtn");
const cardGrid = document.getElementById("cardGrid");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

function tripLengthBucket(days) {
  if (days <= 3) return "short";
  if (days <= 7) return "medium";
  return "long";
}


function matchesText(destination, query) {
  if (!query) return true;
  const haystack = [
    destination.name,
    destination.province,
    destination.summary,
    destination.type,
    ...(destination.interests || []),
    ...(destination.highlights || [])
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const interest = interestSelect.value;
  const season = seasonSelect.value;
  const budget = budgetSelect.value;
  const duration = durationSelect.value;
  state.filtered = state.destinations.filter((destination) => {
    if (!matchesText(destination, query)) return false;
    if (interest && !destination.interests.includes(interest)) return false;
    if (season && !destination.bestSeasons.includes(season)) return false;
    if (budget && destination.budget !== budget) return false;
    if (duration && tripLengthBucket(destination.durationDays) !== duration) return false;
    return true;
  });

  renderCards();
}

function renderCards() {
  cardGrid.innerHTML = "";

  resultCount.textContent = `${state.filtered.length} destination${state.filtered.length === 1 ? "" : "s"} ready for your shortlist`;
  emptyState.hidden = state.filtered.length !== 0;

  state.filtered.forEach((destination) => {
    const card = document.createElement("article");
    card.className = "card";

    const imagePath = destination.image || "../assets/images/photo-placeholder.svg";

    card.innerHTML = `
      <img class="card-photo" src="${imagePath}" alt="${destination.name}" loading="lazy" decoding="async">
      <div class="card-body">
        <h3>${destination.name}</h3>
        <div class="meta">
          <span class="chip">${destination.province}</span>
          <span class="chip">${destination.type}</span>
          <span class="chip">${destination.durationDays} days</span>
          <span class="chip">${destination.budget} budget</span>
        </div>
        <p>${destination.summary}</p>
        <p><strong>Why go:</strong> ${destination.highlights.join(", ")}</p>
        <p><strong>Best seasons:</strong> ${destination.bestSeasons.join(", ")}</p>
        <p><strong>Access:</strong> ${destination.transport}</p>
        <p><strong>Typical daily spend:</strong> ${destination.budgetRange}</p>
        <div class="card-links">
          <a href="${destination.provincePage}" aria-label="Open ${destination.province} province page">View province profile</a>
        </div>
      </div>
    `;

    const img = card.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        img.src = "../assets/images/photo-placeholder.svg";
      });
    }

    cardGrid.appendChild(card);
  });
}

function addBackToTopButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.textContent = "Top";
  button.setAttribute("aria-label", "Back to top");

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.body.appendChild(button);

  function handleVisibility() {
    if (window.scrollY > 320) {
      button.classList.add("visible");
    } else {
      button.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", handleVisibility, { passive: true });
  handleVisibility();
}

function bindEvents() {
  [searchInput, interestSelect, seasonSelect, budgetSelect, durationSelect].forEach((el) => {
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });

  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    interestSelect.value = "";
    seasonSelect.value = "";
    budgetSelect.value = "";
    durationSelect.value = "";
    applyFilters();
  });
}

async function init() {
  try {
    const response = await fetch("data/destinations.json");
    if (!response.ok) {
      throw new Error("Could not load destinations data.");
    }

    state.destinations = await response.json();
    state.filtered = [...state.destinations];
    bindEvents();
    renderCards();
    addBackToTopButton();
  } catch (error) {
    resultCount.textContent = "Unable to load destinations.";
    emptyState.hidden = false;
    emptyState.textContent = "Data load failed. Please refresh and try again.";
    console.error(error);
  }
}

init();

