

"use strict";


class MealApi {
  constructor() {
    this.baseUrl = "https://www.themealdb.com/api/json/v1/1";
  }

  /**
   * Universal fetch helper with error handling
   * @param {string} endpoint 
   * @returns {Promise<any>}
   */
  async fetchJson(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[MealApi Error] Failed fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async searchByName(name = "") {
    const data = await this.fetchJson(`search.php?s=${encodeURIComponent(name)}`);
    return data?.meals || [];
  }

  async searchByFirstLetter(letter = "a") {
    const data = await this.fetchJson(`search.php?f=${letter}`);
    return data?.meals || [];
  }

  async getMealById(id) {
    const data = await this.fetchJson(`lookup.php?i=${id}`);
    return data?.meals ? data.meals[0] : null;
  }

  async getRandomMeal() {
    const data = await this.fetchJson(`random.php`);
    return data?.meals ? data.meals[0] : null;
  }

  async getCategories() {
    const data = await this.fetchJson(`categories.php`);
    return data?.categories || [];
  }

  async getAreas() {
    const data = await this.fetchJson(`list.php?a=list`);
    return data?.meals || [];
  }

  async getIngredients() {
    const data = await this.fetchJson(`list.php?i=list`);
    return data?.meals || [];
  }

  async filterByCategory(category) {
    const data = await this.fetchJson(`filter.php?c=${encodeURIComponent(category)}`);
    return data?.meals || [];
  }

  async filterByArea(area) {
    const data = await this.fetchJson(`filter.php?a=${encodeURIComponent(area)}`);
    return data?.meals || [];
  }

  async filterByIngredient(ingredient) {
    const data = await this.fetchJson(`filter.php?i=${encodeURIComponent(ingredient)}`);
    return data?.meals || [];
  }
}


class FavoritesManager {
  constructor(storageKey = "yummy_gourmet_favorites") {
    this.storageKey = storageKey;
  }

  getFavorites() {
    try {
      const items = localStorage.getItem(this.storageKey);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      console.warn("Could not read favorites from localStorage", e);
      return [];
    }
  }

  isFavorite(mealId) {
    const favs = this.getFavorites();
    return favs.some((meal) => meal.idMeal === mealId);
  }

  toggleFavorite(meal) {
    let favs = this.getFavorites();
    const index = favs.findIndex((item) => item.idMeal === meal.idMeal);
    let isNowFav = false;

    if (index > -1) {
      favs.splice(index, 1);
      isNowFav = false;
    } else {
      favs.unshift({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory || "Recipe",
        strArea: meal.strArea || "International",
      });
      isNowFav = true;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(favs));
    } catch (e) {
      console.warn("Could not save favorites to localStorage", e);
    }

    return isNowFav;
  }

  removeFavorite(mealId) {
    let favs = this.getFavorites();
    favs = favs.filter((item) => item.idMeal !== mealId);
    localStorage.setItem(this.storageKey, JSON.stringify(favs));
  }

  clearAll() {
    localStorage.removeItem(this.storageKey);
  }
}


class FormValidator {
  constructor(formId, submitBtnId, onValidityChange) {
    this.form = document.getElementById(formId);
    this.submitBtn = document.getElementById(submitBtnId);
    this.onValidityChange = onValidityChange;

    this.inputs = {
      name: document.getElementById("nameInput"),
      email: document.getElementById("emailInput"),
      phone: document.getElementById("phoneInput"),
      age: document.getElementById("ageInput"),
      password: document.getElementById("passwordInput"),
      repassword: document.getElementById("repasswordInput"),
    };

    this.rules = {
      name: /^[a-zA-Z\s]{3,30}$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      phone: /^(002)?01[0125][0-9]{8}$|^\+?[0-9]{10,15}$/,
      age: /^(?:[1-9][0-9]|100)$/,
      password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    };

    this.validityState = {
      name: false,
      email: false,
      phone: false,
      age: false,
      password: false,
      repassword: false,
    };

    this.setupListeners();
  }

