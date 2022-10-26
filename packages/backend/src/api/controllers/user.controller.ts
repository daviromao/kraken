import { Request, Response } from 'express';

export class UserController {
  static async me(req: Request, res: Response): Promise<Response> {
    const user = res.locals.discordUser;
    return res.json(user);
  }
}
