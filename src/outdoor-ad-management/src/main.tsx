import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "Inter, 'Noto Sans JP', sans-serif",
            borderRadius: 8,
            border: "1px solid oklch(92.6% 0.005 262)",
          },
        }}
      />
    </HashRouter>
  </StrictMode>,
);