  setupListeners() {
    if (!this.form) return;

    Object.keys(this.inputs).forEach((key) => {
      const input = this.inputs[key];
      if (!input) return;

      input.addEventListener("input", () => {
        this.validateInput(key);
        this.updateSubmitButton();
      });

      input.addEventListener("blur", () => {
        this.validateInput(key);
        this.updateSubmitButton();
      });
    });

    document.querySelectorAll(".toggle-password-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const targetInput = document.getElementById(targetId);
        if (targetInput) {
          const isPass = targetInput.type === "password";
          targetInput.type = isPass ? "text" : "password";
          const icon = btn.querySelector("i");
          if (icon) {
            icon.className = isPass ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
          }
        }
      });
    });
  }

  validateInput(fieldKey) {
    const input = this.inputs[fieldKey];
    if (!input) return false;

    let isValid = false;
    const value = input.value.trim();

    if (fieldKey === "repassword") {
      isValid = value.length > 0 && value === this.inputs.password.value;
    } else {
      const regex = this.rules[fieldKey];
      isValid = regex ? regex.test(value) : false;
    }

    this.validityState[fieldKey] = isValid;

    if (value.length === 0) {
      input.classList.remove("is-valid", "is-invalid");
    } else if (isValid) {
      input.classList.add("is-valid");
      input.classList.remove("is-invalid");
    } else {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
    }

    return isValid;
  }

  isAllValid() {
    return Object.values(this.validityState).every(Boolean);
  }

  updateSubmitButton() {
    const allValid = this.isAllValid();
    if (this.submitBtn) {
      this.submitBtn.disabled = !allValid;
    }
    if (this.onValidityChange) {
      this.onValidityChange(allValid);
    }
  }

  reset() {
    if (this.form) this.form.reset();
    Object.keys(this.validityState).forEach((key) => {
      this.validityState[key] = false;
      const input = this.inputs[key];
      if (input) {
        input.classList.remove("is-valid", "is-invalid");
      }
    });
    this.updateSubmitButton();
  }
}


class Ui {
  constructor() {
    this.toastContainer = document.getElementById("toastContainer");
    this.favBadge = document.getElementById("favBadge");
    this.headerFavCount = document.getElementById("headerFavCount");
  }

  renderSkeletonCards(container, count = 8) {
    let skeletons = "";
    for (let i = 0; i < count; i++) {
      skeletons += `
        <div class="col-xl-3 col-lg-4 col-md-6">
          <div class="skeleton-card p-3">
            <div class="skeleton-thumb rounded-3 mb-3"></div>
            <div class="skeleton-text w-75"></div>
            <div class="skeleton-text w-50"></div>
          </div>
        </div>
      `;
    }
    container.innerHTML = skeletons;
  }

  renderHero(meal, container, onExploreClick, onFavToggle, isFav = false) {
    if (!meal || !container) return;

    container.innerHTML = `
      <div class="hero-card">
        <div class="hero-bg-overlay"></div>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="hero-img" loading="lazy" />
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fa-solid fa-crown"></i> Chef's Spotlight Recipe
          </div>
          <h2 class="hero-title">${meal.strMeal}</h2>
          <div class="hero-meta">
            <span><i class="fa-solid fa-earth-americas text-amber"></i> ${meal.strArea || "International"} Cuisine</span>
            <span><i class="fa-solid fa-layer-group text-amber"></i> ${meal.strCategory || "Gourmet"}</span>
            <span><i class="fa-solid fa-clock text-amber"></i> ~35 Mins</span>
          </div>
          <div class="d-flex flex-wrap gap-3">
            <button class="btn btn-primary-gradient rounded-pill px-4 py-2" id="heroViewDetailsBtn">
              <i class="fa-solid fa-utensils me-2"></i>View Full Recipe
            </button>
            <button class="btn btn-glass-back rounded-pill px-3 py-2" id="heroFavBtn">
              <i class="fa-solid fa-heart ${isFav ? 'text-coral' : ''} me-1"></i> ${isFav ? 'Saved' : 'Save Recipe'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("heroViewDetailsBtn")?.addEventListener("click", () => {
      onExploreClick(meal.idMeal);
    });

    document.getElementById("heroFavBtn")?.addEventListener("click", () => {
      onFavToggle(meal);
    });
  }

  renderMealCards(meals, container, onCardClick, onFavClick, favManager) {
    if (!meals || meals.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="glass-panel p-5 d-inline-block">
            <i class="fa-solid fa-kitchen-set fa-3x text-amber mb-3"></i>
            <h4 class="text-white">No Recipes Found</h4>
            <p class="text-muted mb-0">Try searching for a different dish or category.</p>
          </div>
        </div>
      `;
      return;
    }

