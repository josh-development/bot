import { updateGuildCommands } from "../utils/helpers.ts";
import { events } from "./mod.ts";

events.guildCreate = async (bot, guild) =>
  await updateGuildCommands(bot, guild);
