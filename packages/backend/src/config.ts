import dotenv from 'dotenv';
dotenv.config();

const { CLIENT_ID, CLIENT_SECRET, DISCORD_TOKEN, API_PORT, SECRET_PASSPHRASE } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !DISCORD_TOKEN || !API_PORT || !SECRET_PASSPHRASE) {
  throw new Error('Missing environment variables');
}

const config: Record<string, string> = {
  CLIENT_ID,
  DISCORD_TOKEN,
  CLIENT_SECRET,
  API_PORT,
  SECRET_PASSPHRASE,
};

export default config;
