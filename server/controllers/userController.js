import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    return jwt.sign({id}, secret, {expiresIn: "30d"});
};

const registerUser = async (req, res) => {
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
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({message: error.message || 'An unknown error occurred'});
    }
};

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(user && (await user.matchPassword(password))){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password"});
        }
    } catch (e){
        res.status(500).json({message: e.message || 'An unknown error occurred'});
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'An unknown error occurred' });
    }
};

export { registerUser, loginUser, getUserProfile };

