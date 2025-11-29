const tempUser = require("../models/tempUser");
const User = require("../models/user");
const getAge = require("../utils/calculateAge");
const { generateToken } = require("../utils/jwtTokenGenerate");
const { generateOTP, otpExpiry } = require("../utils/otpGenerater").default
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../utils/mailer");

exports.registerUser = async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;
    // console.log(username)
    try {
        if (!username || !email || !password || !phoneNumber) {
            return res.status(400).json({ message: "All fields are required", status: "FAILED" });
        }
        if (password.length < 6 || password.length > 16) {
            return res.status(400).json({ message: "Password must be between 6 and 16 characters", status: "FAILED" });
        }
        if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ message: "Phone number must be 10 digits", status: "FAILED" });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { username }, { phoneNumber }] });
        // console.log(existingUser)
        if (existingUser) {
            return res.status(409).json({ message: "User with provided email, username or phone number already exists", status: "FAILED" });
        }
        const emailFind = await tempUser.findOne({ email });
        if (emailFind) {
            await tempUser.deleteMany({ email });
        }
        const otpValue = await generateOTP();
        const otpExpiryTime = Date.now() + 10 * 60 * 1000;
        const hashPassword = await bcrypt.hash(password, 10);
        await sendVerificationEmail(email, otpValue);
        const tempUserDetails = new tempUser({ username, email, password: hashPassword, phoneNumber, verificationToken: otpValue, otpExpiry: otpExpiryTime });
        await tempUserDetails.save();
        res.status(201).json({ message: "Registration successful! Please verify your email.", status: "PENDING" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error", status: "FAILED", });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(409).json({ message: "Invalid Credentials for email", status: "FAILED" })
        }

        const passwordChecking = await bcrypt.compare(password, user.password);

        if (!passwordChecking) {
            return res.status(409).json({ message: "Invalid Credentials for password", status: "FAILED" });
        }

        const token = generateToken({
            id: user._id,
            email: user.email
        });

        res.status(200).json({ token, user, message: "Login Successful", status: "SUCCESS" });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", status: "FAILED" })
    }
}
exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required", status: "FAILED" });
        }
        if (otp.length !== 4 && otp.length < 4 && otp.length > 4) {
            return res.status(400).json({ message: "OTP must be 4 digits", status: "FAILED" });
        }
        const tempUserDetails = await tempUser.findOne({ email });
        if (!tempUserDetails) {
            return res.status(404).json({ message: "No pending verification found for this email", status: "FAILED" });
        }
        if (tempUserDetails.verificationToken !== otp) {
            return res.status(400).json({ message: "Invalid OTP", status: "FAILED" });
        }
        if (Date.now() > otpExpiry) {
            return res.status(400).json({ message: "OTP has expired", status: "FAILED" });
        }

        let user = tempUserDetails._id;
        if (!user) {
            const newUser = new User({
                username: tempUserDetails.username,
                email: tempUserDetails.email,
                password: tempUserDetails.password,
                phoneNumber: tempUserDetails.phoneNumber,
                isVerified: true
            })
            await newUser.save();
        } else {
            user.email = tempRecord.email;
            await user.save();
        }
        await tempUser.deleteMany({ email });
        res.status(200).json({ message: "Email verified successfully!", status: "SUCCESS" })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "Internal Server Error", status: "FAILED" });
    }
}

exports.resendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required", status: "FAILED" });
        }
        const tempUserDetails = await tempUser.findOne({ email });
        if (!tempUserDetails) {
            return res.status(404).json({ message: "No pending verification found for this email", status: "FAILED" });
        }
        const resendOTP = await generateOTP();
        const otpExpiry = await otpExpiry();
        tempUserDetails.verificationToken = resendOTP;
        tempUserDetails.otpExpiry = otpExpiry;
        await tempUserDetails.save();
        await sendVerificationEmail(email, resendOTP);
        res.status(200).json({ message: "OTP resent successfully", status: "SUCCESS" });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", status: "FAILED" });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const emailFound = await User.findOne({ email });
        if (!emailFound) {
            return res.status(409).json({ message: "Email is not exists", status: "SUCCESS" });
        }
        const verificationToken = crypto.randomBytes(32).toString("hex");

        await sendResetPasswordEmail(email, verificationToken);
        res.status(200).json({ messagge: "Click to your email to verify your password", status: "SUCCESS" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", status: "FAILED" })
    }
}


exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const emailVerify = await User.findOne({ email });
        if (!emailVerify) {
            return res.status(409).json({ message: "Email is Not Verified", status: "FAILED" })
        }
        const newHasPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email }, { $set: { password: newHasPassword } })
        res.status(200).json({ message: "Password Updated Successfully", status: "SUCCESS" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", status: "FAILED" });
    }
}

exports.getUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        // console.log(user)
        if (!user) {
            return res.status(409).json({ message: "User Not Found", status: "FAILED" });
        }
        res.status(200).json({ user, message: "User Successfully Retrieved", status: "SUCCESS" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", status: "FAILED" });
    }
}

exports.editProfile = async (req, res) => {
    try {
        const { username, DOB, address, phoneNumber, password, gender, email, age } = req.body;
        const id = req.params.id;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (email && email !== user.email) {

            const otp = await generateOTP();
            const otpExpirys = await otpExpiry();
            const newTemp = new tempUser({
                email
            })

            await user.save();
            await sendOtpEmail(email, otp);

            return res.json({ message: "OTP sent", status: "OTP_REQUIRED" });
        }

        user.username = username || user.username;
        user.DOB = DOB || user.DOB;
        user.address = address || user.address;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.gender = gender || user.gender;
        user.age = age || Date.now() - getAge(DOB);

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.json({ message: "Profile updated", status: "SUCCESS" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
