import type Prisma from '@prisma/client';
import { EmbedBuilder } from 'discord.js';

import scheduler from 'node-schedule';
import { client } from '../bot';
import prisma from '../services/prisma';

export async function scheduleGiveaway(giveaway: Prisma.Giveaway) {
  const { id, endsAt, ended } = giveaway;
  if (ended || !endsAt) return;
  if (endsAt > new Date()) {
    scheduler.scheduleJob(endsAt, () => endGiveaway(id));
  } else {
    endGiveaway(id);
  }
}

async function endGiveaway(id: string) {
  const giveaway = await prisma.giveaway.findUniqueOrThrow({
    where: { id },
    include: { entries: true },
  });

  const channel = await client.channels.fetch(giveaway.channelId);
  if (!channel || !channel.isTextBased()) return;

  if (giveaway.entries.length === 0) {
    await prisma.giveaway.delete({ where: { id } });
    await channel.send({ content: `Giveaway for ${giveaway.prize} ended with no entries` });
    return;
  }

  const shuffledEntries = giveaway.entries.sort(() => 0.5 - Math.random());
  const totalWinners = Math.min(shuffledEntries.length, giveaway.winnersCount);
  const winners = shuffledEntries.slice(0, totalWinners);

  await prisma.giveaway.update({
    where: { id },
    data: {
      winners: {
        connect: winners.map((winner) => ({ id: winner.id })),
      },
      ended: true,
    },
  });

  const winnersString = winners.map((winner) => `<@${winner.id}>`).join(', ');

  const message = await channel.messages.fetch(giveaway.messageId ?? '');
  if (message) {
    const embedGiveaway = message.embeds[0];
    const editedEmbedMenssage = new EmbedBuilder(embedGiveaway.toJSON()).addFields({
      name: 'Winners',
      value: winnersString,
    });

    await message.edit({ embeds: [editedEmbedMenssage] });
  }

  await channel.send({
    content: `Giveaway for **${giveaway.prize}** ended! Winners: ${winnersString}`,
  });
}
