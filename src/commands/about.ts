import { BOT_COLOR } from "../../config.ts";
import {
  ApplicationCommandTypes,
  InteractionResponseTypes,
} from "../../deps.ts";
import { Components } from "../utils/component.ts";
import { Embeds } from "../utils/embed.ts";
import { createCommand } from "./mod.ts";

createCommand({
  name: "about",
  description: "Learn about the bot",
  type: ApplicationCommandTypes.ChatInput,
  scope: "Global",
  execute: async (bot, interaction) => {
    const denoVersion = Deno.version.deno;
    const typescriptVersion = Deno.version.typescript;
    const v8Version = Deno.version.v8;

    const embeds = new Embeds(bot)
      .setTitle("About")
      .setDescription(
        `JoshDocs is a community written bot, mostly written by DanCodes in Deno, it fetches documentation from the [josh-development/docs](https://github.com/josh-development/docs) repository to provide information on the Josh API. You can checkout the code to this bot [here](https://github.com/josh-development/bot)
        \`\`\`yml
Deno: ${denoVersion}
Typescript: ${typescriptVersion}
V8: ${v8Version}
\`\`\``,
      )
      .setColor(BOT_COLOR)
      .setFooter(
        interaction.user.username,
        bot.helpers.avatarURL(
          interaction.user.id,
          interaction.user.discriminator,
          { avatar: interaction.user.avatar },
        ),
      );

    await bot.helpers.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          embeds,
          components: new Components()
            .addButton(
              "⭐ Github",
              "Link",
              `https://github.com/josh-development/core`,
            )
            .addButton("Website", "Link", `https://josh.evie.dev`)
            .addButton(
              "Invite",
              "Link",
              `https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=8&scope=bot`,
            ),
        },
      },
    );
  },
});
