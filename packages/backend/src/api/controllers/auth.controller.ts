import { Request, Response } from 'express';
import axios from 'axios';
import config from '../../config';
import { DiscordUser } from '@kraken/shared/interfaces/DiscordUser';
import prisma from '../../services/prisma';
import jwt from 'jsonwebtoken';
import { encrypt } from '../utils/encrypt';

export class AuthController {
  static async discordRedirect(req: Request, res: Response): Promise<void> {
    const { code } = req.query;

    if (!code) {
      return res.redirect('http://localhost:3000');
    }

    const formData = new URLSearchParams({
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: 'http://localhost:3333/auth/discord/redirect',
    });

    try {
      const response = await axios.post('https://discord.com/api/v10/oauth2/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { token_type, access_token } = response.data;
      const params = new URLSearchParams({ token_type, access_token });

      return res.redirect(`http://localhost:3000/auth/discord?${params.toString()}`);
    } catch (error) {
      console.log(error);
      return res.redirect('http://localhost:3000');
    }
  }

  static async discordCallback(req: Request, res: Response): Promise<Response> {
    const { token_type, access_token } = req.query;

    if (!token_type || !access_token) {
      return res.status(400).json({ message: 'Missing token' });
    }

    try {
      const response = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
      });

      const data = response.data;

      const discordUserData: DiscordUser = {
        discordId: data.id,
        username: data.username,
        discriminator: data.discriminator,
        avatar: data.avatar,
        accessToken: encrypt(access_token.toString()),
      };

      const user = await prisma.discordUser.upsert({
        where: { discordId: data.id },
        update: discordUserData,
        create: discordUserData,
      });

      const token = jwt.sign(
        { id: user.id, discordId: user.discordId },
        config.SECRET_PASSPHRASE as string,
        { expiresIn: '1day' },
      );

      return res.json({
        id: user.id,
        discordId: user.discordId,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
        token,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'Something went wrong' });
    }
  }

  static async discordLogout(req: Request, res: Response): Promise<Response> {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(400).json({ message: 'Missing token' });
    }

    try {
      const formData = new URLSearchParams({
        token: token.toString(),
        client_id: config.CLIENT_ID,
        client_secret: config.SECRET_PASSPHRASE,
      });

      const revokeUrl = 'https://discord.com/api/v10/oauth2/token/revoke';
      const response = await axios.post(revokeUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return res.json(response.status);
    } catch (error) {
      console.log(error);

      return res.status(400).json({ message: 'Something went wrong' });
    }
  }
}
