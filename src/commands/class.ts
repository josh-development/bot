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
  searchClass,
} from "../utils/docs.ts";
import { createClassEmbed } from "../utils/joshEmbeds.ts";
import { notFound } from "../utils/notFound.ts";

const packages = await getAllPackages();

createCommand({
  name: "class",
  description: "Get documentation of JoshDB regarding a specific class",
  type: ApplicationCommandTypes.ChatInput,
  scope: "Global",
  options: [
    {
      name: "class",
      description: "Class name",
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
    const inputClass = interaction.data.options.find((x) => x.name === "class")
      ?.value as string;

    let docs;
    let cls;

    if (!inputPackage || inputPackage === "all") {
      docs = await getAllDocs();
      let all: ClassParser[] = [];
      for (const doc of docs) {
        all = [...all, ...doc.classes];
      }
      cls = searchClass(inputClass, {
        classes: all,
      });
    } else {
      docs = await getDocs(inputPackage);
      cls = searchClass(inputClass, docs);
    }

    if (!cls) {
      return notFound(bot, interaction, "Class", inputClass);
    }

    const embeds = createClassEmbed(bot, cls);

    return bot.helpers.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          embeds,
          components: new Components().addButton(
            "Source",
            "Link",
            cls.source?.url || "https://josh.evie.dev",
          ).addButton(
            "Website",
            "Link",
            `https://joshdocs.netlify.app/docs/${
              cls.project.name.split("/")[1]
            }/classes#${cls.name}`,
          ),
        },
      },
    );
  },
});
