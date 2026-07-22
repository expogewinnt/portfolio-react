#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const WORKS_JSON = path.join(ROOT, "src/data/works.json");
const IMAGES_DIR = path.join(ROOT, "public/images/big");
const REQUEST_INTERVAL_MS = 1000;
const MAX_RETRIES = 5;

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

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function mimeFromFileName(fileName) {
  switch (path.extname(fileName).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      throw new Error(`Unsupported image type: ${fileName}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(label, action) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      const retryable =
        error instanceof HttpError && (error.status === 429 || error.status >= 500);

      if (!retryable || attempt === MAX_RETRIES) {
        throw error;
      }

      const waitMs = REQUEST_INTERVAL_MS * 2 ** attempt;
      console.log(`retry ${attempt}/${MAX_RETRIES} after ${waitMs}ms (${label})`);
      await sleep(waitMs);
    }
  }

  throw new Error(`Unreachable retry state: ${label}`);
}

async function fetchExistingTitles(serviceDomain, apiKey) {
  const titles = new Set();
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetch(
      `https://${serviceDomain}.microcms.io/api/v1/works?limit=${limit}&offset=${offset}&fields=title`,
      {
        headers: {
          "X-MICROCMS-API-KEY": apiKey
        }
      }
    );

    if (!response.ok) {
      throw new HttpError(response.status, await parseError(response));
    }

    const body = await response.json();
    for (const item of body.contents ?? []) {
      if (item.title) {
        titles.add(item.title);
      }
    }

    offset += limit;
    if (offset >= (body.totalCount ?? 0)) {
      break;
    }
  }

  return titles;
}

async function uploadMedia(serviceDomain, apiKey, filePath) {
  const bytes = await readFile(filePath);
  const fileName = path.basename(filePath);
  const formData = new FormData();
  formData.append("file", new Blob([bytes], { type: mimeFromFileName(fileName) }), fileName);

  const response = await fetch(`https://${serviceDomain}.microcms-management.io/api/v1/media`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": apiKey
    },
    body: formData
  });

  if (!response.ok) {
    throw new HttpError(response.status, `Media upload failed (${fileName}): ${await parseError(response)}`);
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
    throw new HttpError(response.status, `Create failed (${work.ttl}): ${await parseError(response)}`);
  }
}

async function main() {
  await loadEnvLocal();

  const serviceDomain = requireEnv("MICROCMS_SERVICE_DOMAIN");
  const apiKey = requireEnv("MICROCMS_API_KEY");
  const raw = await readFile(WORKS_JSON, "utf-8");
  const works = JSON.parse(raw);
  const existingTitles = await fetchExistingTitles(serviceDomain, apiKey);

  console.log(
    `Importing ${works.length} works to microCMS (skipping ${existingTitles.size} already imported)...`
  );

  for (const [index, work] of works.entries()) {
    const imagePath = path.join(IMAGES_DIR, work.img);

    process.stdout.write(`[${index + 1}/${works.length}] ${work.ttl} ... `);

    if (existingTitles.has(work.ttl)) {
      console.log("SKIP");
      continue;
    }

    try {
      await withRetry(work.ttl, async () => {
        const imageUrl = await uploadMedia(serviceDomain, apiKey, imagePath);
        await createWork(serviceDomain, apiKey, work, imageUrl);
      });
      existingTitles.add(work.ttl);
      console.log("OK");
    } catch (error) {
      console.log("FAILED");
      throw error;
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log("Import completed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
