export type StellarNetwork = "testnet" | "mainnet";

export interface HealthResponse {
  status: "ok";
  network: StellarNetwork;
  uptime: number;
}
