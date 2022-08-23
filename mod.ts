import { BOT_ID, BOT_TOKEN } from "./config.ts";
import {
  ActivityTypes,
  createBot,
  enableCachePlugin,
  enableCacheSweepers,
  fastFileLoader,
  GatewayIntents,
  startBot,
} from "./deps.ts";
import { events } from "./src/events/mod.ts";
import { updateCommands } from "./src/utils/helpers.ts";
import { logger } from "./src/utils/logger.ts";

const log = logger({ name: "Main" });

log.info("Starting Bot, this might take a while...");

const paths = ["./src/events", "./src/commands"];

export const start = async (sweep = false) => {
  await fastFileLoader(paths).catch((err) => {
    log.fatal(`Unable to Import ${paths}`);
    log.fatal(err);
    Deno.exit(1);
  });

  log.info("Loaded all events and commands");

  const bot = enableCachePlugin(
    createBot({
      token: BOT_TOKEN,
      botId: BOT_ID,
      intents: GatewayIntents.Guilds,
      events,
    })
  );

  if (sweep) enableCacheSweepers(bot);

  bot.gateway.manager.createShardOptions.makePresence = (shardId: number) => {
    return {
      shardId: shardId,
      status: "online",
      activities: [
        {
          name: "josh.evie.dev",
          type: ActivityTypes.Watching,
          createdAt: Date.now(),
        },
      ],
    };
  };

  await startBot(bot);

  await updateCommands(bot);
  return bot;
};

if (import.meta.main) {
  await start(true);
}
