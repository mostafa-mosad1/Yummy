/// <reference types="../@types/jquery" />
const home = document.querySelector(".home .row");
const loader = document.querySelector(".loading");
const allCard = document.querySelectorAll(".card");

// $(". ")

// nav
$(".open").on("click", function (e) {
  $(".nav-links").animate({ width: "250px" }, 1000, function () {
    $(".links ul").addClass("animate__fadeInBottomLeft");
    $(".links ul").removeClass("d-none");
  });

  $(".open").addClass("d-none");
  $(".exit").removeClass("d-none");
});
$(".exit").on("click", function (e) {
  $(".nav-links").animate({ width: "0px" }, 1000, function () {
    $(".links ul").removeClass("animate__fadeInBottomLeft");
    $(".links ul").addClass("d-none");
  });
  $(".exit").addClass("d-none");
  $(".open").removeClass("d-none");
});

// ***********  renderHome
// loader.classList.remove("d-none");

async function renderHome() {
  let data = await fetchApi(
    "https://www.themealdb.com/api/json/v1/1/search.php?s="
  );
  let { meals } = data;
  let cartain = "";
  meals.forEach((meal) => {
    cartain += `
            <div class="col-md-3">
              <div data-name="${meal.strMeal}"  class="card  overflow-hidden position-relative">
                <div class="img bg-danger">
                  <img src="${meal.strMealThumb}" class="w-100" alt="image">
                  <div class="overlay fs-4 fw-bold ps-2 ">
                   ${meal.strMeal}
                  </div>
                </div>
              </div>
            </div>
          `;
  });
  home.innerHTML = cartain;

  const allCard = document.querySelectorAll(".card");
  allCard.forEach(function (card) {
    card.addEventListener("click", function (e) {
      console.log("hello");
      let cardName = e.target.closest(".card").dataset.name;

      console.log(cardName);
      home.classList.add("d-none");
      renderDetails(cardName);
    });
  });
}

renderHome();
// setTimeout(function(){
//     loader.classList.add("d-none");
// },1000)

// ***********  renderCategory

async function renderDetails(name) {
  let data = await fetchApi(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
  );
  let { meals } = data;

  let tagApi = ``;
  let allTags = meals[0].strTags?.split(",") ?? [];
  allTags.forEach((tag) => {
    tagApi += ` <p class="p-2 ms-2  rounded">${tag}</p>`;
  });

  let counter = ``;
  for (let index = 0; index < 20; index++) {
    if (meals[0][`strIngredient${index}`] != ""&& meals[0][`strIngredient${index}`] != undefined) {
      counter += ` <p class="p-2 counter rounded rounded-1 me-2">${
        (meals[0][`strIngredient${index}`], meals[0][`strMeasure${index}`])
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

  document.querySelector(".details").innerHTML = cartaina;
}

// ****************************************
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

function validation(input, reg) {
  var regEx = reg;
  var text = input.value;
  console.log(text);
  if (regEx.test(text)) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  } else {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    return false;
  }
}

/*
slideBar
$(window).on("scroll", function () {
  if (245 < Math.floor($(window).scrollTop())) {
    $(".open").css("display", "none");
  } else {
    $(".open").css("display", "block");
  }
}); 
*/
