import * as app from "../app.js";
import { createDropzones, updateDropzones } from "../dnd/dropzones";
import { fetchCategories, httpDelCat, postCategory } from "../http/http";
import { updateDropdown } from "../state/updateState";
import { genListButton, rename } from "../utils/general.js";

const boxContainer = document.querySelector(".boxContainer");

function createCategoryBox(name, categoryID) {
  const categoryExists = app.allCategories.some(
    (category) => category.querySelector("h3").innerText === name
  );
  if (!categoryExists) {
    const newCategory = document.createElement("div"); //make category box
    const categoryDel = genListButton("categoryDel"); //make category delete button
    categoryDel.style.marginTop = 0;

    app.allCategories.push(newCategory);
    newCategory.classList.add("categoryBox");
    newCategory.setAttribute("data-zone", "dropzone"); //add css styling of class to category div
    newCategory.setAttribute("data-category-name", name);
    if (categoryID) {
      newCategory.setAttribute("data-category-id", categoryID);
    }
    newCategory.addEventListener("drop", (e) => {});
    boxContainer.appendChild(newCategory); //add category box to container
    const categoryNameElement = document.createElement("h3");
    categoryNameElement.innerText = name;
    categoryNameElement.setAttribute("data-category", name);
    categoryNameElement.classList.add("categoryName");
    newCategory.appendChild(categoryDel);
    newCategory.appendChild(categoryNameElement);

    categoryNameElement.addEventListener("dblclick", function (e) {
      rename(e.target);
    });

    categoryDel.addEventListener("mouseenter", function (e) {
      categoryDel.classList.remove("hidden");
      categoryDel.addEventListener("click", (e) => {
        deleteCategory(e, app.allCategories);
      });
    });

    categoryDel.addEventListener("mouseleave", function (e) {
      categoryDel.classList.add("hidden");
    });

    updateDropdown(app.allDropdowns);
    createDropzones();
    return newCategory;
  }
}

export function addCategoryToDom() {
  let categoryName;
  const enterName = document.createElement("input"); //make input field
  enterName.setAttribute("id", "categoryInput");
  enterName.placeholder = "Enter category name :)";
  const inputWrapper = document.getElementById("inputFieldWrapper"); //assign input wrapper
  inputWrapper.appendChild(enterName); //add input field to wrapper
  inputWrapper.style.display = "block"; //show input field
  enterName.focus(); //start with focus
  enterName.addEventListener("keydown", async function (e) {
    //if press enter, assign category name
    //hide input wrapper, remove input field
    if (e.key === "Enter") {
      if (enterName.value !== "" && enterName.value !== undefined) {
        categoryName = enterName.value;
        inputWrapper.style.display = "none";
        try {
          const postedCat = await postCategory(categoryName);
          const categoryId = postedCat.data._id;
          const newCategory = createCategoryBox(categoryName, categoryId);
          boxContainer.appendChild(newCategory);
        } catch (error) {
          console.error("Error creating category: ", error);
        }
      } else {
        enterName.placeholder = "We're doing this again?";
        setTimeout(() => {
          enterName.placeholder = "Enter category name :)";
        }, 1000);
      }
    } else if (e.key === "Escape") {
      inputWrapper.style.display = "none";
    }
  });
  enterName.addEventListener("focusout", (e) => {
    inputWrapper.style.display = "none";
    inputWrapper.removeChild(enterName);
  });
}

async function deleteCategory(e, arr) {
  e.stopPropagation();
  const delButton = e.target;
  const parentElem = delButton.parentNode;
  const index = arr.indexOf(parentElem);
  if (index !== -1) {
    arr.splice(index, 1);
  }

  try {
    if (parentElem.tagName === "DIV") {
      //if the item to delete is a WHOLE CATEGORY/BOX
      const categoryId = parentElem.getAttribute("data-category-id");
      await httpDelCat(categoryId);
      parentElem.remove();
    }
  } catch (error) {
    console.log(`Error deleting: ${error}`);
  }
  updateDropdown(allDropdowns);
}

export async function showCategories() {
  try {
    const existingCategories = await fetchCategories();
    existingCategories.forEach((category) => {
      boxContainer.appendChild(createCategoryBox(category.name, category._id));
    });
    app.allDropzones = updateDropzones();
  } catch (error) {
    console.error("Error fetching existing categories: ", error);
  }
}
