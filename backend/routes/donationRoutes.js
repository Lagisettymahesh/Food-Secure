const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { validate, donationSchema } = require('../utils/validate');

// Public: nearby donations (NGOs & volunteers can browse)
router.get('/nearby', donationController.getNearbyDonations);

// Protected: donor creates donation (must be authenticated + donor role)
router.post('/', authenticateToken, authorizeRole(['donor']), validate(donationSchema), donationController.createDonation);

// Protected: donor sees their own donations + real stats
router.get('/my', authenticateToken, authorizeRole(['donor']), donationController.getMyDonations);

module.exports = router;
