import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify Meta's X-Hub-Signature-256 header: "sha256=<hmac-sha256 of raw body>".
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  appSecret: string,
): boolean {
  if (!signatureHeader.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}
