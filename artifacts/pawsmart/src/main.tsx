import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Override fetch to include demo user header
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const email = localStorage.getItem("pawsmart-demo-user") || "guest@pawsmart.pk";
  const headers = new Headers(init?.headers);
  headers.set("x-demo-user", email);
  
  return originalFetch(input, {
    ...init,
    headers,
  });
};

createRoot(document.getElementById("root")!).render(<App />);
