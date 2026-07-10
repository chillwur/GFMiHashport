#!/usr/bin/env node
// Checks that the root `.env.example` var map stays in sync with the
// workspace-local `.env.example` files and with the vars actually read by
// the backend's validated env schema.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ROOT_ENV_EXAMPLE = path.join(ROOT, ".env.example");
const BACKEND_ENV_EXAMPLE = path.join(ROOT, "apps/backend/.env.example");
const FRONTEND_ENV_EXAMPLE = path.join(ROOT, "apps/frontend/.env.example");
const BACKEND_ENV_SCHEMA = path.join(ROOT, "apps/backend/src/config/env.ts");

const VAR_NAME = /^[A-Z][A-Z0-9_]*$/;

function readText(filePath) {
  return readFileSync(filePath, "utf8");
}

/** Vars actually declared as `KEY=value` in a `.env.example` file. */
function extractExampleVars(text) {
  const vars = new Set();
  for (const line of text.split("\n")) {
    const match = /^([A-Z][A-Z0-9_]*)=/.exec(line);
    if (match) vars.add(match[1]);
  }
  return vars;
}

/**
 * Vars mentioned in the root `.env.example`'s documentation comments, e.g.
 *   # DATABASE_URL                    Postgres connection string
 *   # NODE_ENV, PORT, HOST            Server runtime
 */
function extractRootMapVars(text) {
  const vars = new Set();
  for (const rawLine of text.split("\n")) {
    if (!rawLine.startsWith("#")) continue;
    const stripped = rawLine.replace(/^#\s?/, "");
    const [namesPart] = stripped.split(/\s{2,}/);
    for (const token of namesPart.split(",")) {
      const name = token.trim();
      if (VAR_NAME.test(name)) vars.add(name);
    }
  }
  return vars;
}

/** Vars declared as top-level keys of the backend's zod env schema. */
function extractSchemaVars(text) {
  const vars = new Set();
  const fieldPattern = /^\s{4}([A-Z][A-Z0-9_]*):\s*z\./gm;
  let match;
  while ((match = fieldPattern.exec(text)) !== null) {
    vars.add(match[1]);
  }
  return vars;
}

const rootMapVars = extractRootMapVars(readText(ROOT_ENV_EXAMPLE));
const backendExampleVars = extractExampleVars(readText(BACKEND_ENV_EXAMPLE));
const frontendExampleVars = extractExampleVars(readText(FRONTEND_ENV_EXAMPLE));
const backendSchemaVars = extractSchemaVars(readText(BACKEND_ENV_SCHEMA));

const errors = [];

for (const name of backendSchemaVars) {
  if (!backendExampleVars.has(name)) {
    errors.push(
      `${name} is read by apps/backend/src/config/env.ts but missing from apps/backend/.env.example`,
    );
  }
}

for (const name of backendExampleVars) {
  if (!rootMapVars.has(name)) {
    errors.push(`${name} is documented in apps/backend/.env.example but missing from the root .env.example map`);
  }
}

for (const name of frontendExampleVars) {
  if (!rootMapVars.has(name)) {
    errors.push(`${name} is documented in apps/frontend/.env.example but missing from the root .env.example map`);
  }
}

if (errors.length > 0) {
  console.error("Env var docs are out of sync:\n");
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  console.error("\nUpdate the root .env.example map (or the workspace .env.example) to match.");
  process.exit(1);
}

console.log("Env var docs are in sync.");
