export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";

const ADMIN_ENV_KEYS = [
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_TOKEN"
] as const;

type AdminConfig = {
  username: string;
  password: string;
  sessionToken: string;
};

function readEnv(name: (typeof ADMIN_ENV_KEYS)[number]) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function isAdminConfigured() {
  return ADMIN_ENV_KEYS.every((key) => readEnv(key) !== null);
}

export function getAdminConfig(): AdminConfig | null {
  const username = readEnv("ADMIN_USERNAME");
  const password = readEnv("ADMIN_PASSWORD");
  const sessionToken = readEnv("ADMIN_SESSION_TOKEN");

  if (!username || !password || !sessionToken) {
    return null;
  }

  return {
    username,
    password,
    sessionToken
  };
}

export function getAdminSetupMessage() {
  return "管理者認証が未設定です。プロジェクト直下の `.env.local` に `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_SESSION_TOKEN` を設定してください。";
}
