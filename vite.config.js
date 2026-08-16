import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shortcode = process.env.MSC_SHORTCODE || "shortcode";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `${shortcode}.js`,
        chunkFileNames: `${shortcode}-[name].js`,
        assetFileNames: (assetInfo) => {
          const ext = path.extname(assetInfo.name || "").toLowerCase();
          if (ext === ".css") return `${shortcode}.css`;
          return `${shortcode}-[name][extname]`;
        },
      },
    },
  },
});
