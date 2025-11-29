const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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

    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    age: {
        type: Number
    },
    gender: {
        type: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String
    },
    DOB: {
        type: Date
    }
}, {
    timestamps: true
})

userSchema.pre("save", function (next) {
    if (this.DOB) {
        this.DOB = new Date(this.DOB.toISOString.split("T")[0])
    }
})


module.exports = mongoose.model("User", userSchema);