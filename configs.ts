import { dotEnvConfig } from "./deps.ts";

dotEnvConfig({ export: true });

export const BOT_TOKEN = Deno.env.get("TOKEN") || "";
export const BOT_ID = BigInt(atob(BOT_TOKEN.split(".")[0]));
export const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") || "";
export const BOT_COLOR = 0x45975a;
