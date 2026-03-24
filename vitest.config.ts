import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  test: {
    globals: true,
    reporters: ["verbose"],
    clearMocks: true,
    restoreMocks: true,
    environmentMatchGlobs: [
      ["tests/components/**", "jsdom"],
      ["tests/unit/**", "node"],
      ["tests/api/**", "node"],
    ],
    setupFiles: ["tests/setup.server.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    },
  },
});
