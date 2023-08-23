//next time, try to modularize from the start lol
const bodyBoy = document.getElementById("bodyBoy");
const userInput = document.getElementById("userInput");
const taskList = document.getElementById("taskList");
const inputPlaceholder = "What do you need to get done?";
const categoryButton = document.getElementById("categoryButton");
const boxContainer = document.querySelector(".boxContainer");
const allCategories = [];
const generatedListItems = [];
const generatedCategoryItems = [];
const completedItems = [];
const allDropdowns = [];
const categoryColors = ["#FF5733", "#33FF57", "#5733FF"];
let allDropzones;
const apiURL = "https://api.stickynotes.lol";
axios.defaults.withCredentials = true;

document.addEventListener("DOMContentLoaded", async function () {
  await showCategories();
  await showTasks();
  createDropzones();
});

function createDropzones() {
  allDropzones = updateDropzones();

  const dzArray = Array.from(allDropzones);

  dzArray.forEach((dropzone, index) => {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-target");
    });
    dropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-target");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      const sourceTaskID = e.dataTransfer.getData("text/plain");
      const sourceListItem = document.querySelector(".dragging");

      if (dropzone.id === "listContainer") {
        sourceListItem.classList.remove("categoryItem");
        sourceListItem.classList.add("listItem");
        dropzone.classList.remove("drag-target");

        const afterElem = getDragAfterElement(dropzone, e.clientY); //e.clientY -> y pos of mouse on screen
        if (afterElem === null) {
          taskList.appendChild(sourceListItem);
        } else {
          taskList.insertBefore(sourceListItem, afterElem);
        }
        axios.patch(`${apiURL}/api/v1/theTasks/${sourceTaskID}`, {
          category: "",
        });
      } else {
        dropzone.classList.remove("drag-target");
        sourceListItem.classList.remove("listItem");
        sourceListItem.classList.add("categoryItem");
        const afterElem = getDragAfterElement(dropzone, e.clientY); //e.clientY -> y pos of mouse on screen
        if (afterElem === null) {
          dropzone.appendChild(sourceListItem);
        } else {
          dropzone.insertBefore(sourceListItem, afterElem);
        }

        const newCategoryName = dropzone.getAttribute("data-category-name");
        axios.patch(`${apiURL}/api/v1/theTasks/${sourceTaskID}`, {
          category: newCategoryName,
        });
      }
    });
  });
}

function updateDropzones() {
  return document.querySelectorAll('[data-zone="dropzone"]');
}

function debounce(func, delay) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

function getDragAfterElement(dropzone, y) {
  const draggables = [
    ...dropzone.querySelectorAll(".draggable:not(.dragging)"),
  ]; //gets all draggables in container except the one being dragged

  return draggables.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

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
    bodyBoy.className = savedTheme;
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
          bodyBoy.removeAttribute("class");
          setThemeInLocalStorage(themeClass);
        } else {
          bodyBoy.className = themeClass;
          setThemeInLocalStorage(themeClass);
        }
      }
    });
  });
}
handleThemeSwitching();

