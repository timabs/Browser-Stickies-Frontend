import axios from "axios";
import { checkUID } from "./utils/uid.js";
import { createDropzones } from "./dnd/dropzones.js";
import { addTask, showTasks } from "./tasks/taskHandler.js";
import { handleThemeSwitching } from "./themes.js";
import {
  addCategoryToDom,
  showCategories,
} from "./categories/categoryHandler.js";

export const body = document.getElementById("main-body");
const userInput = document.getElementById("userInput");
export const taskList = document.getElementById("taskList");
const inputPlaceholder = "What do you need to get done?";
const categoryButton = document.getElementById("categoryButton");

export const allCategories = [];
export const generatedListItems = [];
export const allDropdowns = [];
export let allDropzones;
axios.defaults.withCredentials = true;

async function initApp() {
  checkUID();
  await showCategories();
  await showTasks();
  createDropzones(allDropzones, taskList);
  handleThemeSwitching();
  userInput.placeholder = inputPlaceholder;
  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      addTask();
    }
  });
  categoryButton.addEventListener("click", addCategoryToDom);
}

document.addEventListener("DOMContentLoaded", async function () {
  initApp();
});

export function setPlaceholder(text = inputPlaceholder) {
  userInput.placeholder = text;
}

export function getAttributeOrFallback(element, attribute1, attribute2) {
  return element.hasAttribute(attribute1)
    ? element.getAttribute(attribute1)
    : element.getAttribute(attribute2);
}
