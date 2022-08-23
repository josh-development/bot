import { assertExists, stopBot } from "./deps.ts";
import { start } from "./mod.ts";

Deno.test({
  name: "[main] connect to gateway",
  fn: async () => {
    const bot = await start();
    assertExists(bot.id);
    await stopBot(bot);
  },
  sanitizeResources: false,
  sanitizeOps: false,
  // why? because there's lots of leftover intervals that discordeno has yet to finish adding a cleanup to
});
