import {Router} from 'express';
import * as userRoutes from '../controllers/usersController.js';
import {
    validateAccessToken, 
    validateRefreshToken,
    loginValidationRules,
    signupValidationRules,
    validateRequest
} from '../middlewares/authentication.js';

const userRouter = Router();

// Public routes
userRouter.post('/signup', signupValidationRules, validateRequest, userRoutes.handleUserSignUp);
userRouter.post('/login', loginValidationRules, validateRequest, userRoutes.handleUserLogin);
userRouter.post('/refresh', validateRefreshToken, userRoutes.handleRefreshToken);
userRouter.post('/info', userRoutes.getUserInfo);

// Auth verification route (protected)
userRouter.get('/verify', validateAccessToken, userRoutes.handleVerifyAuth);

// Protected routes (require access token)
userRouter.post('/logout', validateAccessToken, userRoutes.handleUserLogout);
userRouter.post('/log-movie', validateAccessToken, userRoutes.handleUserMovieLog); 
userRouter.put('/update-profile', validateAccessToken, userRoutes.handleUpdateProfile);
userRouter.post('/follow', validateAccessToken, userRoutes.handleFollowRequest);
userRouter.delete('/unfollow', validateAccessToken, userRoutes.handleUnfollowRequest);
userRouter.post('/latest-friends-activity', validateAccessToken, userRoutes.handleGetFriendsLatestActivity); 

// Profile routes (no auth needed)
userRouter.get('/:username/profile', userRoutes.handleGetProfileInfo);
userRouter.get('/:username/favourites', userRoutes.handleGetUserFavourites);
userRouter.get('/:username/followers', userRoutes.handleGetUserFollowers);
userRouter.get('/:username/following', userRoutes.handleGetUserFollowing);

export default userRouter;