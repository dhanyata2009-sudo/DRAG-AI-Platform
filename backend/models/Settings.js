const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        
        theme: {
            type: String,
            enum: ["light", "dark", "system"],
            default: "system",
        },

        
        language: {
            type: String,
            default: "English",
            trim: true,
        },

        
        defaultPlatform: {
            type: String,
            default: "Instagram",
            trim: true,
        },

        
        emailNotifications: {
            type: Boolean,
            default: true,
        },

        pushNotifications: {
            type: Boolean,
            default: true,
        },

        
        autoSave: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Settings", settingsSchema);