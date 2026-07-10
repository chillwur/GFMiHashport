import { env } from "../config/env.js";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

/**
 * Send a plain text message via the WhatsApp Cloud API.
 * No-ops (with a console warning) when credentials aren't configured, so the
 * webhook flow can be exercised locally without a Meta app.
 */
export async function sendText(to: string, body: string): Promise<void> {
  const { accessToken, phoneNumberId } = env.whatsapp;
  if (!accessToken || !phoneNumberId) {
    console.warn(`[whatsapp] not configured — would send to ${to}:\n${body}`);
    return;
  }

  const res = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) {
    throw new Error(`WhatsApp send failed (${res.status}): ${await res.text()}`);
  }
}
