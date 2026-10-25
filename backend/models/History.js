const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
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

        
        action: {
            type: String,
            enum: [
                "PROJECT_CREATED",
                "PROJECT_UPDATED",
                "PROJECT_DELETED",
                "SCRIPT_GENERATED",
                "SCRIPT_UPDATED",
                "VIDEO_GENERATED",
                "VIDEO_COMPLETED",
                "PPT_GENERATED",
            ],
            required: true,
        },

        
        entityType: {
            type: String,
            enum: [
                "Project",
                "Script",
                "Video",
                "PPT",
            ],
            required: true,
        },

        
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

       
        description: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("History", historySchema);