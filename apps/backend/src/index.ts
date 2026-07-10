import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = buildApp();

try {
  await app.listen({ host: env.host, port: env.port });
  app.log.info(`Hashport backend up on :${env.port} (Stellar ${env.stellar.network})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
