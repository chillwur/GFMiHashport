import type { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import { verifyWebhookSignature } from "../lib/signature.js";
import { parseCommand } from "../lib/commands.js";
import { sendText } from "../services/whatsapp.js";
import { handleCommand } from "../services/router.js";
import type { WhatsAppWebhookPayload } from "../types/index.js";

/**
 * WhatsApp Cloud API webhook.
 * GET  /webhooks/whatsapp — subscription verification handshake (Meta calls this once).
 * POST /webhooks/whatsapp — incoming messages and status updates.
 */
export async function webhookRoutes(app: FastifyInstance) {
  app.get("/whatsapp", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    if (mode === "subscribe" && token === env.whatsapp.verifyToken) {
      return reply.code(200).send(challenge);
    }
    return reply.code(403).send({ error: "verification failed" });
  });

  app.post("/whatsapp", async (request, reply) => {
    const signature = request.headers["x-hub-signature-256"];
    if (
      env.whatsapp.appSecret &&
      !verifyWebhookSignature(
        JSON.stringify(request.body),
        typeof signature === "string" ? signature : "",
        env.whatsapp.appSecret,
      )
    ) {
      return reply.code(401).send({ error: "bad signature" });
    }

    const payload = request.body as WhatsAppWebhookPayload;
    const messages =
      payload.entry?.flatMap(
        (entry) => entry.changes?.flatMap((change) => change.value.messages ?? []) ?? [],
      ) ?? [];

    for (const message of messages) {
      if (message.type !== "text" || !message.text) continue;
      const command = parseCommand(message.text.body);
      const replyText = await handleCommand(command, message.from);
      await sendText(message.from, replyText).catch((err) =>
        app.log.error({ err }, "failed to send WhatsApp reply"),
      );
    }

    // Always 200 quickly — Meta retries and eventually disables slow webhooks.
    return reply.code(200).send({ received: true });
  });
}
