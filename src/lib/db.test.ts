import { describe, it, expect } from "vitest";
import { prisma } from "./db";

describe("db", () => {
  it("exports a PrismaClient instance", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
  });

  it("reuses the same instance (singleton)", async () => {
    const { prisma: prisma2 } = await import("./db");
    expect(prisma).toBe(prisma2);
  });
});
