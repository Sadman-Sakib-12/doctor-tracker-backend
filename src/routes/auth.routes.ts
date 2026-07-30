import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { registerRules, loginRules } from '../validators/auth.validator';
import validate from '../middlewares/validate.middleware';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
