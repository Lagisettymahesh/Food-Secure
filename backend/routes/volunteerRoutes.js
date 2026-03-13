const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { validate, taskStatusSchema } = require('../utils/validate');

// All volunteer routes require valid JWT + volunteer role
router.use(authenticateToken, authorizeRole(['volunteer']));

router.get('/tasks',                  volunteerController.getMyTasks);
router.get('/tasks/available',        volunteerController.getAvailableTasks);
router.patch('/tasks/:id/status',     validate(taskStatusSchema), volunteerController.updateTaskStatus);
router.get('/stats',                  volunteerController.getVolunteerStats);

module.exports = router;
