export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";

type AdminConfig = {
  username: string;
  password: string;
  sessionToken: string;
};

export function getAdminConfig(): AdminConfig {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "portfolio-local",
    sessionToken:
      process.env.ADMIN_SESSION_TOKEN ?? "portfolio-admin-local-session"
  };
}
