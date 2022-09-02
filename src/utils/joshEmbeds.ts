import { BOT_COLOR } from "../../config.ts";
import type {
  Bot,
  ClassMethodParser,
  ClassParser,
  EnumParser,
} from "../../deps.ts";
import { resolveType } from "./docs.ts";
import { Embeds } from "./embed.ts";

export const createClassEmbed = (bot: Bot, cls: ClassParser) => {
  const embeds: Embeds = new Embeds(bot)
    .setTitle(cls.name)
    .setColor(BOT_COLOR)
    .setDescription(cls.comment.description ?? "No description")
    .addField(
      "Params",
      cls.construct.parameters
        .map((x) => `\`${x.name}\`: ${x.type.toString()}`)
        .join("\n") ?? "No params"
    );

  if (cls.comment.example.length > 0) {
    embeds.addField("Example", cls.comment.example.map((x) => x.text).join(""));
  }
  return embeds;
};

export const createMethodEmbed = (bot: Bot, method: ClassMethodParser) => {
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
  return embeds;
};

export const createEnumEmbed = (bot: Bot, enu: EnumParser) => {
  const embeds: Embeds = new Embeds(bot)
    .setColor(BOT_COLOR)
    .setTitle(enu.name)
    .addField(
      "Values",
      enu.properties.map((x) => "`" + x.name + "`").join(" ")
    );

  if (enu.comment.example.length > 0) {
    embeds.addField("Example", enu.comment.example.map((x) => x.text).join(""));
  }
  return embeds;
};
