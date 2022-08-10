import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  ClassParser,
  InteractionResponseTypes,
} from "../../deps.ts";
import { Components } from "../utils/component.ts";
import { createCommand } from "./mod.ts";

import { BOT_COLOR } from "../../config.ts";
import {
  getAllDocs,
  getAllPackages,
  getDocs,
  resolveType,
  searchMethod,
} from "../utils/docs.ts";
import { Embeds } from "../utils/embed.ts";
import { notFound } from "../utils/notFound.ts";

const packages = await getAllPackages();

createCommand({
  name: "method",
  description: "Get documentation of JoshDB",
  type: ApplicationCommandTypes.ChatInput,
  scope: "Global",
  options: [
    {
      name: "method",
      description: "Method name",
      type: ApplicationCommandOptionTypes.String,
      required: true,
    },
    {
      name: "package",
      description: "Package name to search in",
      type: ApplicationCommandOptionTypes.String,
      required: false,
      choices: packages,
    },
  ],
  execute: async (bot, interaction) => {
    if (!interaction.data || !Array.isArray(interaction.data.options)) {
      return bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          data: { content: "Invalid interaction data" },
          type: InteractionResponseTypes.ChannelMessageWithSource,
        }
      );
    }

    const inputPackage = interaction.data.options.find(
      (x) => x.name === "package"
    )?.value as string;
    const inputMethod = interaction.data.options.find(
      (x) => x.name === "method"
    )?.value as string;

    let docs;
    let method;

    if (!inputPackage || inputPackage === "all") {
      docs = await getAllDocs();
      let all: ClassParser[] = [];
      for (const doc of docs) {
        all = [...all, ...doc.classes];
      }
      method = searchMethod(inputMethod, {
        classes: all,
      });
    } else {
      docs = await getDocs(inputPackage);
      method = searchMethod(inputMethod, docs);
    }

    if (!method) {
      return notFound(bot, interaction, "Method", inputMethod);
    }

    const embeds: Embeds = new Embeds(bot);

    for (const sig of method.signatures) {
      const embed = {
        title: `Josh.${sig.name}()`,
        color: BOT_COLOR,
        description: sig.comment.description ?? undefined,
        fields: [
          {
            name: "Parameters",
            value: sig.parameters
              .map((x) => `\`${x.name}\`: ${resolveType(x.type)}`)
              .join("\n"),
            inline: true,
          },
          {
            name: "Returns",
            value: sig.returnType.toString().split("typescript.").join(""),
            inline: true,
          },
        ],
      };
      if (sig.comment.example.length > 0) {
        embed.fields.push({
          name: "Example" + (sig.comment.example.length > 1 ? "s" : ""),
          value: sig.comment.example.map((x) => x.text).join(""),
          inline: false,
        });
      }
      embeds.addEmbed(embed);
    }
    await bot.helpers.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          embeds,
          components: new Components().addButton(
            "Source",
            "Link",
            `https://josh.evie.dev/${
              method.project.name.split("@joshdb/")[1]
            }/${method.name}`
          ),
        },
      }
    );
    return;
  },
});
