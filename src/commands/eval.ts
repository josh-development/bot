import { BOT_COLOR } from "../../config.ts";
import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  InteractionResponseTypes,
} from "../../deps.ts";
import * as docsUtils from "../utils/docs.ts";
import { Embeds } from "../utils/embed.ts";
import { createCommand } from "./mod.ts";

const docs = docsUtils;

createCommand({
  name: "eval",
  description: "Evaluate code",
  type: ApplicationCommandTypes.ChatInput,
  scope: "Global",
  options: [
    {
      name: "code",
      description: "Code",
      type: ApplicationCommandOptionTypes.String,
      required: true,
    },
  ],
  execute: async (bot, interaction) => {
    if (interaction.user.id !== 709674034798788617n) {
      return bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            flags: 1 << 6,
            content: "Sorry, you are not allowed to use this command",
          },
        },
      );
    }
    const inputCode = interaction.data?.options?.find(
      (x) => x.name === "code",
    )?.value as string;
    try {
      docs; // to be used
      let result = eval(inputCode);
      if (result instanceof Promise) {
        result = await result;
      }
      const embed = new Embeds(bot)
        .setTitle("Eval")
        .setColor(BOT_COLOR)
        .addField("Output", `\`\`\`ts\n${Deno.inspect(result)}\`\`\``);
      return bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            embeds: embed,
          },
        },
      );
    } catch (error) {
      const embed = new Embeds(bot)
        .setTitle("Eval")
        .setColor(BOT_COLOR)
        .addField("Output", `\`\`\`ts\n${error}\`\`\``);
      return bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            embeds: embed,
          },
        },
      );
    }
  },
});
