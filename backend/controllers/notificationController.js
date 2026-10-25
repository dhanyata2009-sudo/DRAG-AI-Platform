const Notification = require("../models/Notifications");

// Create a notification (usually called internally by other controllers)
exports.createNotification = async ({ userId, projectId, title, message, type }) => {
    return await Notification.create({ userId, projectId, title, message, type });
};

// GET /api/notifications - Get all notifications for logged-in user
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: notifications.length, notifications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/notifications/:id/read - Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/notifications/:id - Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!notification) {
            return res.status(404).json({ success: false, error: "Notification not found" });
        }
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
