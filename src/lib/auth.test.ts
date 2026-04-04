import { describe, it, expect } from "vitest";
import { isAdmin, isSuperAdmin } from "./auth-helpers";
import { UserRole } from "@prisma/client";

describe("auth helpers", () => {
  describe("isAdmin", () => {
    it("returns true for ADMIN role", () => {
      expect(isAdmin(UserRole.ADMIN)).toBe(true);
    });

    it("returns true for SUPER_ADMIN role", () => {
      expect(isAdmin(UserRole.SUPER_ADMIN)).toBe(true);
    });
  });

  describe("isSuperAdmin", () => {
    it("returns true for SUPER_ADMIN role", () => {
      expect(isSuperAdmin(UserRole.SUPER_ADMIN)).toBe(true);
    });

    it("returns false for ADMIN role", () => {
      expect(isSuperAdmin(UserRole.ADMIN)).toBe(false);
    });
  });
});
