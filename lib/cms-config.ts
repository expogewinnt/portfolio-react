const MICROCMS_ENV_KEYS = ["MICROCMS_SERVICE_DOMAIN", "MICROCMS_API_KEY"] as const;

function readEnv(name: (typeof MICROCMS_ENV_KEYS)[number]) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function isMicroCmsConfigured() {
  return MICROCMS_ENV_KEYS.every((key) => readEnv(key) !== null);
}

export function getMicroCmsConfig() {
  const serviceDomain = readEnv("MICROCMS_SERVICE_DOMAIN");
  const apiKey = readEnv("MICROCMS_API_KEY");

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
