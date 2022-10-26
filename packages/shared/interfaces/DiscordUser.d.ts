export interface DiscordUser {
  id?: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar?: string;
  accessToken: string;
}