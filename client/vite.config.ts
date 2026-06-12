import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base: works served directly from :4820 AND behind a proxy prefix.
  // Was "/dashboard/" (Ubuntu Nginx era), which 404'd all assets when the
  // server is hit directly on Windows (no Nginx in front).
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4820",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:4820",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
