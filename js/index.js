/// <reference types="../@types/jquery" />

/// <reference types="../@types/jquery" />
"use strict";
const home = document.querySelector(".home .row");
const render_search = document.querySelector(".render-search");
const Area = document.querySelector(".Area");
const ingredients = document.querySelector(".ingredients");
const contact = document.querySelector(".contact");
const loader = document.querySelector(".loading");
const allCard = document.querySelectorAll(".card");

// nav
$(".nav-menu").on("click", function () {
  sideClose();
});

function sideClose() {
  $(".side-nav").animate(
    { width: "toggle", paddingInline: "toggle" },
    700,
    function () {
      $("ul").toggleClass("animate__fadeInBottomLeft");
     
    }
  );
  $(".side-nav").toggleClass("active");
  $(".side-nav").css({ display: "flex" }, 1000);
  $(".nav-menu i").toggleClass("fa-xmark");
}

// * =============> renderHome ===============>

// loader.classList.remove("d-none");

async function renderHome() {
  let data = await fetchApi(
    "https://www.themealdb.com/api/json/v1/1/search.php?s="
  );
  let { meals } = data;
  let cartain = renderDesign(meals);
  home.innerHTML = cartain;

  const allCard = document.querySelectorAll(".card");
  allCard.forEach(function (card) {
    card.addEventListener("click", function (e) {
      let cardId = e.target.closest(".card").dataset.id;
      renderDetails(cardId);
    });
  });
}

setTimeout(function () {
  renderHome();
  loader.classList.add("d-none");
}, 1000);

// ***********  renderDetails

async function renderDetails(id) {
  loader.classList.remove("d-none");
  let data = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  let { meals } = data;

  let tagApi = ``;
  let allTags = meals[0].strTags?.split(",") ?? [];
  allTags.forEach((tag) => {
    tagApi += ` <p class="p-2 ms-2  rounded">${tag}</p>`;
  });

  let counter = ``;
  for (let index = 0; index < 20; index++) {
    if (
      meals[0][`strIngredient${index}`] != "" &&
      meals[0][`strIngredient${index}`] != undefined
    ) {
      let y = meals[0][`strIngredient${index}`];
      let x = meals[0][`strMeasure${index}`];
      counter += ` <p class="p-2 counter rounded rounded-1 me-2">${
        x + " " + y
      }</p>`;
    }
  }

  let cartaina = `
      <div class="row g-4 text-white mt-5">
  <div class="col-md-4">
    <div class="img rounded overflow-hidden ">
      <img src="${meals[0].strMealThumb}" class="w-100" alt="" />
    </div>
    <h2>${meals[0].strMeal}</h2>
  </div>
  <div class="col-md-8">
    <h3>Instructions</h3>
    <p>
    ${meals[0].strInstructions}
    </p>
    <h2>Area : ${meals[0].strArea}</h2>
    <h2>Category : ${meals[0].strCategory}</h2>
    <h2>Recipes :</h2>
    <div class="items d-flex flex-wrap ">
      ${counter}
      
    </div>
    <h2 class="mb-2">Tags:</h2>
    <div class="d-flex tags">
   ${tagApi}
    </div>
    <button class="btn btn-success  me-2" > <a class="text-white"  target="_blank" href="${meals[0].strSource}">Source</a> </button>
    <button class="btn btn-danger " > <a class="text-white"  target="_blank" href="${meals[0].strYoutube}">Youtue</a>  </button>
  </div>
</div>
      `;

  home.innerHTML = cartaina;
  loader.classList.add("d-none");
}

// * =============> renderCategory ===============>

document.getElementById("category").addEventListener("click", function (e) {
  Area.classList.add("d-none");
  contact.classList.add("d-none");
  ingredients.classList.add("d-none");
  render_search.classList.add("d-none");
  sideClose();
  home.classList.remove("d-none");
  renderCategory();
});

async function renderCategory() {
  loader.classList.remove("d-none");

  let data = await fetchApi(
    "https://www.themealdb.com/api/json/v1/1/categories.php"
  );
  let { categories } = data;
  let cartaina = ``;
  categories.forEach((cat) => {
    cartaina += `
    <div class="col-md-3">
              <div data-name="${cat.strCategory}"  class="card p-3 bg-transparent overflow-hidden position-relative">
                <div class="img ">
                  <img src="${cat.strCategoryThumb}" class="w-100" alt="image">
                  <div class="overlay px-2 overflow-hidden d-flex flex-column justify-content-center ">
                   <p class="fs-4 fw-bold" >${cat.strCategory}</p>
                   <p class="number-lines fs-5" >${cat.strCategoryDescription}</p>
                   
                  </div>
                </div>
              </div>
            </div>
    `;
  });
  home.innerHTML = cartaina;
  loader.classList.add("d-none");

  let allCategory = document.querySelectorAll(".card");
  allCategory.forEach((category) => {
    category.addEventListener("click", function (e) {
      let categoryName = e.target.closest(".card").dataset.name;
      console.log(categoryName);
      renderMealsCategory(categoryName);
    });
  });
}

