import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    reporters: ["verbose"],
    clearMocks: true,
    restoreMocks: true,
  },
  projects: [
    {
      test: {
        name: "server",
        environment: "node",
        include: ["tests/unit/**/*.test.ts", "tests/api/**/*.test.ts"],
        setupFiles: ["tests/setup.server.ts"],
        alias: {
          "@shared": path.resolve(import.meta.dirname, "shared"),
        },
      },
    },
    {
      test: {
        name: "components",
        environment: "jsdom",
        include: ["tests/components/**/*.test.tsx", "tests/components/**/*.test.ts"],
        setupFiles: ["tests/setup.client.ts"],
        alias: {
          "@": path.resolve(import.meta.dirname, "client/src"),
          "@shared": path.resolve(import.meta.dirname, "shared"),
          "@assets": path.resolve(import.meta.dirname, "attached_assets"),
        },
      },
    },
  ],
});
