import { bot } from "./mod.ts";
import { assertExists, delay } from "./deps.ts";

Deno.test({
  name: "[main] connect to gateway",
  fn: async () => {
    await delay(5000);
    assertExists(bot.id);
  },
});
