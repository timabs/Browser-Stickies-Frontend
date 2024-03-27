import { body } from "./app";

export function handleThemeSwitching() {
  const themeSwitches = document.querySelectorAll(".theme-switch");

  function setThemeInLocalStorage(theme) {
    localStorage.setItem("selectedTheme", theme);
  }

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
