import { Client } from 'discord.js';
import config from '../config';
import * as commandModules from './commands';

const commands = Object(commandModules);
const slashData = Object.values(commandModules).map((command) => command.data);

export const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'DirectMessages'],
});

client.once('ready', async () => {
  try {
    await client.application?.commands.set(slashData).then(() => {
      console.log('Successfully registered application commands.');
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  console.log('🤖 Bot is ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  commands[commandName].execute(interaction, client);
});

client.login(config.DISCORD_TOKEN);
