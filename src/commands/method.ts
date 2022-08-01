import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  InteractionResponseTypes,
} from "../../deps.ts";
import { createCommand } from "./mod.ts";

import { getDocs, getPackages, searchMethod } from "../utils/docs.ts";
import { Embeds } from "../utils/embed.ts";
import { BOT_COLOR } from "../../config.ts";

const packages = (await getPackages()).map((x) => ({
  name: x.name,
  value: x.name,
}));

const responses = [
  "The hell you think this is, the dictionary? I don't know everything, and certainly not `{word}`!",
  "`{word}`? `{word}`???? Since when was *that* a josh feature?",
  "I'll have you know, punk, that I only do Josh, and `{word}` is definitely not a method in josh!",
];

// const getTypeArgs = (param: ParameterParser.JSON): string => {
//   if (param.typeArguments.length > 0) {
//     return (
//       param.name +
//       "<" +
//       param.typeArguments.map((x) => getTypeArgs(x)).join(", ") +
//       ">"
//     );
//   } else {
//     return param.name;
//   }
// };

// const getPackageName = (
//   param: ParameterParser.JSON
// ): { package: string; name: string } | undefined => {
//   if (!param.packageName) return { package: "core", name: param.name };

//   if (param.packageName.startsWith("@joshdb/")) {
//     return {
//       package: param.packageName.split("@joshdb/")[1],
//       name: param.name,
//     };
//   } else {
//     for (const typeArg of param.typeArguments) {
//       const name = getPackageName(typeArg);
//       if (name) {
//         return name;
//       }
//     }
//     return undefined;
//   }
// };

// const resolveReference = (param: ParameterParser.JSON) => {
//   const annotated = getTypeArgs(param);

//   const output = getPackageName(param);

//   if (!output) return annotated;

//   return `[${annotated}](https://josh.evie.dev/${output.package}/${output.name})`;
// };

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

    return await bot.helpers.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          embeds: new Embeds(bot)
            .setTitle(`Josh.${method.name}()`)
            .setColor(BOT_COLOR)
            .addField(
              "Parameters",
              method.signatures[0].parameters
                .map((x) => `\`${x.name}\`:  ${x.type.kind}`)
                .join("\n"),
              true
            ),
          // .addField(
          //   "Returns",
          //   `*${
          //     method.signatures[0].returnType.kind === "reference"
          //       ? resolveReference(method.signatures[0].returnType)
          //       : method.signatures[0].returnType.type
          //   }*`,
          //   true
          // ),
        },
      }
    );
  },
});
