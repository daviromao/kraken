import { Request, Response } from 'express';
import axios from 'axios';
import config from '../../config';
import prisma from '../../services/prisma';
import jwt from 'jsonwebtoken';
import { encrypt } from '../utils/encrypt';

export class AuthController {
  static async discordLogin(req: Request, res: Response): Promise<Response> {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Something went wrong' });
    }

    const formData = new URLSearchParams({
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: 'http://localhost:3000/auth/discord/redirect',
    });

    try {
      const response = await axios.post('https://discord.com/api/v10/oauth2/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { token_type, access_token } = response.data;

      const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
      });

      const data = userResponse.data;

      const discordUserData = {
        id: data.id,
        username: data.username,
        discriminator: data.discriminator,
        avatar: data.avatar,
        accessToken: encrypt(access_token.toString()),
      };

      const user = await prisma.discordUser.upsert({
        where: { id: data.id },
        update: discordUserData,
        create: discordUserData,
      });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        config.SECRET_PASSPHRASE as string,
        { expiresIn: '1day' },
      );

      return res.json({
        id: user.id,
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
      return res.status(400).json({ message: 'Something went wrong' });
    }
  }
}
