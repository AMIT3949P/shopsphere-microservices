const Notification = require('../models/Notification');

exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, metadata } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and message are required.',
      });
    }

    const notification = await Notification.create({
      userId,
      type: type || 'ORDER_CREATED',
      title,
      message,
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create notification.',
    });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.read).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to mark notification as read.',
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read.',
    });
  }
};