    let cardsHtml = "";
    meals.forEach((meal) => {
      const isFav = favManager ? favManager.isFavorite(meal.idMeal) : false;
      cardsHtml += `
        <div class="col-xl-3 col-lg-4 col-md-6">
          <div class="meal-card" data-id="${meal.idMeal}">
            <div class="meal-thumb-wrapper">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-thumb" loading="lazy" />
              <div class="meal-card-overlay"></div>
              
              <div class="meal-badges">
                ${meal.strCategory ? `<span class="meal-badge"><i class="fa-solid fa-tag text-amber"></i> ${meal.strCategory}</span>` : ''}
                ${meal.strArea ? `<span class="meal-badge"><i class="fa-solid fa-earth-americas text-amber"></i> ${meal.strArea}</span>` : ''}
              </div>

              <button class="fav-btn ${isFav ? 'is-favorite' : ''}" data-fav-id="${meal.idMeal}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="fa-solid fa-heart"></i>
              </button>
            </div>

            <div class="meal-card-body">
              <h3 class="meal-card-title">${meal.strMeal}</h3>
              <div class="meal-card-action">
                <span class="view-recipe-text">
                  Cook Recipe <i class="fa-solid fa-arrow-right"></i>
                </span>
                <span class="text-muted small">
                  <i class="fa-regular fa-clock me-1"></i> Quick & Tasty
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;

    container.querySelectorAll(".meal-card").forEach((card) => {
      const mealId = card.dataset.id;
      const mealObj = meals.find((m) => m.idMeal === mealId) || { idMeal: mealId };

      card.addEventListener("click", (e) => {
        if (e.target.closest(".fav-btn")) return;
        onCardClick(mealId);
      });

      const favBtn = card.querySelector(".fav-btn");
      if (favBtn) {
        favBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          onFavClick(mealObj, favBtn);
        });
      }
    });
  }

  renderCategories(categories, container, onCategoryClick) {
    if (!categories || categories.length === 0) {
      container.innerHTML = `<div class="col-12 text-center text-muted">No categories available.</div>`;
      return;
    }

    let html = "";
    categories.forEach((cat) => {
      html += `
        <div class="col-xl-3 col-lg-4 col-md-6">
          <div class="category-card" data-category="${cat.strCategory}">
            <div class="category-thumb-wrapper">
              <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" class="category-thumb" loading="lazy" />
            </div>
            <div class="category-card-body">
              <h3 class="category-title">${cat.strCategory}</h3>
              <p class="category-desc">${cat.strCategoryDescription || "Discover authentic dishes crafted with love."}</p>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        onCategoryClick(card.dataset.category);
      });
    });
  }

  renderAreas(areas, container, onAreaClick) {
    if (!areas || areas.length === 0) {
      container.innerHTML = `<div class="col-12 text-center text-muted">No areas found.</div>`;
      return;
    }

    const areaIcons = {
      American: "fa-burger",
      British: "fa-fish",
      Canadian: "fa-leaf",
      Chinese: "fa-bowl-rice",
      Croatian: "fa-utensils",
      Dutch: "fa-cheese",
      Egyptian: "fa-pyramid",
      Filipino: "fa-bowl-food",
      French: "fa-wine-glass",
      Greek: "fa-lemon",
      Indian: "fa-pepper-hot",
      Irish: "fa-clover",
      Italian: "fa-pizza-slice",
      Jamaican: "fa-drumstick-bite",
      Japanese: "fa-bowl-rice",
      Kenyan: "fa-earth-africa",
      Malaysian: "fa-shrimp",
      Mexican: "fa-pepper-hot",
      Moroccan: "fa-cookie",
      Polish: "fa-bread-slice",
      Portuguese: "fa-fish-fins",
      Russian: "fa-snowflake",
      Spanish: "fa-wine-bottle",
      Thai: "fa-fire-flame-curved",
      Tunisian: "fa-sun",
      Turkish: "fa-mug-hot",
      Vietnamese: "fa-spoon",
      default: "fa-earth-americas",
    };

    let html = "";
    areas.forEach((area) => {
      const areaName = area.strArea;
      const icon = areaIcons[areaName] || areaIcons.default;

      html += `
        <div class="col-xl-3 col-lg-4 col-sm-6">
          <div class="area-card" data-area="${areaName}">
            <div class="area-icon-box">
              <i class="fa-solid ${icon}"></i>
            </div>
            <h3 class="area-name">${areaName}</h3>
            <span class="area-hint">Explore Authentic Recipes <i class="fa-solid fa-arrow-right ms-1"></i></span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll(".area-card").forEach((card) => {
      card.addEventListener("click", () => {
        onAreaClick(card.dataset.area);
      });
    });
  }

  renderIngredients(ingredients, container, onIngredientClick) {
    if (!ingredients || ingredients.length === 0) {
      container.innerHTML = `<div class="col-12 text-center text-muted">No ingredients found.</div>`;
      return;
    }

    let html = "";
    const list = ingredients.slice(0, 24);

    list.forEach((item) => {
      html += `
        <div class="col-xl-3 col-lg-4 col-sm-6">
          <div class="ingredient-card" data-ingredient="${item.strIngredient}">
            <div class="ingredient-icon-box">
              <i class="fa-solid fa-drumstick-bite"></i>
            </div>
            <h3 class="ingredient-title">${item.strIngredient}</h3>
            <p class="ingredient-desc">${item.strDescription || "Fresh pantry ingredient used in gourmet culinary recipes."}</p>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll(".ingredient-card").forEach((card) => {
      card.addEventListener("click", () => {
        onIngredientClick(card.dataset.ingredient);
      });
    });
  }

  renderMealDetails(meal, container, onBackClick, onFavToggle, isFav = false) {
    if (!meal || !container) return;

    let ingredientsHtml = "";
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]?.trim();
      const measure = meal[`strMeasure${i}`]?.trim();

      if (ingredient) {
        ingredientsHtml += `
          <div class="ingredient-pill">
            <span class="measure-badge">${measure || "to taste"}</span>
            <span>${ingredient}</span>
          </div>
        `;
      }
    }

    let tagsHtml = "";
    const tags = meal.strTags ? meal.strTags.split(",") : [];
    tags.forEach((tag) => {
      if (tag.trim()) {
        tagsHtml += `<span class="tag-badge"><i class="fa-solid fa-hashtag me-1"></i>${tag.trim()}</span>`;
      }
    });

    container.innerHTML = `
      <div class="details-hero-card p-lg-5 p-4 mb-4">
        <div class="row g-5 align-items-start">
          <!-- Meal Media Column -->
          <div class="col-lg-5">
            <div class="position-relative mb-4">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="details-meal-img w-100" />
              <button class="fav-btn ${isFav ? 'is-favorite' : ''}" id="detailsFavBtn" style="top: 1rem; right: 1rem; width: 44px; height: 44px; font-size: 1.2rem;">
                <i class="fa-solid fa-heart"></i>
              </button>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-3">
              <span class="meal-badge bg-amber text-dark fw-bold">
                <i class="fa-solid fa-layer-group"></i> ${meal.strCategory || "Category"}
              </span>
              <span class="meal-badge bg-dark-glass">
                <i class="fa-solid fa-earth-americas text-amber"></i> ${meal.strArea || "International"}
              </span>
            </div>

            <div class="d-flex flex-column gap-3 mt-4">
              ${meal.strYoutube ? `
                <a href="${meal.strYoutube}" target="_blank" class="btn btn-danger py-2 rounded-pill fw-semibold">
                  <i class="fa-brands fa-youtube me-2"></i>Watch Video Tutorial
                </a>
              ` : ''}
              ${meal.strSource ? `
                <a href="${meal.strSource}" target="_blank" class="btn btn-glass-back py-2 rounded-pill fw-semibold">
                  <i class="fa-solid fa-arrow-up-right-from-square me-2"></i>Original Source
                </a>
              ` : ''}
            </div>
          </div>

          <!-- Recipe Details Column -->
          <div class="col-lg-7">
            <h1 class="display-6 fw-bold text-white mb-3">${meal.strMeal}</h1>

            <div class="mb-4">
              <h3 class="h5 text-amber fw-bold mb-3">
                <i class="fa-solid fa-basket-shopping me-2"></i>Ingredients & Measurements
              </h3>
              <div class="d-flex flex-wrap gap-2">
                ${ingredientsHtml || '<span class="text-muted">No specific ingredients listed.</span>'}
              </div>
            </div>

            <div class="mb-4">
              <h3 class="h5 text-amber fw-bold mb-3">
                <i class="fa-solid fa-list-check me-2"></i>Cooking Instructions
              </h3>
              <div class="instructions-text">
                ${meal.strInstructions || 'No instructions provided.'}
              </div>
            </div>

            ${tagsHtml ? `
              <div class="mt-4 pt-3 border-top border-secondary">
                <h4 class="h6 text-muted mb-2">Recipe Tags:</h4>
                <div class="d-flex flex-wrap gap-2">
                  ${tagsHtml}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    document.getElementById("backToPreviousBtn")?.addEventListener("click", onBackClick);

    const detailsFavBtn = document.getElementById("detailsFavBtn");
    if (detailsFavBtn) {
      detailsFavBtn.addEventListener("click", () => {
        onFavToggle(meal, detailsFavBtn);
      });
    }
  }


  updateFavoritesBadge(count) {
    if (this.favBadge) {
      this.favBadge.textContent = count;
      this.favBadge.classList.toggle("d-none", count === 0);
    }
    if (this.headerFavCount) {
      this.headerFavCount.textContent = count;
      this.headerFavCount.classList.toggle("d-none", count === 0);
    }
  }


  showToast(title, message, iconType = "info") {
    if (!this.toastContainer) return;

    const iconMap = {
      success: '<i class="fa-solid fa-circle-check text-emerald me-2"></i>',
      heart: '<i class="fa-solid fa-heart text-coral me-2"></i>',
      info: '<i class="fa-solid fa-circle-info text-amber me-2"></i>',
      error: '<i class="fa-solid fa-triangle-exclamation text-coral me-2"></i>',
    };

    const toastEl = document.createElement("div");
    toastEl.className = "custom-toast toast align-items-center show mb-2 border-0";
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
      <div class="d-flex p-3">
        <div class="toast-body d-flex align-items-center">
          ${iconMap[iconType] || iconMap.info}
          <div>
            <div class="fw-bold small text-white">${title}</div>
            <div class="text-muted small">${message}</div>
          </div>
        </div>
        <button type="button" class="btn-close btn-close-white ms-auto me-2 my-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    this.toastContainer.appendChild(toastEl);

    toastEl.querySelector(".btn-close")?.addEventListener("click", () => {
      toastEl.remove();
    });

    setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => toastEl.remove(), 400);
    }, 3500);
  }
}

