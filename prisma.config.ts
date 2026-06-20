import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  seed: "node prisma/seed.js",  // ← أضف هذا السطر
  datasource: {
    url: env("DATABASE_URL"),
  },
});