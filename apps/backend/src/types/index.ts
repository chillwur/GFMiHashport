/** Minimal typing of the WhatsApp Cloud API webhook payload (messages field). */
export interface WhatsAppWebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      field: string;
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        messages?: WhatsAppInboundMessage[];
      };
    }>;
  }>;
}

export interface WhatsAppInboundMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "interactive" | string;
  text?: { body: string };
}
