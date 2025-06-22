import JWT from 'jsonwebtoken';
import {body} from 'express-validator';
const secret='iamironman';

export function createUserToken(username){
    const payload={
        username:username,
    }
    const token=JWT.sign(payload,secret);
    return token;

}

export function validateToken(req,res,next){
    const token = req.cookies.Token
    const payload=JWT.verify(token,secret);
    return next();
}

export function validateRequest(req,res,next){
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long');
    body('name').notEmpty().withMessage('Name is required');
    return next();
}