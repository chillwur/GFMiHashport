/**
 * Parses free-text WhatsApp messages into Hashport commands.
 *
 * Supported today (case-insensitive):
 *   balance
 *   address
 *   send <amount> <asset> to <recipient>
 *   swap <amount> <fromAsset> to <toAsset>
 *   deploy            (starts the contract-deploy flow)
 *   help
 */
export type Command =
  | { kind: "balance" }
  | { kind: "address" }
  | { kind: "send"; amount: string; asset: string; recipient: string }
  | { kind: "swap"; amount: string; fromAsset: string; toAsset: string }
  | { kind: "deploy" }
  | { kind: "help" }
  | { kind: "unknown"; raw: string };

const SEND_RE = /^send\s+([\d.]+)\s+(\S+)\s+to\s+(.+)$/i;
const SWAP_RE = /^swap\s+([\d.]+)\s+(\S+)\s+(?:to|for)\s+(\S+)$/i;

export function parseCommand(text: string): Command {
  const input = text.trim();
  const lower = input.toLowerCase();

  if (lower === "balance" || lower === "bal") return { kind: "balance" };
  if (lower === "address" || lower === "wallet") return { kind: "address" };
  if (lower === "deploy") return { kind: "deploy" };
  if (lower === "help" || lower === "hi" || lower === "hello" || lower === "start") {
    return { kind: "help" };
  }

  const send = input.match(SEND_RE);
  if (send) {
    return {
      kind: "send",
      amount: send[1]!,
      asset: send[2]!.toUpperCase(),
      recipient: send[3]!.trim(),
    };
  }

  const swap = input.match(SWAP_RE);
  if (swap) {
    return {
      kind: "swap",
      amount: swap[1]!,
      fromAsset: swap[2]!.toUpperCase(),
      toAsset: swap[3]!.toUpperCase(),
    };
  }

  return { kind: "unknown", raw: input };
}

export const HELP_TEXT = [
  "*Hashport* — Chat. Build. Pay. On Stellar.",
  "",
  "• `balance` — your wallet balances",
  "• `address` — your Stellar address",
  "• `send 5 XLM to +2348000000000` — pay a contact",
  "• `swap 10 XLM to USDC` — trade on Stellar",
  "• `deploy` — deploy a Soroban contract",
  "• `help` — this message",
].join("\n");
