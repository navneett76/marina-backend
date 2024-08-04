// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET; // Replace with your actual secret key

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  console.log("usertoken: ", token);
  console.log("SECRET_KEY: ", SECRET_KEY);
  try {
    const decoded = jwt.verify(token, SECRET_KEY || 'NDKELI98274672NDI373NFKSIEkjsheu3323') as {id: number};
    console.log("Decode value: ", decoded, decoded.id);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error });
  }
};

// Extend the Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
