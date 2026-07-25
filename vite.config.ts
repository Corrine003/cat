import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/generate-cat-image": {
        target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: () => "/.netlify/functions/generate-cat-image",
      },
    },
  },
});
