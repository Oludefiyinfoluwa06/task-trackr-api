const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const org = require('../controllers/organization');

router.post('/invite', auth, org.invite);

module.exports = router;
