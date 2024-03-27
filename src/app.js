import {
  deleteTask,
  fetchCategories,
  fetchTasks,
  httpDelCat,
  httpPatchCat,
  patchTask,
  postCategory,
  postTask,
} from "./http/http.js";
import axios from "axios";
import { checkUID } from "./uid.js";
import { createDropzones, updateDropzones } from "./dnd/dropzones.js";
import { createListItem } from "./tasks/createTask.js";
import { updateDropdown } from "./state/updateState.js";

const body = document.getElementById("main-body");
const userInput = document.getElementById("userInput");
const taskList = document.getElementById("taskList");
const inputPlaceholder = "What do you need to get done?";
const categoryButton = document.getElementById("categoryButton");
const boxContainer = document.querySelector(".boxContainer");
export const allCategories = [];
export const generatedListItems = [];
const generatedCategoryItems = [];
export const allDropdowns = [];
let allDropzones;
axios.defaults.withCredentials = true;

document.addEventListener("DOMContentLoaded", async function () {
  checkUID();
  await showCategories();
  await showTasks();
  createDropzones(allDropzones, taskList);
});

function handleThemeSwitching() {
  const themeSwitches = document.querySelectorAll(".theme-switch");

  function setThemeInLocalStorage(theme) {
    localStorage.setItem("selectedTheme", theme);
  }

  // Function to get the theme from local storage
  function getThemeFromLocalStorage() {
    return localStorage.getItem("selectedTheme");
  }

  const savedTheme = getThemeFromLocalStorage();
  if (savedTheme) {
    body.className = savedTheme;
    const correspondingSwitch = document.querySelector(
      `[data-theme="${savedTheme}"]`
    );
    if (correspondingSwitch) {
      correspondingSwitch.checked = true;
    }
  }

  themeSwitches.forEach((themeSwitch) => {
    themeSwitch.addEventListener("change", () => {
      if (themeSwitch.checked) {
        const themeClass = themeSwitch.getAttribute("data-theme");
        if (themeClass === "theme-light") {
          body.removeAttribute("class");
          setThemeInLocalStorage(themeClass);
        } else {
          body.className = themeClass;
          setThemeInLocalStorage(themeClass);
        }
      }
    });
  });
}
handleThemeSwitching();

async function showTasks() {
  try {
    const existingTasks = await fetchTasks();

    existingTasks.forEach((task) => {
      if (!task.category) {
        taskList.appendChild(
          createListItem(task.content, task._id, "listItem", "data-task-id")
        );
      } else if (task.category) {
        const itemsCategory = task.category;

        const categoryToMatch = document.querySelector(
          `.categoryBox[data-category-name="${itemsCategory}"]`
        );

        categoryToMatch.appendChild(
          createListItem(
            task.content,
            task._id,
            "categoryItem",
            "data-catitem-id"
          )
        );
      }
    });
  } catch (error) {
    // Update completed count after adding existing tasks
    console.error("Error fetching existing tasks: ", error);
  }
}
async function showCategories() {
  try {
    const existingCategories = await fetchCategories();
    existingCategories.forEach((category) => {
      boxContainer.appendChild(createCategoryBox(category.name, category._id));
    });
    allDropzones = updateDropzones();
  } catch (error) {
    console.error("Error fetching existing categories: ", error);
  }
}
userInput.placeholder = inputPlaceholder;
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

categoryButton.addEventListener("click", addCategoryToDom);

async function addTask() {
  try {
    if (userInput.value === "" || userInput.value === undefined) {
      userInput.placeholder = "It can't be empty.";
    } else {
      const content = userInput.value;
      const myTask = postTask(content);
      const listItem = createListItem(
        content,
        myTask._id,
        "listItem",
        "data-task-id"
      );
      taskList.appendChild(listItem);

      userInput.value = "";
      setTimeout(() => {
        userInput.placeholder = inputPlaceholder;
      }, 1000);
    }
  } catch (error) {
    console.error("Error creating task: ", error);
  }
}

