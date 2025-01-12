import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import "./index.css";
import "@/assets/poppins-font/index.css";
import GlobalProvider from "./global-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalProvider>
      <App />
    </GlobalProvider>
  </React.StrictMode>,
);
