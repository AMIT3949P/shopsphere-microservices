const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

router.post('/', createNotification);
router.get('/', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;
