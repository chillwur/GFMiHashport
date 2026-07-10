export const siteConfig = {
  name: "Hashport",
  tagline: "Chat. Build. Pay. On Stellar.",
  description: "Send, receive, swap, and deploy contracts on Stellar — all inside WhatsApp.",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000",
  stellarNetwork: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet",
  hashportContractId: process.env.NEXT_PUBLIC_HASHPORT_CONTRACT_ID ?? "",
  whatsappBotNumber: process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER ?? "",
} as const;

export function whatsappLink(): string {
  return siteConfig.whatsappBotNumber
    ? `https://wa.me/${siteConfig.whatsappBotNumber}?text=${encodeURIComponent("hi")}`
    : "#";
}
