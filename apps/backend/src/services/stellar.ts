import { Horizon, Keypair, Networks } from "@stellar/stellar-sdk";
import { env } from "../config/env.js";
import type { Command } from "../lib/commands.js";

export const networkPassphrase =
  env.stellar.network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

export const horizon = new Horizon.Server(env.stellar.horizonUrl);

export interface AssetBalance {
  asset: string;
  balance: string;
}

/**
 * In-memory wallet store, keyed by WhatsApp phone number.
 * Placeholder for the Postgres-backed store (DATABASE_URL) with keys
 * encrypted under WALLET_ENCRYPTION_KEY.
 */
const wallets = new Map<string, Keypair>();

export async function getOrCreateWallet(phone: string): Promise<string> {
  let keypair = wallets.get(phone);
  if (!keypair) {
    keypair = Keypair.random();
    wallets.set(phone, keypair);
  }
  return keypair.publicKey();
}

export async function getBalances(phone: string): Promise<AssetBalance[]> {
  const publicKey = await getOrCreateWallet(phone);
  try {
    const account = await horizon.loadAccount(publicKey);
    return account.balances.map((b) => ({
      asset: b.asset_type === "native" ? "XLM" : "asset_code" in b ? b.asset_code : b.asset_type,
      balance: b.balance,
    }));
  } catch {
    // Unfunded accounts don't exist on the ledger yet.
    return [];
  }
}

export async function sendPayment(
  phone: string,
  command: Extract<Command, { kind: "send" }>,
): Promise<string> {
  // TODO: build + sign a payment (or hashport-account contract call), with a
  // confirm step held in Redis before submitting.
  return [
    `Ready to send *${command.amount} ${command.asset}* to ${command.recipient} on ${env.stellar.network}.`,
    "Payment submission ships next — this build stops before signing.",
  ].join("\n");
}

export async function swapAssets(
  phone: string,
  command: Extract<Command, { kind: "swap" }>,
): Promise<string> {
  // TODO: quote via Horizon strict-send paths, then submit a pathPaymentStrictSend.
  return [
    `Quoting *${command.amount} ${command.fromAsset} → ${command.toAsset}* on ${env.stellar.network}…`,
    "Swaps ship next — this build stops before quoting.",
  ].join("\n");
}