// * =============> renderMealsCategory ===============>

async function renderMealsCategory(catName) {
  loader.classList.remove("d-none");
  let response = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${catName}`
  );
  let { meals } = response;
  let max = meals.splice(0, 20);
  console.log(meals.length);

  let cartaina = renderDesign(max);
  home.innerHTML = cartaina;

  loader.classList.add("d-none");
  let allMeals = document.querySelectorAll(".card");
  allMeals.forEach((catMeal) => {
    catMeal.addEventListener("click", function (e) {
      let idMeals = e.target.closest(".card").dataset.id;

      renderDetails(idMeals);
    });
  });
}
// * =============> render area ===============>

document.getElementById("area").addEventListener("click", function (e) {
  home.classList.add("d-none");
  ingredients.classList.add("d-none");
  contact.classList.add("d-none");
  render_search.classList.add("d-none");
  sideClose();
  Area.classList.remove("d-none");

  console.log("area");
  renderArea();
});

async function renderArea() {
  loader.classList.remove("d-none");
  let { meals } = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/list.php?a=list`
  );
  let cartaina = ``;
  meals.forEach((meal) => {
    cartaina += `
    <div data-name="${meal.strArea}" class=" area col-sm-4 col-md-3 text-center ">
    <i class="fa-solid fa-house-laptop "></i>
    <p>${meal.strArea}</p>
    </div>
    `;
  });
  Area.innerHTML = cartaina;
  loader.classList.add("d-none");
  let allArea = document.querySelectorAll(".area");
  allArea.forEach((area) => {
    area.addEventListener("click", function (e) {
      let countery = e.target.closest(".area").dataset.name;
      insideArea(countery);
      home.classList.toggle("d-none");
      ingredients.classList.toggle("d-none");
      Area.classList.toggle("d-none");
    });
  });
}

async function insideArea(countery) {
  loader.classList.remove("d-none");
  let { meals } = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${countery}`
  );
  let cartaina = renderDesign(meals);
  home.innerHTML = cartaina;
  loader.classList.add("d-none");
  document.querySelectorAll(".card").forEach((card) =>
    card.addEventListener("click", function (e) {
      let idMeals = e.target.closest(".card").dataset.id;

      renderDetails(idMeals);
    })
  );
}
// * =============> render  ingredients ===============>

document.getElementById("ingredients").addEventListener("click", function (e) {
  home.classList.add("d-none");
  Area.classList.add("d-none");
  contact.classList.add("d-none");
  render_search.classList.add("d-none");
  sideClose();
  ingredients.classList.remove("d-none");

  console.log("ingredients");
  renderIngredients();
});

async function renderIngredients() {
  loader.classList.remove("d-none");
  let { meals } = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/list.php?i=list`
  );
  let cartaina = ``;
  meals.forEach((meal) => {
    cartaina += `
    <div data-name="${meal.strIngredient}" class=" ingredient col-sm-4 col-md-3 text-center ">
    <i class="fa-solid fa-drumstick-bite fa-4x"></i>
    <h4>${meal.strIngredient}</h4>
    <p class="number-lines">${meal.strDescription}</p>
    </div>
    `;
  });
  ingredients.innerHTML = cartaina;
  loader.classList.add("d-none");
  let allIngredients = document.querySelectorAll(".ingredient");
  allIngredients.forEach((item) => {
    item.addEventListener("click", function (e) {
      let nameType = e.target.closest(".ingredient").dataset.name;
      console.log(nameType);
      insideIngredients(nameType);
      home.classList.remove("d-none");
      ingredients.classList.add("d-none");
      Area.classList.add("d-none");
    });
  });
}

