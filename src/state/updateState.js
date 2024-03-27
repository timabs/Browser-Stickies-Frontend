import { allCategories } from "../app.js";
let completedItemsCount = 0;
export const updateDropdown = (dropdowns) => {
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

export function updateCompletedCount() {
  completedItemsCount++;
  const completedCountDiv = document.getElementById("completedCount");
  localStorage.setItem("totalCompletedCount", completedItemsCount);
  completedCountDiv.textContent = localStorage
    .getItem("totalCompletedCount")
    .toString();
}
