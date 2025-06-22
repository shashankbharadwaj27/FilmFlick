// controllers/reviewController.js
import { queryDatabase } from '../database/connection.js';

// Fetch likes for a review
export async function getLikes(reviewId) {
  const query = 'SELECT username FROM Likes WHERE review_id = ?';
  return queryDatabase(query, [reviewId]);
}

export async function getReview(reviewId) {
  const query = 'SELECT ur.*,m.title,m.director,m.poster FROM user_reviews ur JOIN movies m ON m.movie_id = ur.movie_id WHERE review_id = ?';
  return queryDatabase(query, [reviewId]);
}

//Get user reviews
export async function handleGetUserReviews(req, res) {
    const username = req.params.username;
    try {
        const results = await queryDatabase(
            'SELECT user_reviews.*,movies.* FROM user_reviews JOIN movies on user_reviews.movie_id = movies.movie_id WHERE user_reviews.username = ?',
            [username]
        );
        res.status(200).json(results);
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
  const reviewId = req.params.reviewId;

  if (!reviewId) {
    return res.status(400).json({ message: 'Review ID is required' });
  }

  try {
    // Fetch likes in parallel
    const [details,likes] = await Promise.all([
      getReview(reviewId),
      getLikes(reviewId)
    ]);

    res.status(200).json({ details, likes });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data', error: err.message });
  }
};
