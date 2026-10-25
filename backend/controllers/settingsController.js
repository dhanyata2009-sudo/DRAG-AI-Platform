const Settings = require("../models/Settings");

// GET /api/settings - Get logged-in user's settings (creates default if none exist)
exports.getMySettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ userId: req.user._id });
        if (!settings) {
            settings = await Settings.create({ userId: req.user._id });
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT /api/settings - Update logged-in user's settings
exports.updateMySettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { userId: req.user._id },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
