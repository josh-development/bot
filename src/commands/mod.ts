import {
  ApplicationCommandOption,
  ApplicationCommandTypes,
  bgYellow,
  black,
  Bot,
  Collection,
  Interaction,
} from "../../deps.ts";
import { log } from "../utils/logger.ts";

export type subCommand = Omit<Command, "subcommands">;
export type subCommandGroup = {
  name: string;
  subCommands: subCommand[];
};
export interface Command {
  name: string;
  description: string;
  usage?: string[];
  options?: ApplicationCommandOption[];
  type: ApplicationCommandTypes;
  /** Defaults to `Guild` */
  scope?: "Global" | "Guild";
  execute: (bot: Bot, interaction: Interaction) => unknown;
  subcommands?: Array<subCommandGroup | subCommand>;
}

export const commands = new Collection<string, Command>();

export function createCommand(command: Command) {
  commands.set(command.name, command);
  log.info("Created command: " + bgYellow(black(command.name)));
}
