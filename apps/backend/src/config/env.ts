import { existsSync } from "node:fs";
import path from "node:path";

const envFile = path.resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export type StellarNetwork = "testnet" | "mainnet";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} — see .env.example`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

const network = optional("STELLAR_NETWORK", "testnet");
if (network !== "testnet" && network !== "mainnet") {
  throw new Error(`STELLAR_NETWORK must be "testnet" or "mainnet", got "${network}"`);
}

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  host: optional("HOST", "0.0.0.0"),
  port: Number(optional("PORT", "4000")),

  databaseUrl: optional("DATABASE_URL", ""),
  redisUrl: optional("REDIS_URL", ""),

  whatsapp: {
    accessToken: optional("WHATSAPP_ACCESS_TOKEN", ""),
    phoneNumberId: optional("WHATSAPP_PHONE_NUMBER_ID", ""),
    verifyToken: optional("WHATSAPP_VERIFY_TOKEN", "change-me"),
    appSecret: optional("WHATSAPP_APP_SECRET", ""),
  },

  stellar: {
    network: network as StellarNetwork,
    horizonUrl: optional(
      "STELLAR_HORIZON_URL",
      network === "mainnet"
        ? "https://horizon.stellar.org"
        : "https://horizon-testnet.stellar.org",
    ),
    rpcUrl: optional(
      "STELLAR_RPC_URL",
      network === "mainnet"
        ? "https://mainnet.sorobanrpc.com"
        : "https://soroban-testnet.stellar.org",
    ),
    hashportContractId: optional("HASHPORT_CONTRACT_ID", ""),
  },
} as const;

/** Secrets are read lazily so dev servers can boot without them. */
export const secrets = {
  get signerSecretKey(): string {
    return required("SIGNER_SECRET_KEY");
  },
  get walletEncryptionKey(): string {
    return required("WALLET_ENCRYPTION_KEY");
  },
};
