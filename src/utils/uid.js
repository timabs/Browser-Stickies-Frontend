import { v4 as genNewUID } from "uuid";

export function checkUID() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = genNewUID();
    localStorage.setItem("userId", userId);
  }
}