async function insideIngredients(name) {
  loader.classList.remove("d-none");
  let { meals } = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${name}`
  );
  let cartaina = renderDesign(meals);
  home.innerHTML = cartaina;
  loader.classList.add("d-none");
  document.querySelectorAll(".card").forEach((card) =>
    card.addEventListener("click", function (e) {
      let idMeals = e.target.closest(".card").dataset.id;

      renderDetails(idMeals);
    })
  );
}
// * =============> contact-us ===============>

let AllInputs = document.querySelectorAll("input");

document.getElementById("Contact").addEventListener("click", function (e) {
  home.classList.add("d-none");
  Area.classList.add("d-none");
  ingredients.classList.add("d-none");
  render_search.classList.add("d-none");
  sideClose();
  contact.classList.remove("d-none");
});

document.querySelector("form").addEventListener("input", function (e) {
  e.preventDefault();
  if (
    validation(AllInputs[0], /^\w{2,8}$/, "msgFullName") &&
    validation(
      AllInputs[1],
      /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      "msgEmail"
    ) &&
    validation(AllInputs[2], /^(02)?01(0|1|2|5)[0-9]{8}$/, "msgPhone") &&
    validation(AllInputs[3], /^[1-9][0-9]$/, "msgAge") &&
    validation(
      AllInputs[4],
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      "msgPassword"
    ) &&
    validation(
      AllInputs[5],
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      "msgRepassword"
    ) &&
    configPassword()
  ) {
    document.querySelector(".ok").removeAttribute("disabled");
  } else {
    document.querySelector(".ok").setAttribute("disabled", "true");
  }
});

function configPassword() {
  if (AllInputs[4].value === AllInputs[5].value) {
    document.getElementById("msgRepassword").classList.add("d-none");
    return true;
  } else {
    document.getElementById("msgRepassword").classList.remove("d-none");
    return false;
  }
}
// * =============> Search ===============>
let searchName = document.querySelector(".search .Name");
let searchLetter = document.querySelector(".search .Letter");
document.getElementById("Search").addEventListener("click", function (e) {
  home.classList.add("d-none");
  Area.classList.add("d-none");
  ingredients.classList.add("d-none");
  contact.classList.add("d-none");
  sideClose();
  render_search.classList.remove("d-none");
});

searchName.addEventListener("input", async function (e) {
  let name = searchName.value;
  loader.classList.remove("d-none");
  let { meals } = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
  );
  let cartaina = renderDesign(meals);

  document.querySelector(".data").innerHTML = cartaina;
  loader.classList.add("d-none");
  let allMeals = document.querySelectorAll(".card");
  allMeals.forEach((catMeal) => {
    catMeal.addEventListener("click", function (e) {
      let idMeals = e.target.closest(".card").dataset.id;
      home.classList.remove("d-none");
      render_search.classList.add("d-none");
      renderDetails(idMeals);
    });
  });
});
searchLetter.addEventListener("input", async function (e) {
  loader.classList.remove("d-none");
  let firstLetter = searchLetter.value.split("")[0];
  console.log(firstLetter);
  let { meals } = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/search.php?f=${firstLetter}`
  );
  let cartaina = renderDesign(meals);
  document.querySelector(".data").innerHTML = cartaina;
  loader.classList.add("d-none");
  let allMeals = document.querySelectorAll(".card");
  allMeals.forEach((catMeal) => {
    catMeal.addEventListener("click", function (e) {
      let idMeals = e.target.closest(".card").dataset.id;
      home.classList.remove("d-none");
      render_search.classList.add("d-none");
      renderDetails(idMeals);
    });
  });
});

// * =============> Golable ===============>
function renderDesign(arr) {
  let cartaina = ``;
  arr.forEach((cat) => {
    cartaina += `
    <div class="col-md-3">
              <div data-id="${cat.idMeal}"  class="card  bg-transparent overflow-hidden position-relative">
                <div class="img ">
                  <img src="${cat.strMealThumb}" class="w-100" alt="image">
                  <div class="overlay px-2 overflow-hidden d-flex flex-column justify-content-center ">
                   <p class="fs-4 fw-bold" >${cat.strMeal}</p>
                  
                   
                  </div>
                </div>
              </div>
            </div>
    `;
  });
  return cartaina;
}

async function fetchApi(link) {
  try {
    let api = await fetch(link);
    if (!api.ok) throw new Error("failed to fetch dat");
    let response = await api.json();
    return response;
  } catch (error) {
    console.log(error);
  }
}

function validation(input, reg, msgName) {
  let msg = document.getElementById(`${msgName}`);
  var regEx = new RegExp(reg);
  var text = input.value;
  if (regEx.test(text)) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    msg.classList.add("d-none");

    return true;
  } else {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    msg.classList.remove("d-none");
    return false;
  }
}

