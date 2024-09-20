import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import { Document } from 'mongoose';

// Add this interface
interface UserDocument extends Document {
    // Add relevant user properties here
    _id: string;
    // ... other properties
}

interface AuthRequest extends Request {
    user?: UserDocument;
}

// Update the function signature
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        try{
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user = await User.findById((decoded as jwt.JwtPayload).id).select('-password');
            next();
        } catch {
            res.status(401).json({message: "Not authorized, token failed."});
        }
    }

    if(!token){
        res.status(401).json({message: "Not authorized, no token."});
    }
}