const ADMIN_USER = (import.meta.env.VITE_ADMIN_USERNAME as string | undefined) ?? "";
const ADMIN_PASS = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? "";
const KEY = "csc_admin_session";

// Guard every sessionStorage call — it doesn't exist during SSR
const isBrowser = typeof window !== "undefined" && typeof sessionStorage !== "undefined";

export function adminLogin(u: string, p: string): boolean {
  if (u === ADMIN_USER && p === ADMIN_PASS && ADMIN_USER) {
    if (isBrowser) sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout() {
  if (isBrowser) sessionStorage.removeItem(KEY);
}

export function isAdminLoggedIn(): boolean {
  if (!isBrowser) return false; // always show login on SSR
  return sessionStorage.getItem(KEY) === "1";
}
