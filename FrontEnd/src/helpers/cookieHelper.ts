import Cookies from "js-cookie";

export function getThemeIdFromCookie() {
  const raw = Cookies.get("themeCookie");

  if (!raw) {
    return null; // means: use default theme (1)
  }

  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
