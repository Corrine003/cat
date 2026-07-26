import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import DeepSeekConsole from "./DeepSeekConsole";
import "./styles.css";

const Root = window.location.pathname.startsWith("/deepseek") ? DeepSeekConsole : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
