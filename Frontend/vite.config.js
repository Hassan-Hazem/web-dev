import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate unique hashes for assets to prevent cache issues
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Ensure consistent builds
    assetsInlineLimit: 0,
    cssCodeSplit: true,
  },
});
