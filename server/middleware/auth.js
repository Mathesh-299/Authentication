const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    const tokenHeader = req.header("Authorization");
    if (!tokenHeader) {
        return res.status(409).json({ message: "Token is Not Provided", status: "FAILED" });
    }
    const token = tokenHeader.split(" ")[1];
    if (!token) {
        res.status(500).json({ message: "No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
}

module.exports = { auth };