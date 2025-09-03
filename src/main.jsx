import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // si usás Tailwind

createRoot(document.getElementById("root")).render(<App />);
