import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);
router.get('/stats', getStats);

export default router;
