function readTrimmed(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function isMicroCmsConfigured() {
  return getMicroCmsConfig() !== null;
}

export function getMicroCmsConfig() {
  // Next.js / Vercel では process.env.NAME の静的参照が安全
  const serviceDomain = readTrimmed(process.env.MICROCMS_SERVICE_DOMAIN);
  const apiKey = readTrimmed(process.env.MICROCMS_API_KEY);

  if (!serviceDomain || !apiKey) {
    return null;
  }

  return {
    serviceDomain,
    apiKey
  };
}

export function getWorksStorageLabel() {
  return isMicroCmsConfigured() ? "microCMS" : "works.json";
}
