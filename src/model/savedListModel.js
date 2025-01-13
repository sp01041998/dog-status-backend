const mongoose = require("mongoose");

const savedListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    savedImages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'imageCode',
            required: true,
        }
    ],
    listName : {
        type: String,
        required: true,
        trim: true,
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, { timestamps: true });

module.exports = mongoose.model('SavedList', savedListSchema);
