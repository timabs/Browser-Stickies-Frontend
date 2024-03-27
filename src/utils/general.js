import { allDropdowns } from "../app";
import { httpPatchCat } from "../http/http";
import { updateDropdown } from "../state/updateState";

export function rename(element) {
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
export function saveChanges(element, attrToChange) {
  element.contentEditable = false;
  let newValue = element.textContent.trim();
  element.setAttribute(attrToChange, newValue);
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
