import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
  },
  css: {
    postcss: "./postcss.config.js",
  },
  esbuild: {
    // Treat .jsx files as tsx so esbuild handles TypeScript syntax in shadcn ui components
    jsx: "automatic",
    loader: "tsx",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: "globalThis" },
      loader: { ".js": "jsx", ".jsx": "jsx" },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