class YummyApp {
  constructor() {
    this.api = new MealApi();
    this.favorites = new FavoritesManager();
    this.ui = new Ui();
    this.currentView = "home";
    this.previousView = "home";
    this.cachedMeals = [];
    this.cachedCategories = [];
    this.searchTimer = null;

    // View DOM Elements
    this.views = {
      home: document.getElementById("view-home"),
      search: document.getElementById("view-search"),
      categories: document.getElementById("view-categories"),
      area: document.getElementById("view-area"),
      ingredients: document.getElementById("view-ingredients"),
      favorites: document.getElementById("view-favorites"),
      details: document.getElementById("view-details"),
      contact: document.getElementById("view-contact"),
    };

    this.pageSubtitle = document.getElementById("pageSubtitle");
  }


  async init() {
    this.setupSidebar();
    this.setupNavigation();
    this.setupSearch();
    this.setupFavorites();
    this.setupContactForm();
    this.updateBadges();

    await this.loadHome();
  }


  setupSidebar() {
    const sidebarWrapper = document.getElementById("sidebarWrapper");
    const toggleBtn = document.getElementById("dockToggleBtn");
    const toggleIcon = document.getElementById("toggleIcon");
    const backdrop = document.getElementById("sidebarBackdrop");

    const toggle = () => {
      const isOpen = sidebarWrapper.classList.toggle("open");
      backdrop.classList.toggle("active", isOpen);
      toggleIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars-staggered";
    };

    const close = () => {
      sidebarWrapper.classList.remove("open");
      backdrop.classList.remove("active");
      toggleIcon.className = "fa-solid fa-bars-staggered";
    };

    toggleBtn?.addEventListener("click", toggle);
    backdrop?.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    this.closeSidebar = close;
  }

