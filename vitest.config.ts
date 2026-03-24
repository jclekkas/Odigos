import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const aliases = {
  "@": path.resolve(import.meta.dirname, "client/src"),
  "@shared": path.resolve(import.meta.dirname, "shared"),
  "@assets": path.resolve(import.meta.dirname, "attached_assets"),
};

export default defineConfig({
  test: {
    reporters: ["verbose"],
    projects: [
      {
        plugins: [],
        resolve: { alias: aliases },
        test: {
          name: "unit",
          environment: "node",
          include: ["tests/unit/**/*.test.ts"],
          globals: true,
          clearMocks: true,
          restoreMocks: true,
          setupFiles: ["tests/setup.server.ts"],
          env: {
            NODE_ENV: "test",
            DATABASE_URL: "postgresql://test:test@localhost:5432/test",
          },
        },
      },
      {
        plugins: [],
        resolve: { alias: aliases },
        test: {
          name: "api",
          environment: "node",
          include: ["tests/api/**/*.test.ts"],
          globals: true,
          clearMocks: true,
          restoreMocks: true,
          setupFiles: ["tests/setup.server.ts"],
          env: {
            NODE_ENV: "test",
            DATABASE_URL: "postgresql://test:test@localhost:5432/test",
          },
        },
      },
      {
        plugins: [react()],
        resolve: { alias: aliases },
        test: {
          name: "components",
          environment: "jsdom",
          include: ["tests/components/**/*.test.tsx"],
          globals: true,
          clearMocks: true,
          restoreMocks: true,
          env: {
            NODE_ENV: "test",
          },
        },
      },
    ],
  },
});
