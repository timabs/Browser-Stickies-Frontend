import { patchTask } from "../http/http";

export function createDropzones(allDropzones, taskList) {
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
      handleDrop(e, taskList, dropzone);
    });
  });
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

function handleDrop(e, taskList, dropzone) {
  e.preventDefault();
  const sourceTaskId = e.dataTransfer.getData("text/plain");
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
    patchTask(sourceTaskId, "");
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
    patchTask(sourceTaskId, newCategoryName);
  }
}

export function updateDropzones() {
  return document.querySelectorAll('[data-zone="dropzone"]');
}
