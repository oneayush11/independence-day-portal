import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend runs on 5173 (Vite default).
// Backend runs on 5001 (as requested, since 5000 was busy).
// /api calls from the frontend are proxied to the backend during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
