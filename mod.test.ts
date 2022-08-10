import { assertExists, stopBot } from "./deps.ts";
import { start } from "./mod.ts";

Deno.test({
  name: "[main] connect to gateway",
  fn: async () => {
    const bot = await start();
    assertExists(bot.id);
    bot.rest.ratelimitedPaths.clear();
    bot.rest.processRateLimitedPaths(bot.rest);
    await stopBot(bot);
  },
});