  setupNavigation() {
    document.getElementById("headerBrandTitle")?.addEventListener("click", () => {
      this.switchView("home");
      this.closeSidebar();
    });

    document.getElementById("dockBrandLogo")?.addEventListener("click", () => {
      this.switchView("home");
      this.closeSidebar();
    });


    document.querySelectorAll(".nav-link-item").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const viewName = link.dataset.view;
        this.switchView(viewName);
        this.closeSidebar();
      });
    });

    document.getElementById("quickFavBtn")?.addEventListener("click", () => {
      this.switchView("favorites");
      this.closeSidebar();
    });
    document.getElementById("quickSearchBtn")?.addEventListener("click", () => {
      this.switchView("search");
      this.closeSidebar();
    });

    // Header buttons
    document.getElementById("headerSearchBtn")?.addEventListener("click", () => {
      this.switchView("search");
    });
    document.getElementById("headerFavBtn")?.addEventListener("click", () => {
      this.switchView("favorites");
    });
  }


  switchView(viewName, subtitle = "") {
    if (!this.views[viewName]) return;

    if (this.currentView !== "details") {
      this.previousView = this.currentView;
    }
    this.currentView = viewName;


    Object.keys(this.views).forEach((key) => {
      const viewEl = this.views[key];
      if (viewEl) {
        if (key === viewName) {
          viewEl.classList.remove("d-none");
          viewEl.classList.add("active");
        } else {
          viewEl.classList.add("d-none");
          viewEl.classList.remove("active");
        }
      }
    });

    document.querySelectorAll(".nav-link-item").forEach((link) => {
      link.classList.toggle("active", link.dataset.view === viewName);
    });
    const subtitlesMap = {
      home: "Explore Delicious Meals",
      search: "Search Gourmet Recipes",
      categories: "Browse Categories",
      area: "World Culinary Traditions",
      ingredients: "Cooking with Fresh Ingredients",
      favorites: "Your Saved Collection",
      details: "Recipe Preparation & Details",
      contact: "Get in Touch with Yummy",
    };

    if (this.pageSubtitle) {
      this.pageSubtitle.textContent = subtitle || subtitlesMap[viewName] || "Discover Culinary Excellence";
    }


    window.scrollTo({ top: 0, behavior: "smooth" });


    if (viewName === "categories") {
      this.loadCategories();
    } else if (viewName === "area") {
      this.loadAreas();
    } else if (viewName === "ingredients") {
      this.loadIngredients();
    } else if (viewName === "favorites") {
      this.loadFavorites();
    } else if (viewName === "search") {
      document.getElementById("searchByNameInput")?.focus();
    }
  }


  async loadHome() {
    const heroContainer = document.getElementById("heroContainer");
    const homeMealsGrid = document.getElementById("homeMealsGrid");
    const filterPillsContainer = document.getElementById("homeQuickFilters");

    this.ui.renderSkeletonCards(homeMealsGrid, 8);

    try {
      const [spotlightMeal, meals, categories] = await Promise.all([
        this.api.getRandomMeal(),
        this.api.searchByName(""),
        this.api.getCategories(),
      ]);

      this.cachedMeals = meals;
      this.cachedCategories = categories;

      // Render Hero
      if (spotlightMeal) {
        const isFav = this.favorites.isFavorite(spotlightMeal.idMeal);
        this.ui.renderHero(
          spotlightMeal,
          heroContainer,
          (mealId) => this.loadMealDetails(mealId),
          (meal) => this.handleFavToggle(meal)
        );
      }
      if (filterPillsContainer && categories.length > 0) {
        let pillsHtml = `<button class="filter-pill active" data-cat="all">All Dishes</button>`;
        categories.slice(0, 8).forEach((cat) => {
          pillsHtml += `<button class="filter-pill" data-cat="${cat.strCategory}">${cat.strCategory}</button>`;
        });
        filterPillsContainer.innerHTML = pillsHtml;

        filterPillsContainer.querySelectorAll(".filter-pill").forEach((pill) => {
          pill.addEventListener("click", async () => {
            filterPillsContainer.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");

            const selectedCat = pill.dataset.cat;
            this.ui.renderSkeletonCards(homeMealsGrid, 8);

            if (selectedCat === "all") {
              this.ui.renderMealCards(
                this.cachedMeals.slice(0, 20),
                homeMealsGrid,
                (id) => this.loadMealDetails(id),
                (meal, btn) => this.handleFavToggle(meal, btn),
                this.favorites
              );
            } else {
              const catMeals = await this.api.filterByCategory(selectedCat);
              this.ui.renderMealCards(
                catMeals.slice(0, 20),
                homeMealsGrid,
                (id) => this.loadMealDetails(id),
                (meal, btn) => this.handleFavToggle(meal, btn),
                this.favorites
              );
            }
          });
        });
      }


      this.ui.renderMealCards(
        meals.slice(0, 20),
        homeMealsGrid,
        (mealId) => this.loadMealDetails(mealId),
        (meal, btn) => this.handleFavToggle(meal, btn),
        this.favorites
      );
    } catch (err) {
      console.error("Failed to load home:", err);
      homeMealsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-danger">Failed to load recipes. Please check your internet connection.</p>
        </div>
      `;
    }
  }

  
  async loadCategories() {
    const grid = document.getElementById("categoriesGrid");
    this.ui.renderSkeletonCards(grid, 8);

    try {
      const categories = this.cachedCategories.length > 0 
        ? this.cachedCategories 
        : await this.api.getCategories();
      this.cachedCategories = categories;

      this.ui.renderCategories(categories, grid, async (categoryName) => {
        this.switchView("home", `Category: ${categoryName}`);
        const homeMealsGrid = document.getElementById("homeMealsGrid");
        this.ui.renderSkeletonCards(homeMealsGrid, 8);

        const meals = await this.api.filterByCategory(categoryName);
        this.ui.renderMealCards(
          meals.slice(0, 20),
          homeMealsGrid,
          (id) => this.loadMealDetails(id),
          (meal, btn) => this.handleFavToggle(meal, btn),
          this.favorites
        );
      });
    } catch (err) {
      console.error("Failed loading categories:", err);
    }
  }

  
  async loadAreas() {
    const grid = document.getElementById("areasGrid");
    this.ui.renderSkeletonCards(grid, 8);

    try {
      const areas = await this.api.getAreas();
      this.ui.renderAreas(areas, grid, async (areaName) => {
        this.switchView("home", `Cuisine: ${areaName}`);
        const homeMealsGrid = document.getElementById("homeMealsGrid");
        this.ui.renderSkeletonCards(homeMealsGrid, 8);

        const meals = await this.api.filterByArea(areaName);
        this.ui.renderMealCards(
          meals.slice(0, 20),
          homeMealsGrid,
          (id) => this.loadMealDetails(id),
          (meal, btn) => this.handleFavToggle(meal, btn),
          this.favorites
        );
      });
    } catch (err) {
      console.error("Failed loading areas:", err);
    }
  }

  
  async loadIngredients() {
    const grid = document.getElementById("ingredientsGrid");
    const filterInput = document.getElementById("filterIngredientsInput");
    this.ui.renderSkeletonCards(grid, 8);

    try {
      const ingredients = await this.api.getIngredients();
      
      const render = (list) => {
        this.ui.renderIngredients(list, grid, async (ingredientName) => {
          this.switchView("home", `Ingredient: ${ingredientName}`);
          const homeMealsGrid = document.getElementById("homeMealsGrid");
          this.ui.renderSkeletonCards(homeMealsGrid, 8);

          const meals = await this.api.filterByIngredient(ingredientName);
          this.ui.renderMealCards(
            meals.slice(0, 20),
            homeMealsGrid,
            (id) => this.loadMealDetails(id),
            (meal, btn) => this.handleFavToggle(meal, btn),
            this.favorites
          );
        });
      };

      render(ingredients);

      if (filterInput) {
        filterInput.value = "";
        filterInput.oninput = () => {
          const q = filterInput.value.toLowerCase().trim();
          const filtered = ingredients.filter((ing) => ing.strIngredient.toLowerCase().includes(q));
          render(filtered);
        };
      }
    } catch (err) {
      console.error("Failed loading ingredients:", err);
    }
  }


  async loadMealDetails(mealId) {
    this.switchView("details", "Recipe Instructions");
    const container = document.getElementById("mealDetailsContainer");
    container.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-amber" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;

    try {
      const meal = await this.api.getMealById(mealId);
      if (!meal) {
        container.innerHTML = `<p class="text-danger text-center">Recipe details not found.</p>`;
        return;
      }

      const isFav = this.favorites.isFavorite(meal.idMeal);
      this.ui.renderMealDetails(
        meal,
        container,
        () => this.switchView(this.previousView || "home"),
        (mealObj, btn) => this.handleFavToggle(mealObj, btn),
        isFav
      );
    } catch (err) {
      console.error("Failed loading meal details:", err);
      container.innerHTML = `<p class="text-danger text-center">Failed to fetch recipe.</p>`;
    }
  }

  
  loadFavorites() {
    const grid = document.getElementById("favoritesGrid");
    const favs = this.favorites.getFavorites();

    this.ui.renderMealCards(
      favs,
      grid,
      (mealId) => this.loadMealDetails(mealId),
      (meal, btn) => {
        this.handleFavToggle(meal, btn);
        this.loadFavorites();
      },
      this.favorites
    );
  }

  
  setupSearch() {
    const nameInput = document.getElementById("searchByNameInput");
    const letterInput = document.getElementById("searchByLetterInput");
    const clearBtn = document.getElementById("clearSearchName");
    const grid = document.getElementById("searchResultsGrid");
    const countEl = document.getElementById("searchResultsCount");

    const performSearch = async (query, isLetter = false) => {
      if (!query) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5 text-muted empty-state-box">
            <i class="fa-solid fa-utensils fa-3x mb-3 text-amber opacity-50"></i>
            <p class="fs-5 text-white">Start typing to search delicious recipes!</p>
          </div>
        `;
        if (countEl) countEl.textContent = "";
        return;
      }

      this.ui.renderSkeletonCards(grid, 8);

      try {
        const meals = isLetter 
          ? await this.api.searchByFirstLetter(query)
          : await this.api.searchByName(query);

        if (countEl) {
          countEl.textContent = `${meals.length} recipe(s) found`;
        }

        this.ui.renderMealCards(
          meals,
          grid,
          (id) => this.loadMealDetails(id),
          (meal, btn) => this.handleFavToggle(meal, btn),
          this.favorites
        );
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    
    nameInput?.addEventListener("input", () => {
      const val = nameInput.value.trim();
      clearBtn?.classList.toggle("d-none", val.length === 0);
      if (letterInput) letterInput.value = "";

      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        performSearch(val, false);
      }, 300);
    });

    clearBtn?.addEventListener("click", () => {
      if (nameInput) nameInput.value = "";
      clearBtn.classList.add("d-none");
      performSearch("", false);
    });

    
    letterInput?.addEventListener("input", () => {
      const val = letterInput.value.trim();
      if (nameInput) nameInput.value = "";
      clearBtn?.classList.add("d-none");

      if (val.length > 0) {
        performSearch(val[0], true);
      } else {
        performSearch("", false);
      }
    });
  }

  
  setupFavorites() {
    document.getElementById("clearAllFavoritesBtn")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all saved recipes?")) {
        this.favorites.clearAll();
        this.updateBadges();
        this.loadFavorites();
        this.ui.showToast("Favorites Cleared", "All saved recipes have been removed.", "info");
      }
    });
  }

  
  handleFavToggle(meal, btnElement = null) {
    const isNowFav = this.favorites.toggleFavorite(meal);
    this.updateBadges();

    if (btnElement) {
      btnElement.classList.toggle("is-favorite", isNowFav);
      btnElement.title = isNowFav ? "Remove from favorites" : "Add to favorites";
    }

    
    if (isNowFav) {
      this.ui.showToast(
        "Saved to Favorites!", 
        `"${meal.strMeal}" has been added to your collection.`, 
        "heart"
      );
    } else {
      this.ui.showToast(
        "Removed from Favorites", 
        `"${meal.strMeal}" removed from your collection.`, 
        "info"
      );
    }
  }

  
  updateBadges() {
    const count = this.favorites.getFavorites().length;
    this.ui.updateFavoritesBadge(count);
  }

  
  setupContactForm() {
    this.validator = new FormValidator("contactForm", "submitContactBtn");

    const form = document.getElementById("contactForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.validator.isAllValid()) {
        this.ui.showToast(
          "Message Sent Successfully!",
          "Thank you for contacting Yummy. We will get back to you shortly.",
          "success"
        );
        this.validator.reset();
      }
    });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const app = new YummyApp();
  app.init();
  window.yummyApp = app;
});
