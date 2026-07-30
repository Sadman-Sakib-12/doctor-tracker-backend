const router = require('express').Router();
const { getStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);
router.get('/stats', getStats);

module.exports = router;
