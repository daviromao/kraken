import { client as bot } from './bot';
import { app as api } from './api';
import config from './config';

bot.login(config.DISCORD_TOKEN);

api.server.listen(config.API_PORT, () => {
  console.log(`🚀 Server is running on port ${config.API_PORT}`);
});