async function showTasks() {
  try {
    const response = await axios.get(`${apiURL}/api/v1/theTasks`); // Fetch existing tasks from the server

    const existingTasks = response.data;

    existingTasks.myTasks.forEach((task) => {
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

    updateCompletedCount();
  } catch (error) {
    // Update completed count after adding existing tasks
    console.error("Error fetching existing tasks: ", error);
  }
}
async function showCategories() {
  try {
    const response = await axios.get(`${apiURL}/api/v1/theCategories`);
    const existingCategories = response.data;
    existingCategories.categories.forEach((category) => {
      boxContainer.appendChild(createCategoryBox(category.name, category._id));
    });
    allDropzones = updateDropzones();
  } catch (error) {
    console.error("Error fetching existing tasks: ", error);
  }
}
userInput.placeholder = inputPlaceholder;
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

categoryButton.addEventListener("click", addCategoryToDom);
// categoryButton.addEventListener('keydown', (e)=> {
//     if(e.key === "escape") {

//     }
// });

async function addTask() {
  try {
    if (userInput.value === "" || userInput.value === undefined) {
      userInput.placeholder = "It can't be empty bozo.";
    } else {
      const content = userInput.value;
      //dont append all at once
      const response = await axios.post(`${apiURL}/api/v1/theTasks`, {
        content,
      });
      const myTask = response.data;
      const listItem = createListItem(
        content,
        myTask._id,
        "listItem",
        "data-task-id"
      );
      taskList.appendChild(listItem);

      console.log("Response:", response);
      userInput.value = "";
      setTimeout(() => {
        userInput.placeholder = inputPlaceholder;
      }, 1000);
    }
  } catch (error) {
    console.error("Error creating task: ", error);
  }
}
const createListItem = (content, taskID, itemClass, dataAttr) => {
  let listItem = document.createElement("li");
  listItem.classList.add(itemClass);
  if (taskID) {
    listItem.setAttribute(dataAttr, taskID);
  }
  listItem.setAttribute("draggable", true);

  listItem.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", taskID);
    listItem.classList.add("dragging");

    e.dataTransfer.setDragImage(listItem, 100, 0);
  });

  listItem.addEventListener("dragend", () => {
    listItem.classList.remove("dragging");
  });

  listItem.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  let newSpan = listItem.appendChild(createSpan(content));

  let newDel = listItem.appendChild(genListButton("delete"));
  newDel.addEventListener("click", (e) => {
    deleteItem(e, generatedListItems);
  });

  let newPlus = listItem.appendChild(genListButton("plus"));
  let newDropdown = createDropdown();
  newPlus.insertAdjacentElement("afterend", newDropdown);
  generatedListItems.push(listItem);

  newPlus.addEventListener("click", (e) => {
    e.stopPropagation();
    openDropdown(e, newDropdown);
    updateDropdown(allDropdowns);
  });

  // listItem.addEventListener("mouseenter", () => {
  //   makeVisible(newPlus);
  //   makeVisible(newDel);
  // });
  // listItem.addEventListener("mouseleave", () => {
  //   makeHidden(newPlus);
  //   makeHidden(newDel);
  // });
  listItem.addEventListener("click", (e) => {
    listItem.classList.add("completed");
    // makeHidden();
    setTimeout(() => {
      completedItems.push(listItem);
      listItem.remove();
      const index = generatedListItems.indexOf(listItem);
      if (index !== -1) {
        generatedListItems.splice(index, 1);
      }
      updateCompletedCount();
    }, 1000);
  });
  return listItem;
};

function createSpan(text) {
  let newSpan = document.createElement("span");
  newSpan.classList.add("itemSpan");
  newSpan.innerText = text;
  return newSpan;
}

function makeVisible(element) {
  setTimeout(() => {
    // First, change the display property to "flex"
    element.style.display = "flex";
  }, 200);
}
function makeHidden(element) {
  element.style.display = "none";
  // let toMakeHidden = document.getElementsByClassName("listHidden");
  // const elementsArray = Array.from(toMakeHidden);
  // elementsArray.forEach((item) => {
  //
  // });
}

const createDropdown = () => {
  let label = document.createElement("label");
  label.innerText = "Choose a category";
  label.setAttribute("class", "labelStyle");
  label.style.display = "none";

  let select = document.createElement("select");
  select.classList.add("selectCategory");
  select.style.display = "none";

  let initialOption = document.createElement("option");
  initialOption.textContent = "Select a category";
  select.appendChild(initialOption);

  label.appendChild(select);

  allDropdowns.push(select);

  select.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  select.addEventListener("change", addsItem);
  return label;
};

const openDropdown = (e, dropdown) => {
  if (dropdown.style.display === "none" || dropdown.style.display === "") {
    dropdown.style.transition = "opacity ease-in-out 0.3s";
    dropdown.style.opacity = "1";
    setTimeout(() => {
      dropdown.style.display = "grid";
    });
    dropdown.querySelector(".selectCategory").style.display = "block";
  } else {
    dropdown.style.transition = "display ease-in-out 0.3s";
    dropdown.style.opacity = "0";
    setTimeout(() => {
      dropdown.style.display = "none";
    });
  }
  e.stopPropagation();

  const select = dropdown.querySelector(".selectCategory");
  //select.style.display = dropdown.style.display === 'grid' ? 'block' : 'none';

  if (dropdown.style.display === "grid") {
    // Add a short delay to set the display property of the select element to 'block'
    setTimeout(() => {
      select.style.display = "block";
    }, 100);
  }
};

