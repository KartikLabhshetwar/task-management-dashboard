import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        try{
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (e) {
            res.status(401).json({message: "Not authorized, token failed."});
            console.log(e);
        }
    }

    if(!token){
        res.status(401).json({message: "Not authorized, no token."});
        throw new Error("Not authorized, no token.");
    }
};

export { protect };