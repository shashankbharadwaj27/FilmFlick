import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchReviewDetails, addLike, removeLike } from '../features/reviewSlice';
import { format } from 'date-fns';
import Loader from '../components/Loader';
import EditModal from '../components/EditModal';

// Skeleton Components
const HeaderSkeleton = ({ darkMode }) => (
  <div className={`border-b bg-transparent`}>
    <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
      <div className={`h-8 w-20 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      <div className={`h-10 w-32 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
    </div>
  </div>
);

const PosterSkeleton = ({ darkMode }) => (
  <div className="flex-shrink-0">
    <div className={`w-full md:w-48 h-72 rounded-lg ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    } animate-pulse`}></div>
  </div>
);

const MovieInfoSkeleton = ({ darkMode }) => (
  <div className="flex-1 flex flex-col justify-between">
    <div>
      {/* Title */}
      <div className={`h-10 w-3/4 mb-3 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
      
      {/* Rating stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`w-6 h-6 rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } animate-pulse`}></div>
        ))}
      </div>

      {/* Meta info lines */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-5 w-2/3 rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } animate-pulse`}></div>
        ))}
      </div>
    </div>
  </div>
);

const ReviewContentSkeleton = ({ darkMode }) => (
  <div className="mb-8">
    <div className={`h-7 w-24 mb-4 rounded ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    } animate-pulse`}></div>
    
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`h-4 rounded ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        } animate-pulse`} style={{ width: i === 5 ? '60%' : '100%' }}></div>
      ))}
    </div>
  </div>
);

