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
  responses,
  searchClass,
} from "../utils/docs.ts";
import { Embeds } from "../utils/embed.ts";

const packages = await getAllPackages();

createCommand({
  name: "class",
  description: "Get documentation of JoshDB",
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
      return await bot.helpers.sendInteractionResponse(
        interaction.id,
        interaction.token,
        {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            embeds: new Embeds(bot)
              .setTitle("Method not found")
              .setColor(BOT_COLOR)
              .setDescription(
                responses[Math.floor(Math.random() * responses.length)]
                  .split("{word}")
                  .join(inputClass),
              ),
          },
        },
      );
    }

    const embeds: Embeds = new Embeds(bot)
      .setTitle(cls.name)
      .setColor(BOT_COLOR)
      .setDescription(cls.comment.description ?? "No description")
      .addField(
        "Params",
        cls.construct.parameters
          .map((x) => `${x.name}: ${x.type.toString()}`)
          .join(", ") ?? "No params",
      );

    if (cls.comment.example.length > 0) {
      embeds.addField(
        "Example",
        cls.comment.example.map((x) => x.text).join(""),
      );
    }

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
            `https://josh.evie.dev/${
              cls.project.name.split("@joshdb/")[1]
            }/${cls.name}`,
          ),
        },
      },
    );
  },
});
