const router = require('express').Router();
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { registerRules, loginRules } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
