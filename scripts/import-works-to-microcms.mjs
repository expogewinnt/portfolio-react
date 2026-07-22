#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const WORKS_JSON = path.join(ROOT, "src/data/works.json");
const IMAGES_DIR = path.join(ROOT, "public/images/big");

async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(ROOT, ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      process.env[key] ??= value;
    }
  } catch {
    // .env.local is optional for explicit env exports.
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Set it in .env.local before running this script.`);
  }

  return value;
}

async function parseError(response) {
  try {
    const body = await response.json();
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function uploadMedia(serviceDomain, apiKey, filePath) {
  const bytes = await readFile(filePath);
  const fileName = path.basename(filePath);
  const formData = new FormData();
  formData.append("file", new Blob([bytes]), fileName);

  const response = await fetch(`https://${serviceDomain}.microcms-management.io/api/v1/media`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Media upload failed (${fileName}): ${await parseError(response)}`);
  }

  const body = await response.json();
  return body.url;
}

async function createWork(serviceDomain, apiKey, work, imageUrl) {
  const response = await fetch(`https://${serviceDomain}.microcms.io/api/v1/works`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: work.ttl,
      charge: work.charge,
      image: imageUrl
    })
  });

  if (!response.ok) {
    throw new Error(`Create failed (${work.ttl}): ${await parseError(response)}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await loadEnvLocal();

  const serviceDomain = requireEnv("MICROCMS_SERVICE_DOMAIN");
  const apiKey = requireEnv("MICROCMS_API_KEY");
  const raw = await readFile(WORKS_JSON, "utf-8");
  const works = JSON.parse(raw);

  console.log(`Importing ${works.length} works to microCMS...`);

  for (const [index, work] of works.entries()) {
    const imagePath = path.join(IMAGES_DIR, work.img);

    process.stdout.write(`[${index + 1}/${works.length}] ${work.ttl} ... `);

    try {
      const imageUrl = await uploadMedia(serviceDomain, apiKey, imagePath);
      await createWork(serviceDomain, apiKey, work, imageUrl);
      console.log("OK");
    } catch (error) {
      console.log("FAILED");
      throw error;
    }

    await sleep(300);
  }

  console.log("Import completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
