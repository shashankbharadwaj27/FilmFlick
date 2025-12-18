// controllers/reviewController.js
import { queryDatabase } from '../database/connection.js';
import { getMovieDetails } from '../services/tmdb.js';

// Fetch likes for a review
export async function getLikes(reviewId) {
  const query = 'SELECT username FROM likes WHERE review_id = ?';
  return queryDatabase(query, [reviewId]);
}

export async function getReview(reviewId) {
  const query = 'SELECT ur.* FROM user_reviews ur WHERE review_id = ?';
  const result = await queryDatabase(query, [reviewId]);
  const review = result[0];
  const data = await getMovieDetails(review.movie_id);
  const populated_review  = {...review, ...data};
  return populated_review;
}

//Get user reviews
export async function handleGetUserReviews(req, res) {
    const username = req.params.username;
    try {
        const results = await queryDatabase(
            'SELECT user_reviews.* FROM user_reviews WHERE user_reviews.username = ?',
            [username]
        );
        const formatted_results = await Promise.all(
          results.map(async (entry) => {
            const data = await getMovieDetails(entry.movie_id);
            return {...entry, ...data}
          })
        )
        res.status(200).json(formatted_results);
    }catch(err){
        res.status(500).json({error:'An error occurred while fetching reviews' });
    }
}

//add like to a review
export async function handleAddLike(req, res) {
  const reviewId = req.params.reviewId;
  const {username} = req.body;
  try{
      await queryDatabase(
      'INSERT INTO likes(review_id,username) VALUES(?,?)',
      [reviewId,username]
    );
    res.status(200).json({ message: 'Like added successfully' });
  }catch(err){
    res.status(500).json({error:'An error occurred while adding like' });
  }
}

//remove like from a review
export async function handleRemoveLike(req, res) {
  const reviewId = req.params.reviewId;
  const {username} = req.body;
  try{
      await queryDatabase(
      'DELETE FROM likes WHERE review_id=? AND username = ?',
      [reviewId,username]
    );
    res.status(200).json({ message: 'Like removed successfully' });
  }catch(err){
    res.status(500).json({error:'An error occurred while removing like' });
  }
}

export async function handleUpdateReview(req, res) {
  const { reviewId } = req.params;
  const { rating, review, date, rewatch, spoilers } = req.body; 

  try {
    await queryDatabase(
      'UPDATE user_reviews SET rating = ?, review_text = ?, review_date = ?, rewatch = ?, spoilers = ? WHERE review_id = ?', 
      [rating, review, date, rewatch, spoilers, reviewId]
    );
    res.status(200).json({ message: 'Review updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the review' });
  }
}

// Controller to get review details with likes 
export const getReviewDetails = async (req, res) => {
  const reviewId = parseInt(req.params.reviewId, 10);
  if (isNaN(reviewId)) {
    return res.status(400).json({ message: 'Invalid Review ID' });
  }

  try {
    // Fetch review details and likes in parallel
    const [details, likes] = await Promise.all([
      getReview(reviewId),
      getLikes(reviewId)
    ]);

    if (!details) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ details, likes });
  } catch (err) {
    console.error('Error fetching review details:', err);
    res.status(500).json({ message: 'Error fetching data', error: err.message });
  }
};
