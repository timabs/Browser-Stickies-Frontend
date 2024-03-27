import { v4 } from "uuid";

export function genNewUID() {
  v4();
}

export function checkUID() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = genNewUID();
    localStorage.setItem("userId", userId);
  }
}