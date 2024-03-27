import axios from "axios";
const apiURL = "https://sticky-notes-0fbt.onrender.com";
//const tempAPI = "http://localhost:5000";

const api = axios.create({
  baseURL: apiURL,
  headers: {
    "X-User-Id": localStorage.getItem("userId"),
  },
});
//tasks
export async function fetchTasks() {
  try {
    const response = await api.get(`/api/v1/theTasks`);
    return response.data.myTasks;
  } catch (error) {
    console.log(error);
  }
}

export async function postTask(taskContent) {
  try {
    const response = await api.post(`/api/v1/theTasks`, {
      content: taskContent,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteTask(taskId) {
  try {
    await api.delete(`/api/v1/theTasks/${taskId}`);
  } catch (error) {
    console.log(error);
  }
}

export async function patchTask(taskId, category) {
  try {
    await api.patch(`/api/v1/theTasks/${taskId}`, {
      category: category,
    });
  } catch (error) {
    console.log(error);
  }
}

//categories
export async function fetchCategories() {
  try {
    const response = await api.get(`/api/v1/theCategories`);
    return response.data.categories;
  } catch (error) {
    console.log(error);
  }
}

export async function postCategory(catName) {
  try {
    const response = await api.post(`/api/v1/theCategories/`, {
      name: catName,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function httpDelCat(catId) {
  try {
    await api.delete(`/api/v1/theCategories/${catId}`);
  } catch (error) {
    console.log(error);
  }
}

export async function httpPatchCat(catId, newCatName) {
  try {
    api.patch(`/api/v1/theCategories/${catId}`, {
      name: newCatName,
    });
  } catch (error) {
    console.log(error);
  }
}