const updateDropdown = (dropdowns) => {
  const addedOptions = new Set();
  dropdowns.forEach((dropdown) => {
    dropdown.innerHTML = "";

    //add initialoption to each dropdown
    const initialOption = document.createElement("option");
    initialOption.textContent = "Select a category";
    dropdown.appendChild(initialOption);
  });

  allCategories.forEach((category) => {
    const categoryText = category.querySelector("h3").innerText;
    if (!addedOptions.has(categoryText)) {
      addedOptions.add(categoryText);

      // Create a new option element for each category
      const option = document.createElement("option");
      option.innerText = categoryText;

      // Add the option to each dropdown
      dropdowns.forEach((dropdown) => {
        const optionClone = option.cloneNode(true);
        dropdown.appendChild(optionClone);
      });
    }
  });
};

function getAttributeOrFallback(element, attribute1, attribute2) {
  return element.hasAttribute(attribute1)
    ? element.getAttribute(attribute1)
    : element.getAttribute(attribute2);
}

async function addsItem(e) {
  let listItem = e.target.closest("li");
  const taskID = getAttributeOrFallback(
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
    taskID,
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
  try {
    const response = await axios.patch(`${apiURL}api/v1/theTasks/${taskID}`, {
      category: optionText,
    });
  } catch (error) {
    console.log(`Error updating task category: ${error}`);
  }

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
      const taskID = parentListItem.getAttribute("data-catitem-id");
      console.log(taskID);
      parentListItem.remove();
      await axios.delete(`${apiURL}/api/v1/theTasks/${taskID}`);
    } else {
      const taskID = parentListItem.getAttribute("data-task-id");
      await axios.delete(`${apiURL}/api/v1/theTasks/${taskID}`);
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
      const categoryID = parentElem.getAttribute("data-category-id");
      await axios.delete(`${apiURL}/api/v1/theCategories/${categoryID}`);
      parentElem.remove();
    }
  } catch (error) {
    console.log(`Error deleting: ${error}`);
  }
  updateDropdown(allDropdowns);
}

function genListButton(type) {
  if (type === "delete") {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    // deleteButton.classList.add("listHidden");
    return deleteButton;
  } else if (type === "plus") {
    const plusButton = document.createElement("button");
    plusButton.classList.add("plus-button");
    // plusButton.classList.add("listHidden");
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

function getRandomColorClass() {
  const colorClasses = ["pink", "orange", "yellow"]; // List of color class names
  const randomIndex = Math.floor(Math.random() * colorClasses.length);
  return colorClasses[randomIndex];
}

function rename(element) {
  element.contentEditable = true;
  element.focus();

  element.addEventListener("blur", () => {
    const elementParent = element.parentNode;
    saveChanges(element, "data-category");
    saveChanges(elementParent, "data-category-name");
  });

  element.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const elementParent = element.parentNode;
      saveChanges(element, "data-category");
      saveChanges(elementParent, "data-category-name");
      const newCatName = elementParent.getAttribute("data-category-name");
      const categoryID = elementParent.getAttribute("data-category-id");
      axios.patch(`${apiURL}/api/v1/theCategories/${categoryID}`, {
        name: newCatName,
      });
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
        //inputWrapper.removeChild(enterName);
        try {
          const response = await axios.post(`${apiURL}/api/v1/theCategories/`, {
            name: categoryName,
          });
          console.log(response);
          const categoryID = response.data.data._id;
          const newCategory = createCategoryBox(categoryName, categoryID);
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
//customization options?
//sounds for completing tasks, anim/sound for completing a category of at least 5?

/*learn something for backend -> put into database to save users lists
when they come back - attach to accounts? (sign in)
database/backend
*/
function updateCompletedCount() {
  const completedCount = document.getElementById("completedCount");
  completedCount.textContent = completedItems.length.toString();
}
