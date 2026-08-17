import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://localhost/araw/reactgit/react-section/";

const shortcode = process.argv[2];
const requestedExport = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : null;

if (!shortcode || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(shortcode)) {
  console.error("Usage: pnpm shortcode <name> [export] [--build]");
  console.error("Example: pnpm shortcode gallery HeroDemo1 --build");
  process.exit(1);
}

const root = process.cwd();
const srcDir = path.join(root, "src");
const entryCandidates = [
  "src.tsx", "src.jsx", "App.tsx", "App.jsx", "index.tsx", "index.jsx",
];
const entry = entryCandidates.map((name) => path.join(srcDir, name)).find(fs.existsSync);

if (!entry) {
  console.error("No source entry found in src/.");
  console.error(`Create one of: ${entryCandidates.join(", ")}`);
  process.exit(1);
}

const index = `<div data-msc-shortcode="${shortcode}"></div>\n<script type="module" src="/src/main.jsx"></script>\n`;

const relativeEntry = `./${path.relative(srcDir, entry).split(path.sep).join("/")}`;
const source = fs.readFileSync(entry, "utf8");

// A component file does not have to use `export default`.
// If it has no default export, automatically select the first exported
// PascalCase component (for example HeroDemo1).
function findComponentExport(sourceText) {
  if (/export\s+default\s+/.test(sourceText)) return "default";

  const exportBlock = sourceText.match(/export\s*\{([\s\S]*?)\}/m);
  if (exportBlock) {
    const names = exportBlock[1]
      .split(",")
      .map((part) => part.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);

    const component = names.find((name) => /^[A-Z][A-Za-z0-9_$]*$/.test(name));
    if (component) return component;
    if (names.length) return names[0];
  }

  const declaration = sourceText.match(/export\s+(?:const|function|class)\s+([A-Za-z_$][\w$]*)/);
  if (declaration) return declaration[1];

  return null;
}

const autoExportName = findComponentExport(source);
const exportName = requestedExport || autoExportName;

if (!exportName) {
  console.error(`Could not find a component export in ${path.relative(root, entry)}.`);
  console.error("Use `export default Component` or export a named component such as `export { HeroDemo1 }`.");
  process.exit(1);
}

const mainImport = `import * as Module from "${relativeEntry}";`;
const selectedComponent = `Module[${JSON.stringify(exportName)}]`;

const main = `import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
${mainImport}

const roots = document.querySelectorAll('[data-msc-shortcode="${shortcode}"]');

if (!roots.length) {
  console.warn('No Modular Shortcode roots found for [data-msc-shortcode="${shortcode}"].');
}

if (!${selectedComponent}) {
  throw new Error("The selected component export '${exportName}' was not found.");
}

roots.forEach((root) => {
  createRoot(root).render(
    <React.StrictMode>{React.createElement(${selectedComponent})}</React.StrictMode>
  );
});
`;

fs.writeFileSync(path.join(root, "index.html"), index);
fs.writeFileSync(path.join(srcDir, "main.jsx"), main);

console.log(`Shortcode target configured: ${shortcode}`);
console.log(`Entry: ${path.relative(root, entry)}`);
console.log(`Component export: ${exportName}${requestedExport ? " (requested)" : " (first export automatically selected)"}`);
console.log(`Mount selector: [data-msc-shortcode="${shortcode}"]`);
console.log(`Attribute: data-msc-shortcode="${shortcode}"`);
console.log(`Build output: dist/${shortcode}/app.js + dist/${shortcode}/app.css`);

if (process.argv.includes("--build")) {
  // Each shortcode owns only its own directory inside dist/.
  // Building gallery must never remove testimonial, and vice versa.
  const shortcodeDist = path.join(root, "dist", shortcode);

  if (fs.existsSync(shortcodeDist)) {
    fs.rmSync(shortcodeDist, { recursive: true, force: true });
  }

  execSync("pnpm build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      MSC_SHORTCODE: shortcode,
      MSC_BASE_URL: process.env.MSC_BASE_URL || DEFAULT_BASE_URL,
    },
  });

  // Keep a manifest for every shortcode currently present in dist/.
  // The newly built shortcode is inserted first. Existing shortcode entries
  // are preserved and are not removed when another shortcode is rebuilt.
  const distDir = path.join(root, "dist");
  const baseUrl = (process.env.MSC_BASE_URL || DEFAULT_BASE_URL).replace(/\/?$/, "/");
  const manifestPath = path.join(distDir, "links.json");

  const folders = fs.readdirSync(distDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  const entryFor = (name) => ({
    shortcode: name,
    js: `${baseUrl}dist/${name}/app.js`,
    css: `${baseUrl}dist/${name}/app.css`,
    script: `<script type="module" src="${baseUrl}dist/${name}/app.js"></script>`,
    stylesheet: `<link rel="stylesheet" href="${baseUrl}dist/${name}/app.css">`,
  });

  const manifest = [
    entryFor(shortcode),
    ...folders
      .filter((name) => name !== shortcode)
      .sort()
      .map(entryFor),
  ];

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Links manifest: ${path.relative(root, manifestPath)}`);
}
