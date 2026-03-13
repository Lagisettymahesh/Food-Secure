const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { validate, claimSchema } = require('../utils/validate');

// All NGO routes require valid JWT + ngo role
router.use(authenticateToken, authorizeRole(['ngo']));

router.post('/requests',  validate(claimSchema), ngoController.claimDonation);
router.get('/requests',   ngoController.getMyRequests);
router.get('/stats',      ngoController.getNgoStats);

module.exports = router;
