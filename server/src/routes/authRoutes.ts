import { Router } from 'express';
import {
  forgotPassword,
  googleLogin,
  login,
  logout,
  resetPassword,
  signUp,
} from '../controllers/authController';
import refreshTokenHandler from '../controllers/refreshTokenController';
import {
  forgotPasswordLimiter,
  loginLimiter,
  signupLimiter,
} from '../middleware/rateLimiters';

const router = Router();

router.post('/signup', signupLimiter, signUp);
router.post('/login', loginLimiter, login);
router.get('/logout', logout);

router.post('/google', loginLimiter, googleLogin);

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/refresh', refreshTokenHandler);

export default router;
