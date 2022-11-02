import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} from 'discord.js';
import { client } from '../index';
import prisma from '../../services/prisma';
import { scheduleGiveaway } from '../../tasks/giveaway';

export async function execute(interaction: ButtonInteraction) {
  const [, id, option] = interaction.customId.split(':');
  if (option === 'start') {
    start(id, interaction);
  } else if (option === 'cancel') {
    cancel(id, interaction);
  } else if (option === 'enter') {
    enter(id, interaction);
  }
}

async function start(id: string, interaction: ButtonInteraction) {
  const message = interaction.message;
  const row = new ActionRowBuilder<ButtonBuilder>(message.components[0].toJSON());

  row.components[0].setDisabled(true);
  row.components[2].setDisabled(true);

  const giveaway = await prisma.giveaway.findUniqueOrThrow({ where: { id } });
  const channel = await client.channels.fetch(giveaway.channelId);

  if (!channel || !channel.isTextBased()) return;

  giveaway.endsAt = new Date(Date.now() + giveaway.duration);

  const rowEnter = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway:${giveaway.id}:enter`)
        .setLabel('Enter')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎉'),
    )
    .addComponents(
      new ButtonBuilder()
        .setLabel('View Giveaway')
        .setStyle(ButtonStyle.Link)
        .setURL('https://google.com'),
    );

  const embed = new EmbedBuilder()
    .setColor('#158060')
    .setTitle(giveaway.prize)
    .setDescription('Enter in giveaway to win!')
    .addFields(
      {
        name: 'Ends at',
        value: `<t:${Math.floor(giveaway.endsAt.getTime() / 1000)}:R>`,
        inline: true,
      },
      {
        name: 'Hosted by',
        value: `<@${interaction.user.id}>`,
        inline: true,
      },
    );

  const startedMessage = await channel.send({
    embeds: [embed],
    components: [rowEnter],
  });

  giveaway.messageId = startedMessage.id;

  await prisma.giveaway.update({
    where: { id },
    data: giveaway,
  });

  await message.edit({
    content: 'Giveaway started!',
    components: [row],
  });

  scheduleGiveaway(giveaway);

  await interaction.reply({
    content: `Giveaway started at <#${giveaway.channelId}>`,
    ephemeral: true,
  });
}

async function cancel(id: string, interaction: ButtonInteraction) {
  console.log(id, interaction);
}

async function enter(id: string, interaction: ButtonInteraction) {
  await prisma.giveaway.update({
    where: { id },
    data: {
      entries: {
        connectOrCreate: {
          where: { id: interaction.user.id },
          create: {
            id: interaction.user.id,
            discriminator: interaction.user.discriminator,
            username: interaction.user.username,
          },
        },
      },
    },
  });

  const embed = new EmbedBuilder().setDescription('✅ Giveaway entered!').setColor(Colors.DarkAqua);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
