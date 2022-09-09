import { BOT_COLOR } from "../../config.ts";
import {
  Bot,
  Interaction,
  InteractionResponseTypes,
  User,
} from "../../deps.ts";
import { Embeds } from "./embed.ts";

export const responses = [
  {
    text:
      "The hell you think this is, the dictionary? I don't know everything, and certainly not `{word}`!",
    user: 139412744439988224n,
  },
  {
    text: "`{word}`? `{word}`???? Since when was *that* a josh feature?",
    user: 139412744439988224n,
  },
  {
    text:
      "I'll have you know, punk, that I only do Josh, and `{word}` is definitely not a part of josh!",
    user: 139412744439988224n,
  },
  {
    text: "Bruh, `{word}` is not in josh lmao",
    user: 709674034798788618n,
  },
  {
    text: "Oof, `{word}` sounds like another thing for v2",
    user: 709674034798788618n,
  },
  {
    text: "Imagine searching `{word}`, couldn't be me",
    user: 709674034798788618n,
  },
  // Feel free to add more responses here lol
];

const randomResponse = () =>
  responses[Math.floor(Math.random() * responses.length)];

export const notFound = async (
  bot: Bot,
  interaction: Interaction,
  name: string,
  input: string,
) => {
  const res = randomResponse();
  const evie: User = await bot.helpers.getUser(res.user);
  return await bot.helpers.sendInteractionResponse(
    interaction.id,
    interaction.token,
    {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        embeds: new Embeds(bot)
          .setTitle(name + " not found")
          .setColor(BOT_COLOR)
          .setDescription(res.text.split("{word}").join(input))
          .setFooter(
            evie.username + "#" + evie.discriminator,
            bot.helpers.avatarURL(evie.id, evie.discriminator, {
              avatar: evie.avatar,
            }),
          ),
      },
    },
  );
};
