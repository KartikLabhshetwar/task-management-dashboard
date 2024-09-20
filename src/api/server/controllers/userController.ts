import User from '../models/userModel';
import type { IUser } from '../models/userModel';
import jwt from "jsonwebtoken";
import { Request, Response } from 'express';

const generateToken = (id: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    return jwt.sign({id}, secret, {expiresIn: "30d"});
}

export const registerUser = async (req: Request, res: Response) => {
    try {
        const {name, email, password} = req.body;
        const userExists = await User.findOne({email});
        if (userExists) {
            res.status(400).json({message: "User already exists"});
        }
        const user = await User.create({name, email, password});
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id as string),
        });
    } catch (error: unknown) {
        res.status(500).json({message: error instanceof Error ? error.message : 'An unknown error occurred'});
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email}) as IUser | null;
        if(user && (await user.matchPassword(password))){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id as string),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password"});
        }
    } catch (e: unknown){
        res.status(500).json({message: e instanceof Error ? e.message : 'An unknown error occurred'});
    }
}

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req.user as IUser)._id).select('-password');
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error: unknown) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};

