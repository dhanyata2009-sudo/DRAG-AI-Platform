const History = require("../models/History");

// Create a history log entry (usually called internally by other controllers)
exports.createHistoryLog = async ({ userId, projectId, action, entityType, entityId, description }) => {
    return await History.create({ userId, projectId, action, entityType, entityId, description });
};

// GET /api/history - Get all history for logged-in user
exports.getMyHistory = async (req, res) => {
    try {
        const history = await History.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: history.length, history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/history/:id - Get a single history entry
exports.getHistoryById = async (req, res) => {
    try {
        const entry = await History.findOne({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            return res.status(404).json({ success: false, error: "History entry not found" });
        }
        res.status(200).json({ success: true, entry });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE /api/history/:id - Delete a history entry
exports.deleteHistory = async (req, res) => {
    try {
        const entry = await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            return res.status(404).json({ success: false, error: "History entry not found" });
        }
        res.status(200).json({ success: true, message: "History entry deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
