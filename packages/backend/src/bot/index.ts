import { Client, Events } from 'discord.js';
import * as commandModules from './commands';
import * as buttonModules from './buttons';
import prisma from '../services/prisma';
import { scheduleGiveaway } from '../tasks/giveaway';

const commands = Object(commandModules);
const buttons = Object(buttonModules);
const slashData = Object.values(commandModules).map((command) => command.data);

export const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
});

client.once('ready', async () => {
  try {
    await client.application?.commands.set(slashData).then(() => {
      console.log('Successfully registered application commands.');
    });

    const giveaways = await prisma.giveaway.findMany({
      where: { ended: false },
    });

    for (const giveaway of giveaways) {
      scheduleGiveaway(giveaway);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  console.log('🤖 Bot is ready!');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  commands[commandName].execute(interaction);
});

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isButton()) return;
  const { customId } = interaction;
  const [commandName] = customId.split(':');
  buttons[commandName].execute(interaction, client);
});
