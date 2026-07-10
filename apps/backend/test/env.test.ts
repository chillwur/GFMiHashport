import { describe, expect, it } from "vitest";
import { formatEnvIssues, parseEnv } from "../src/config/env.js";

const BASE_DEV_ENV = {
  NODE_ENV: "development",
};

describe("parseEnv", () => {
  it("succeeds with no vars set, applying dev-friendly defaults", () => {
    const result = parseEnv({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
      expect(result.data.PORT).toBe(4000);
      expect(result.data.HOST).toBe("0.0.0.0");
      expect(result.data.STELLAR_NETWORK).toBe("testnet");
      expect(result.data.DATABASE_URL).toBe("");
    }
  });

  it("rejects a malformed PORT", () => {
    const result = parseEnv({ ...BASE_DEV_ENV, PORT: "not-a-number" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "PORT")).toBe(true);
    }
  });

  it("rejects an invalid STELLAR_NETWORK", () => {
    const result = parseEnv({ ...BASE_DEV_ENV, STELLAR_NETWORK: "devnet" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join(".") === "STELLAR_NETWORK"),
      ).toBe(true);
    }
  });

  it("rejects an invalid NODE_ENV", () => {
    const result = parseEnv({ NODE_ENV: "staging" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "NODE_ENV")).toBe(
        true,
      );
    }
  });

  it("requires production secrets and storage vars when NODE_ENV=production", () => {
    const result = parseEnv({ NODE_ENV: "production" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const missing = result.error.issues.map((issue) => issue.path.join("."));
      expect(missing).toEqual(
        expect.arrayContaining([
          "DATABASE_URL",
          "REDIS_URL",
          "WHATSAPP_ACCESS_TOKEN",
          "WHATSAPP_PHONE_NUMBER_ID",
          "WHATSAPP_APP_SECRET",
          "HASHPORT_CONTRACT_ID",
          "SIGNER_SECRET_KEY",
          "WALLET_ENCRYPTION_KEY",
        ]),
      );
    }
  });

  it("succeeds in production once all required vars are present", () => {
    const result = parseEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://user:pass@host:5432/db",
      REDIS_URL: "redis://host:6379",
      WHATSAPP_ACCESS_TOKEN: "token",
      WHATSAPP_PHONE_NUMBER_ID: "123",
      WHATSAPP_APP_SECRET: "secret",
      HASHPORT_CONTRACT_ID: "CABC123",
      SIGNER_SECRET_KEY: "SABC123",
      WALLET_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef",
    });
    expect(result.success).toBe(true);
  });

  it("formats issues into a readable, one-per-line list", () => {
    const result = parseEnv({ NODE_ENV: "production" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatEnvIssues(result.error.issues);
      expect(formatted).toContain("DATABASE_URL");
      expect(formatted.split("\n").length).toBe(result.error.issues.length);
    }
  });
});
