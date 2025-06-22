import {Router} from 'express';
import * as userRoutes from '../controllers/usersController.js';
import { validateToken,validateRequest } from '../middlewares/authentication.js';

const userRouter = Router();

userRouter.post('/login',userRoutes.handleUserLogin);
userRouter.post('/logout',userRoutes.handleUserLogout);
userRouter.post('/signup',validateRequest,userRoutes.handleUserSignUp);
userRouter.post('/log-movie',userRoutes.handleUserMovieLog); 
userRouter.post('/info',userRoutes.getUserInfo);
userRouter.put('/update-profile',userRoutes.handleUpdateProfile)
userRouter.get('/:username/profile',userRoutes.handleGetProfileInfo);
userRouter.get('/:username/favourites',userRoutes.handleGetUserFavourites);
userRouter.post('/follow',userRoutes.handleFollowRequest);
userRouter.delete('/unfollow',userRoutes.handleUnfollowRequest);
userRouter.get('/:username/followers',userRoutes.handleGetUserFollowers);
userRouter.get('/:username/following',userRoutes.handleGetUserFollowing);
userRouter.post('/latest-friends-activity',userRoutes.handleGetFriendsLatestActivity); 
export default userRouter;