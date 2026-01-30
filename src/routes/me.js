const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const me = require('../controllers/me');

router.get('/', auth, me.getProfile);
router.put('/', auth, me.updateProfile);
router.post('/change-password', auth, me.changePassword);
router.delete('/', auth, me.deleteAccount);

module.exports = router;
