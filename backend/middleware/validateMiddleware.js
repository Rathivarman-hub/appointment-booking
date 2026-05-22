import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/responseHelper.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ');
    return errorResponse(res, messages, 422);
  }
  next();
};

export { validate };
