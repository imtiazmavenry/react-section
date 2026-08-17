import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import * as Module from "./src.tsx";

const roots = document.querySelectorAll('[data-msc-shortcode="block1"]');

if (!roots.length) {
  console.warn('No Modular Shortcode roots found for [data-msc-shortcode="block1"].');
}

if (!Module["default"]) {
  throw new Error("The selected component export 'default' was not found.");
}

roots.forEach((root) => {
  createRoot(root).render(
    <React.StrictMode>{React.createElement(Module["default"])}</React.StrictMode>
  );
});
