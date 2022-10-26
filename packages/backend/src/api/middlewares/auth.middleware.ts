import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import prisma from '../../services/prisma';

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, config.SECRET_PASSPHRASE as Secret) as JwtPayload;

    const discordUser = await prisma.discordUser.findUniqueOrThrow({
      where: {
        discordId: decoded.discordId,
      },
    });

    if (!discordUser) throw new Error('User not found');

    res.locals.discordUser = discordUser;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
