import { create } from "zustand";

type UserRole = "guest" | "admin";

interface AuthState {
  userEmail: string;
  role: UserRole;
  setUser: (email: string) => void;
}

const GUEST_EMAIL = "guest@pawsmart.pk";
const ADMIN_EMAIL = "admin@pawsmart.pk";

// Get initial from local storage or default to guest
const getInitialEmail = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pawsmart-demo-user") || GUEST_EMAIL;
  }
  return GUEST_EMAIL;
};

export const useAuth = create<AuthState>((set) => ({
  userEmail: getInitialEmail(),
  role: getInitialEmail() === ADMIN_EMAIL ? "admin" : "guest",
  setUser: (email: string) => {
    localStorage.setItem("pawsmart-demo-user", email);
    set({ userEmail: email, role: email === ADMIN_EMAIL ? "admin" : "guest" });
    // Reload to reset queries with new headers
    window.location.reload();
  },
}));
