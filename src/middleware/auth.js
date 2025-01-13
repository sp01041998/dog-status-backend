const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel'); 

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'No token provided. Access denied.' });
    }
    try {
        const decoded =     jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
};

module.exports = authenticateToken;