export function getAttributeOrFallback(element, attribute1, attribute2) {
  return element.hasAttribute(attribute1)
    ? element.getAttribute(attribute1)
    : element.getAttribute(attribute2);
}

export async function addItemToCategory(e) {
  let listItem = e.target.closest("li");
  const taskId = getAttributeOrFallback(
    listItem,
    "data-task-id",
    "data-catitem-id"
  );

  let optionText = e.target.value;

  let listItemText = listItem
    .querySelector(".itemSpan")
    .childNodes[0].textContent.trim(); // Get the text of the listItem

  let categoryItem = createListItem(
    listItemText,
    taskId,
    "categoryItem",
    "data-catitem-id"
  );

  let selectedCategory = document.querySelector(
    `.categoryBox h3[data-category="${optionText}"]`
  );
  if (selectedCategory) {
    selectedCategory.parentElement.appendChild(categoryItem);
  }
  generatedCategoryItems.push(categoryItem);
  patchTask(taskId, optionText);
  listItem.remove();
}

async function deleteItem(e, arr) {
  e.stopPropagation();
  const delButton = e.target;
  const parentListItem = delButton.parentNode;
  const index = arr.indexOf(parentListItem);
  if (index !== -1) {
    arr.splice(index, 1);
  }
  try {
    if (parentListItem.classList.contains("categoryItem")) {
      const taskId = parentListItem.getAttribute("data-catitem-id");
      parentListItem.remove();
      await deleteTask(taskId);
    } else {
      const taskId = parentListItem.getAttribute("data-task-id");
      await deleteTask(taskId);
      parentListItem.remove();
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
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

export function genListButton(type) {
  if (type === "delete") {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    return deleteButton;
  } else if (type === "plus") {
    const plusButton = document.createElement("button");
    plusButton.classList.add("plus-button");
    plusButton.setAttribute("data-has-dropdown", "false");

    return plusButton;
  } else if (type === "categoryDel") {
    const categoryDel = document.createElement("button");
    categoryDel.classList.add("category-delete");
    categoryDel.classList.add("hidden");
    return categoryDel;
  } else {
    throw "Type must be defined!";
  }
}

function createCategoryBox(name, categoryID) {
  const categoryExists = allCategories.some(
    (category) => category.querySelector("h3").innerText === name
  );
  if (!categoryExists) {
    const newCategory = document.createElement("div"); //make category box
    const categoryDel = genListButton("categoryDel"); //make category delete button
    categoryDel.style.marginTop = 0;

    allCategories.push(newCategory);
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
        deleteCategory(e, allCategories);
      });
    });

    categoryDel.addEventListener("mouseleave", function (e) {
      categoryDel.classList.add("hidden");
    });

    updateDropdown(allDropdowns);
    createDropzones();
    return newCategory;
  }
}

function rename(element) {
  element.contentEditable = true;
  element.focus();

  element.addEventListener("blur", () => {
    const newValue = element.textContent.trim();
    if (newValue !== "") {
      const elementParent = element.parentNode;
      saveChanges(element, "data-category");
      saveChanges(elementParent, "data-category-name");
    }
  });

  element.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const newValue = element.textContent.trim();
      if (newValue !== "") {
        const elementParent = element.parentNode;
        saveChanges(element, "data-category");
        saveChanges(elementParent, "data-category-name");
        const newCatName = elementParent.getAttribute("data-category-name");
        const catId = elementParent.getAttribute("data-category-id");
        await httpPatchCat(catId, newCatName);
      }
    }
  });
}
function saveChanges(element, attrToChange) {
  element.contentEditable = false;
  let newValue = element.textContent.trim();
  element.setAttribute(attrToChange, newValue);
  updateDropdown(allDropdowns);
}

function addCategoryToDom() {
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
        }, 2000);
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
