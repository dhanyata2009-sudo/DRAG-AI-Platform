const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
       
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },

        
        title: {
            type: String,
            required: true,
            trim: true,
        },

        
        message: {
            type: String,
            required: true,
            trim: true,
        },

        
        type: {
            type: String,
            enum: [
                "project",
                "script",
                "video",
                "ppt",
                "system",
            ],
            default: "system",
        },

        
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Notification", notificationSchema);