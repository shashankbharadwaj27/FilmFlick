import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchReviewDetails, addLike, removeLike } from '../features/reviewSlice';
import { format } from 'date-fns';
import Loader from '../components/Loader';
import EditModal from '../components/EditModal';

export default function Review() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reviewId } = useParams();

  const { reviewDetails, likes, status, error } = useSelector((state) => state.review);
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const user = useSelector((state) => state.auth);
  const currentUsername = user?.user?.username;

  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const isLiked = useMemo(() => {
    return likes.some(like => like.username === currentUsername);
  }, [likes, currentUsername]);

  useEffect(() => {
    if (reviewId) {
      dispatch(fetchReviewDetails(reviewId));
    }
  }, [dispatch, reviewId]);

  const handleLike = useCallback((e) => {
    e.preventDefault();
    if (user.isAuthenticated) {
      const action = isLiked ? removeLike : addLike;
      dispatch(action({ reviewId, username: currentUsername }));
    }
  }, [dispatch, user, reviewId, currentUsername, isLiked]);

  const handleEditReview = (e) => {
    e.preventDefault();
    setEditModalOpen(true);
  };

  if (status === 'loading') return <Loader />;
  if (status === 'failed') return <div className="text-red-500">Error: {error}</div>;

  if (!reviewDetails) {
    return <div className="text-center text-red-500">No review available...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-transparent">
      {isEditModalOpen && (
        <EditModal existingReview={reviewDetails} type='review' isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} />
      )}
      <div className="flex justify-between items-center mb-6">
        <button className="text-blue-600 hover:underline" onClick={() => navigate(-1)}>
          &larr; Back to All Reviews
        </button>
        {
          reviewDetails.username === user?.user?.username && (
            <button onClick={handleEditReview} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
              Edit Review
            </button>
          )
        }
      </div>

      <div className="flex flex-col md:flex-row items-center mb-6 space-y-4 md:space-y-0 md:space-x-6">
        {reviewDetails.poster && (
          <img
            src={`https://image.tmdb.org/t/p/w500${reviewDetails.poster}`}
            alt={`${reviewDetails.title} Poster`}
            className="w-full md:w-48 h-auto object-cover rounded-lg shadow-lg"
          />
        )}
        <div className="flex-1">
          <div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
              Review by <Link className='font-semibold' to={`/${reviewDetails.username}/profile`}>{reviewDetails.username}</Link>
            </p>
          </div>
          <h1 className={`${darkMode ? 'text-gray-200' : 'text-gray-900'} text-3xl font-bold mb-2`}>
            {reviewDetails.title}
          </h1>
          {/* <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-4`}>
            Directed by {reviewDetails.director}
          </p> */}
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} text-sm`}>
            Watched on {format(new Date(reviewDetails.review_date), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      <div className="bg-transparent p-6 mb-6">
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} text-lg`}>
          {reviewDetails.review_text}
        </p>
        <div className="flex items-center justify-start mt-4">
          <button
            className={`text-3xl mr-1 ${isLiked ? 'text-red-700' : `${darkMode ? 'text-gray-400' : 'text-gray-700'}`} transition-colors duration-200`}
            disabled={!user.isAuthenticated}
            onClick={handleLike}
          >
            &hearts;
          </button>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-800'}>
            {likes.length > 0 ? `${likes.length} likes` : 'No likes yet'}
          </span>
        </div>
      </div>
    </div>
  );
}
