import { HELP_TEXT, type Command } from "../lib/commands.js";
import * as stellar from "./stellar.js";

/**
 * Turns a parsed command into a reply, executing Stellar actions as needed.
 * `sender` is the WhatsApp phone number the message came from; it keys the
 * user's wallet.
 */
export async function handleCommand(command: Command, sender: string): Promise<string> {
  switch (command.kind) {
    case "help":
      return HELP_TEXT;

    case "address": {
      const address = await stellar.getOrCreateWallet(sender);
      return `Your Stellar address:\n\`${address}\``;
    }

    case "balance": {
      const balances = await stellar.getBalances(sender);
      if (balances.length === 0) {
        return "Your wallet is empty. Fund it with `address` to get started.";
      }
      return balances.map((b) => `• ${b.balance} ${b.asset}`).join("\n");
    }

    case "send":
      return stellar.sendPayment(sender, command);

    case "swap":
      return stellar.swapAssets(sender, command);

    case "deploy":
      return "Contract deployment from chat is coming soon. Track progress at https://github.com/chillwur/GFMiHashport";

    case "unknown":
      return `I didn't understand "${command.raw}". Send *help* to see what I can do.`;
  }
}
