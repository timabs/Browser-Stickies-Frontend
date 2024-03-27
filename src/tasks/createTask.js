import * as app from "../app.js";
import { deleteTask } from "../http/http.js";
import { updateCompletedCount, updateDropdown } from "../state/updateState.js";
import debounce from "../utils/debounce.js";

function createSpan(text) {
  let newSpan = document.createElement("span");
  newSpan.classList.add("itemSpan");
  newSpan.innerText = text;
  return newSpan;
}

const createListItem = (content, taskID, itemClass, dataAttr) => {
  const debouncedCounter = debounce(updateCompletedCount, 1000);
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

  listItem.appendChild(createSpan(content));

  let newDel = listItem.appendChild(app.genListButton("delete"));
  newDel.addEventListener("click", (e) => {
    deleteItem(e, app.generatedListItems);
  });

  let newPlus = listItem.appendChild(app.genListButton("plus"));
  let newDropdown = createDropdown();
  newPlus.insertAdjacentElement("afterend", newDropdown);
  app.generatedListItems.push(listItem);

  newPlus.addEventListener("click", (e) => {
    e.stopPropagation();
    openDropdown(e, newDropdown);
    updateDropdown(app.allDropdowns);
  });
  //complete item
  listItem.addEventListener("click", async (e) => {
    debouncedCounter();
    listItem.classList.add("completed");
    const taskId = app.getAttributeOrFallback(
      listItem,
      "data-task-id",
      "data-catitem-id"
    );

    setTimeout(() => {
      listItem.remove();
      const index = app.generatedListItems.indexOf(listItem);
      if (index !== -1) {
        app.generatedListItems.splice(index, 1);
      }
    }, 1000);

    await deleteTask(taskId);
  });
  return listItem;
};

function createDropdown() {
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

  app.allDropdowns.push(select);

  select.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  select.addEventListener("change", app.addItemToCategory);
  return label;
}

function openDropdown(e, dropdown) {
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

  if (dropdown.style.display === "grid") {
    setTimeout(() => {
      select.style.display = "block";
    }, 100);
  }
}
export { createListItem, createSpan, createDropdown, openDropdown };
