import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { auth } from './middlewares/auth.middleware';

export const router = Router();

router.get('/auth/discord/redirect', AuthController.discordRedirect);
router.get('/auth/discord/callback', AuthController.discordCallback);
router.post('/auth/discord/logout', AuthController.discordLogout);

router.get('/user/me', auth, UserController.me);
