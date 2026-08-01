import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFontScale } from "./hooks/useFontScale";

initFontScale();

createRoot(document.getElementById("root")!).render(<App />);

