import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  ClassMethodParser,
  ClassParser,
  EnumParser,
  InteractionResponseTypes,
} from "../../deps.ts";
import { Components } from "../utils/component.ts";
import { createCommand } from "./mod.ts";

import {
  getAllDocs,
  getAllPackages,
  getDocs,
  searchEverything,
} from "../utils/docs.ts";
import {
  createClassEmbed,
  createEnumEmbed,
  createMethodEmbed,
} from "../utils/joshEmbeds.ts";
import { notFound } from "../utils/notFound.ts";

const packages = await getAllPackages();

createCommand({
  name: "docs",
  description: "Get documentation of JoshDB",
  type: ApplicationCommandTypes.ChatInput,
  scope: "Global",
  options: [
    {
      name: "name",
      description: "Name to search for",
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
    const inputName = interaction.data.options.find((x) => x.name === "name")
      ?.value as string;

    let docs;
    let name;

    if (!inputPackage || inputPackage === "all") {
      docs = await getAllDocs();

      name = searchEverything(inputName, docs);
    } else {
      docs = await getDocs(inputPackage);
      name = searchEverything(inputName, [docs]);
    }

    if (!name) {
      return notFound(bot, interaction, "Input", inputName);
    }

    let embeds;

    if (name instanceof ClassParser) {
      embeds = createClassEmbed(bot, name);
    }

    if (name instanceof ClassMethodParser) {
      embeds = createMethodEmbed(bot, name);
    }

    if (name instanceof EnumParser) {
      embeds = createEnumEmbed(bot, name);
    }

    if (!embeds) {
      return notFound(bot, interaction, "Type", inputName); // Shouldn't happen...
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
            name.source?.url || "https://josh.evie.dev"
          ),
        },
      }
    );
    return;
  },
});
