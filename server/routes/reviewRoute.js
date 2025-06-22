import {Router} from 'express';
import {getReviewDetails,handleGetUserReviews,handleAddLike,handleRemoveLike, handleUpdateReview} from '../controllers/reviewController.js'

const reviewRouter=Router();

reviewRouter.get('/getUserReviews/:username',handleGetUserReviews);
reviewRouter.get('/:reviewId/details',getReviewDetails);
reviewRouter.post('/:reviewId/addLike',handleAddLike);
reviewRouter.post('/:reviewId/removeLike',handleRemoveLike);
reviewRouter.post('/updateReview/:reviewId', handleUpdateReview);

export default reviewRouter