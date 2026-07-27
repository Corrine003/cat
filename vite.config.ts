import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const deepSeekProxyTarget = process.env.DEEPSEEK_PROXY_TARGET || "http://localhost:9998";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/generate-cat-image": {
        target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: () => "/.netlify/functions/generate-cat-image",
      },
      "/api/deepseek-chat": {
        target: deepSeekProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
