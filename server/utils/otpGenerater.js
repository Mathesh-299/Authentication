const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
const otpExpiry = Date.now() + 10 * 60 * 1000;


export default {
    generateOTP, otpExpiry
};