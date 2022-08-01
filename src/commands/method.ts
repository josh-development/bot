import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  InteractionResponseTypes,
  ReferenceTypeParser,
  TypeParser,
} from "../../deps.ts";
import { createCommand } from "./mod.ts";

import { BOT_COLOR } from "../../config.ts";
import { getDocs, getPackages, searchMethod } from "../utils/docs.ts";
import { Embeds } from "../utils/embed.ts";

const packages = (await getPackages()).map((x) => ({
  name: x.name,
  value: x.name,
}));

const responses = [
  "The hell you think this is, the dictionary? I don't know everything, and certainly not `{word}`!",
  "`{word}`? `{word}`???? Since when was *that* a josh feature?",
  "I'll have you know, punk, that I only do Josh, and `{word}` is definitely not a method in josh!",
];

const resolveReferenceType = (type: ReferenceTypeParser) => {
  const { packageName, name } = type;
  return `[${name}](https://josh.evie.dev/${
    (packageName || "core")?.split("@joshdb/")[1]
  }/${name})`;
};

const resolveType = (type: TypeParser) => {
  if (type instanceof ReferenceTypeParser) {
    return resolveReferenceType(type);
  }

  return type.toString();
};

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

    const docs = await getDocs(inputPackage);

    const inputMethod = interaction.data.options.find(
      (x) => x.name === "method"
    )?.value as string;

    const method = searchMethod(inputMethod, docs);

    if (!method) {
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
                  .join(inputMethod)
              ),
          },
        }
      );
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
            value: sig.returnType.toString(),
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

    return bot.helpers.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          embeds,
          // components: new Components().addButton(
          //   "Source",
          //   "Link",
          //   "https://josh.evie.dev"
          // ),
        },
      }
    );
  },
});
