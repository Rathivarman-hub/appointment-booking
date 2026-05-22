import { verifyToken } from '../utils/jwtHelper.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/responseHelper.js';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Not authorized, no token', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return errorResponse(res, 'User not found', 401);
    if (!user.isActive) return errorResponse(res, 'Account is deactivated', 403);

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Role '${req.user.role}' is not authorized for this route`, 403);
    }
    next();
  };
};

export { protect, authorize };
