const mongoose = require("mongoose")

const tempUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 60
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    verificationToken: {
        type: String,
        required: true
    },
    otpExpiry: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("TempUser", tempUserSchema);