const EngagementSkeleton = ({ darkMode }) => (
  <div className="flex items-center gap-6">
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
      <div className={`h-5 w-32 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
    </div>
  </div>
);

const FullReviewSkeleton = ({ darkMode }) => (
  <>
    <HeaderSkeleton darkMode={darkMode} />
    
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className={`rounded-xl overflow-hidden bg-transparent`}>
        <div className="p-8">
          {/* Movie Info Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <PosterSkeleton darkMode={darkMode} />
            <MovieInfoSkeleton darkMode={darkMode} />
          </div>

          {/* Divider */}
          <div className={`border-t my-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

          {/* Review Content */}
          <ReviewContentSkeleton darkMode={darkMode} />

          {/* Divider */}
          <div className={`border-t my-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

          {/* Engagement */}
          <EngagementSkeleton darkMode={darkMode} />
        </div>
      </div>
    </div>
  </>
);

export default function Review() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reviewId } = useParams();

  const { reviewDetails, likes, status, error } = useSelector((state) => state.review);
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const currentUsername = user?.username;

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    header: true,
    movieInfo: true,
    reviewContent: true,
    engagement: true
  });

  const isLiked = useMemo(() => {
    return likes?.some(like => like.username === currentUsername);
  }, [likes, currentUsername]);

  const isOwner = useMemo(() => {
    return reviewDetails?.username === currentUsername;
  }, [reviewDetails?.username, currentUsername]);

  useEffect(() => {
    if (reviewId) {
      setLoadingStates({
        header: true,
        movieInfo: true,
        reviewContent: true,
        engagement: true
      });

      dispatch(fetchReviewDetails(reviewId)).then(() => {
        // Progressive loading simulation
        setLoadingStates(prev => ({ ...prev, header: false }));
        
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, movieInfo: false }));
        }, 150);
        
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, reviewContent: false }));
        }, 300);
        
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, engagement: false }));
        }, 450);
      });
    }
  }, [dispatch, reviewId]);

  const handleLike = useCallback((e) => {
    e.preventDefault();
    if (isAuthenticated) {
      const action = isLiked ? removeLike : addLike;
      dispatch(action({ reviewId, username: currentUsername }));
    }
  }, [dispatch, isAuthenticated, reviewId, currentUsername, isLiked]);

  // Show initial loader only if no data at all
  if (status === 'loading' && !reviewDetails) return <Loader />;
  
  if (status === 'failed') return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-red-500 text-center">Error: {error}</div>
    </div>
  );

  if (!reviewDetails && status !== 'loading') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-500">No review available...</div>
      </div>
    );
  }

  // Show skeleton while loading
  const isAnyLoading = Object.values(loadingStates).some(state => state);
  if (isAnyLoading && !reviewDetails) {
    return (
      <div className={`min-h-screen bg-transparent`}>
        <FullReviewSkeleton darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-transparent`}>
      {isEditModalOpen && (
        <EditModal 
          existingReview={reviewDetails} 
          type='review' 
          isOpen={isEditModalOpen} 
          onClose={() => setEditModalOpen(false)} 
        />
      )}

      {/* Header Navigation */}
      {loadingStates.header ? (
        <HeaderSkeleton darkMode={darkMode} />
      ) : (
        <div className={`border-b bg-transparent animate-[fadeIn_0.3s_ease-in-out]`}>
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <button 
              className={`flex items-center gap-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
              onClick={() => navigate(-1)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            {isOwner && (
              <button 
                onClick={() => setEditModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Edit Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className={`rounded-xl overflow-hidden bg-transparent`}>
          <div className="p-8">
            {/* Movie Info Section */}
            {loadingStates.movieInfo ? (
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <PosterSkeleton darkMode={darkMode} />
                <MovieInfoSkeleton darkMode={darkMode} />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 mb-8 animate-[fadeIn_0.3s_ease-in-out]">
                {/* Poster */}
                {reviewDetails.poster_path && (
                  <div className="flex-shrink-0">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${reviewDetails.poster_path}`}
                      alt={`${reviewDetails.title} Poster`}
                      className="w-full md:w-48 rounded-lg shadow-md object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Movie Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {reviewDetails.title}
                    </h1>
                    
                    {/* Rating Stars */}
                    {reviewDetails.rating > 0 && (
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg 
                            key={index} 
                            className={`w-6 h-6 ${index < reviewDetails.rating ? 'text-yellow-400' : darkMode ? 'text-gray-800' : 'text-gray-300'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className={`ml-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                          {reviewDetails.rating}/5
                        </span>
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <p className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Review by{' '}
                        <Link 
                          to={`/${reviewDetails.username}/profile`}
                          className={`font-semibold ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          {reviewDetails.username}
                        </Link>
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Watched on {format(new Date(reviewDetails.review_date), 'MMMM d, yyyy')}
                      </p>
                      {reviewDetails.rewatch === 1 && (
                        <p className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>
                            Rewatch
                          </span>
                        </p>
                      )}
                      {reviewDetails.spoilers === 1 && (
                        <p className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                            Contains Spoilers
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className={`border-t my-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Review Content */}
            {loadingStates.reviewContent ? (
              <ReviewContentSkeleton darkMode={darkMode} />
            ) : (
              <div className="mb-8 animate-[fadeIn_0.3s_ease-in-out]">
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Review
                </h2>
                
                {reviewDetails.spoilers === 1 && !showSpoilers ? (
                  <div className={`p-8 rounded-lg text-center ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'}`}>
                    <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      This review contains spoilers
                    </p>
                    <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click below to reveal the review content
                    </p>
                    <button
                      onClick={() => setShowSpoilers(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Show Spoilers
                    </button>
                  </div>
                ) : (
                  <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
                    <p className={`text-lg leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {reviewDetails.review_text || (
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                          No review text provided.
                        </span>
                      )}
                    </p>
                    {reviewDetails.spoilers === 1 && showSpoilers && (
                      <button
                        onClick={() => setShowSpoilers(false)}
                        className={`mt-4 text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
                      >
                        Hide Spoilers
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className={`border-t my-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Engagement Section */}
            {loadingStates.engagement ? (
              <EngagementSkeleton darkMode={darkMode} />
            ) : (
              <div className="flex items-center gap-6 animate-[fadeIn_0.3s_ease-in-out]">
                <button
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                  className={`flex items-center gap-2 transition-all ${
                    !isAuthenticated 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-110'
                  }`}
                >
                  <svg 
                    className={`w-8 h-8 transition-colors ${
                      isLiked 
                        ? 'text-red-500 fill-red-500' 
                        : darkMode 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-500 hover:text-red-500'
                    }`}
                    fill={isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {likes?.length > 0 ? `${likes.length} ${likes.length === 1 ? 'like' : 'likes'}` : 'Be the first to like'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}