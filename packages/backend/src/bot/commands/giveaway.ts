import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import ms from 'ms';
import prisma from '../../services/prisma';

const MINUTE_IN_MS = 60 * 1000;

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Create a giveway.')
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('The channel to send the giveway message.')
      .setRequired(true)
      .addChannelTypes(ChannelType.GuildText),
  )
  .addStringOption((option) =>
    option
      .setName('prize')
      .setDescription('The prizes for the giveway.')
      .setRequired(true)
      .setMinLength(3),
  )
  .addStringOption((option) =>
    option.setName('duration').setDescription('The duration of the giveway.').setRequired(true),
  )
  .addIntegerOption((option) =>
    option.setName('winners').setDescription('The number of winners.').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false);

export async function execute(interaction: CommandInteraction) {
  const channel = interaction.options.get('channel', true).value as string;
  const prize = interaction.options.get('prize', true).value as string;
  const duration = interaction.options.get('duration', true).value as string;
  const winners = interaction.options.get('winners', true).value as number;
  const durationInMs = convertDurationToMs(duration);

  if (!durationInMs) {
    return interaction.reply({
      content: 'Please provide a valid duration.',
      ephemeral: true,
    });
  }

  const giveaway = await prisma.giveaway.create({
    data: {
      winnersCount: winners,
      prize,
      duration: durationInMs,
      channelId: channel,
      guildId: interaction.guildId as string,
    },
  });

  const embed = new EmbedBuilder()
    .setColor('#158060')
    .setTitle('🎉 Giveaway 🎉')
    .setDescription(prize)
    .addFields(
      {
        name: 'Duration',
        value: ms(durationInMs, { long: true }),
        inline: true,
      },
      {
        name: 'Hosted by',
        value: `<@${interaction.user.id}>`,
        inline: true,
      },
    );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway:${giveaway.id}:start`)
        .setLabel('Start')
        .setStyle(ButtonStyle.Success),
    )
    .addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('View/Edit')
        .setURL('https://google.com'),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`giveaway:${giveaway.id}:cancel`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger),
    );

  await interaction.reply({ embeds: [embed], components: [row] });
}

function convertDurationToMs(duration: string): number | null {
  if (!isNaN(Number(duration))) {
    return Number(duration) * MINUTE_IN_MS;
  } else if (typeof duration === 'string') {
    return ms(duration);
  } else {
    return null;
  }
}
