import { logger } from "../utils/logger.ts";
import { events } from "./mod.ts";

const log = logger({ name: "Event: Ready" });

events.ready = () => {
  log.info("Bot Ready");
};
