import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import * as Module from "./src.tsx";

const roots = document.querySelectorAll('[data-msc-shortcode="gallery"]');

if (!roots.length) {
  console.warn('No Modular Shortcode roots found for [data-msc-shortcode="gallery"].');
}

if (!Module["HeroDemo2"]) {
  throw new Error("The selected component export 'HeroDemo2' was not found.");
}

roots.forEach((root) => {
  createRoot(root).render(
    <React.StrictMode>{React.createElement(Module["HeroDemo2"])}</React.StrictMode>
  );
});
