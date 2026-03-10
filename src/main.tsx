import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

// Show splash for at least 2.5s so users can read the quote
const minDelay = new Promise((r) => setTimeout(r, 3500));

minDelay.then(() => {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => splash.remove(), 600);
  }
  root.render(<App />);
});
