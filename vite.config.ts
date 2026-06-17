import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, "newtab.html"),
        background: resolve(__dirname, "src/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // background.ts는 background.js로 출력
          return chunkInfo.name === "background" ? "background.js" : "assets/[name]-[hash].js";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    open: "/newtab.html",
  },
});
