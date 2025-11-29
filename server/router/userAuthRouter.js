const express = require("express");
const {
    registerUser,
    login,
    verifyEmail,
    resendOTP,
    forgotPassword,
    resetPassword,
    editProfile,
    getUser } = require("../controller/userController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/otp-verification", verifyEmail);
router.post("/resentOTP", resendOTP);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);
router.put("/editProfile", editProfile);
router.get("/userDetails/:id", auth, getUser);

module.exports = router