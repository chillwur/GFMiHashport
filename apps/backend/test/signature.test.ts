import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "../src/lib/signature.js";

const SECRET = "test-app-secret";

function sign(body: string): string {
  return "sha256=" + createHmac("sha256", SECRET).update(body, "utf8").digest("hex");
}

describe("verifyWebhookSignature", () => {
  it("accepts a valid signature", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account" });
    expect(verifyWebhookSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const body = JSON.stringify({ object: "whatsapp_business_account" });
    expect(verifyWebhookSignature(body + "x", sign(body), SECRET)).toBe(false);
  });

  it("rejects malformed headers", () => {
    expect(verifyWebhookSignature("{}", "", SECRET)).toBe(false);
    expect(verifyWebhookSignature("{}", "sha1=abc", SECRET)).toBe(false);
    expect(verifyWebhookSignature("{}", "sha256=deadbeef", SECRET)).toBe(false);
  });
});
