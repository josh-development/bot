import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  ClassParser,
  InteractionResponseTypes,
} from "../../deps.ts";
import { Components } from "../utils/component.ts";
import { createCommand } from "./mod.ts";

import {
  getAllDocs,
  getAllPackages,
  getDocs,
  searchMethod,
} from "../utils/docs.ts";
import { createMethodEmbed } from "../utils/joshEmbeds.ts";
import { notFound } from "../utils/notFound.ts";

const packages = await getAllPackages();

createCommand({
  name: "method",
  description: "Get documentation of JoshDB regarding a specific method",
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
        },
      );
    }

    const inputPackage = interaction.data.options.find(
      (x) => x.name === "package",
    )?.value as string;
    const inputMethod = interaction.data.options.find(
      (x) => x.name === "method",
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

    const embeds = createMethodEmbed(bot, method);

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
            method.source?.url || "https://josh.evie.dev",
          ),
        },
      },
    );
    return;
  },
});
