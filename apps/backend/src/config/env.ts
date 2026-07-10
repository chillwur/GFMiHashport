import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const envFile = path.resolve(process.cwd(), ".env");
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export type StellarNetwork = "testnet" | "mainnet";

/**
 * Vars that may be blank in dev (the backend boots without WhatsApp/Stellar
 * credentials locally) but must be present once NODE_ENV=production.
 */
const REQUIRED_IN_PRODUCTION = [
  "DATABASE_URL",
  "REDIS_URL",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_APP_SECRET",
  "HASHPORT_CONTRACT_ID",
  "SIGNER_SECRET_KEY",
  "WALLET_ENCRYPTION_KEY",
] as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    HOST: z.string().min(1).default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(4000),

    DATABASE_URL: z.string().default(""),
    REDIS_URL: z.string().default(""),

    WHATSAPP_ACCESS_TOKEN: z.string().default(""),
    WHATSAPP_PHONE_NUMBER_ID: z.string().default(""),
    WHATSAPP_VERIFY_TOKEN: z.string().default("change-me"),
    WHATSAPP_APP_SECRET: z.string().default(""),

    STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
    STELLAR_HORIZON_URL: z.string().optional(),
    STELLAR_RPC_URL: z.string().optional(),
    HASHPORT_CONTRACT_ID: z.string().default(""),

    SIGNER_SECRET_KEY: z.string().default(""),
    WALLET_ENCRYPTION_KEY: z.string().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") return;
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when NODE_ENV=production — see .env.example`,
        });
      }
    }
  });

export type ParsedEnv = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env) {
  return envSchema.safeParse(source);
}

export function formatEnvIssues(issues: z.ZodIssue[]): string {
  return issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

function loadEnv(): ParsedEnv {
  const result = parseEnv();
  if (!result.success) {
    console.error(
      `Invalid environment configuration:\n${formatEnvIssues(result.error.issues)}`,
    );
    process.exit(1);
  }
  return result.data;
}

const raw = loadEnv();

export const env = {
  nodeEnv: raw.NODE_ENV,
  host: raw.HOST,
  port: raw.PORT,

  databaseUrl: raw.DATABASE_URL,
  redisUrl: raw.REDIS_URL,

  whatsapp: {
    accessToken: raw.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: raw.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: raw.WHATSAPP_VERIFY_TOKEN,
    appSecret: raw.WHATSAPP_APP_SECRET,
  },

  stellar: {
    network: raw.STELLAR_NETWORK,
    horizonUrl:
      raw.STELLAR_HORIZON_URL ??
      (raw.STELLAR_NETWORK === "mainnet"
        ? "https://horizon.stellar.org"
        : "https://horizon-testnet.stellar.org"),
    rpcUrl:
      raw.STELLAR_RPC_URL ??
      (raw.STELLAR_NETWORK === "mainnet"
        ? "https://mainnet.sorobanrpc.com"
        : "https://soroban-testnet.stellar.org"),
    hashportContractId: raw.HASHPORT_CONTRACT_ID,
  },
} as const;

/** Secrets are read lazily so dev servers can boot without them. */
export const secrets = {
  get signerSecretKey(): string {
    if (!raw.SIGNER_SECRET_KEY) {
      throw new Error("Missing required env var SIGNER_SECRET_KEY — see .env.example");
    }
    return raw.SIGNER_SECRET_KEY;
  },
  get walletEncryptionKey(): string {
    if (!raw.WALLET_ENCRYPTION_KEY) {
      throw new Error("Missing required env var WALLET_ENCRYPTION_KEY — see .env.example");
    }
    return raw.WALLET_ENCRYPTION_KEY;
  },
};
