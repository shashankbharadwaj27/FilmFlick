import JWT from 'jsonwebtoken';
import {body, validationResult} from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; 

//Creating a short-lived access token for api requests
export function createAccessToken(username){
    const payload={
        username,
        type : 'access',
        iat : (Math.floor(Date.now()/1000)) //Issued at
    }
    return JWT.sign(payload, JWT_SECRET, {
        expiresIn : ACCESS_TOKEN_EXPIRY
    });
}

//Creating a long-lived refresh token for getting new access tokens
export function createRefreshToken(username){
    const payload = {
        username,
        type : 'refresh',
        iat : (Math.floor(Date.now()/1000))
    }
    return JWT.sign(payload, JWT_SECRET, {
        expiresIn : REFRESH_TOKEN_EXPIRY
    })
}

//Middleware to validate access token
export function validateAccessToken(req, res, next){
    const token = req.cookies.accessToken;
    
    if(!token){
        return res.status(401).json({ error: 'No access token'});
    }

    try{
        const decoded = JWT.verify(token, JWT_SECRET);
 
        // Ensure it's an access token
        if(decoded.type !== 'access'){
            return res.status(401).json({ error: 'Invalid token type'});
        }

        req.user = decoded;
        next();
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({ error: 'Access token expired'});
        }
        return res.status(401).json({ error: 'Invalid access token'});
    }
}

//Middleware to validate refresh token
export function validateRefreshToken(req, res, next){
    const token = req.cookies.refreshToken;

    if(!token){
        return res.status(401).json({error : 'No refresh token'});
    }

    try{
        const decoded = JWT.verify(token, JWT_SECRET);

        if(decoded.type !== 'refresh'){
            return res.status(401).json({ error: 'Invalid token type' });
        }

        req.refreshToken = {
            username : decoded.username,
            token : token,
            iat : decoded.iat,
            exp : decoded.exp
        }

        next();
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({
                error: 'Refresh token expired. Please login again'
            });
        }
        return res.status(401).json({error: 'Invalid refresh token' });
    }
}

export const loginValidationRules = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

export const signupValidationRules = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
    
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters')
        .notEmpty()
        .withMessage('Name is required')
];

export function validateRequest(req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: 'Validation failed',
            details : errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
}