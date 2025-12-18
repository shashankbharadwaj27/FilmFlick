// UserProfile.jsx - Ticket Stub Layout with Level-Based Coloring
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import FollowersFollowingModal from '../components/FollowersFollowingModal';
import { fetchTargetUserProfile, clearErrors } from '../features/targetUserSlice';
import { followUser, unfollowUser, fetchFollowers, fetchFollowing } from '../features/socialSlice';
import { fetchUserInfo } from '../features/authSlice';
import image from '../assets/image.png';
import alternatePoster from '../assets/poster_alternate.png'
import { format } from 'date-fns';

// Skeleton Components
const TicketSkeleton = ({ darkMode }) => (
  <div className={`rounded-lg p-6 relative overflow-visible ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}>
    <div className="absolute top-1/2 -left-4 w-10 h-10 rounded-full transform -translate-y-1/2"
         style={{ backgroundColor: darkMode ? '#1E1E1E' : 'white' }}>
    </div>
    <div className="absolute top-1/2 -right-4 w-10 h-10 rounded-full transform -translate-y-1/2"
         style={{ backgroundColor: darkMode ? '#1E1E1E' : 'white' }}>
    </div>
    
    <div className="flex flex-col md:flex-row items-center gap-6 pl-2 pr-2">
      <div className="flex-1 text-center md:text-left w-full">
        <div className={`h-3 w-32 mx-auto md:mx-0 mb-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        <div className={`h-8 w-48 mx-auto md:mx-0 mb-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        <div className={`h-6 w-36 mx-auto md:mx-0 mb-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        <div className={`h-4 w-full max-w-md mx-auto md:mx-0 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
      </div>
      <div className={`h-10 w-32 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
    </div>
  </div>
);

const StatsSkeleton = ({ darkMode }) => (
  <div className="mt-6 grid sm:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}>
        <div className={`h-8 w-16 mx-auto mb-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
        <div className={`h-4 w-20 mx-auto rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
      </div>
    ))}
  </div>
);

const MovieGridSkeleton = ({ darkMode, count = 6 }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`aspect-[2/3] rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
    ))}
  </div>
);

const SectionSkeleton = ({ darkMode, title, showCount = true }) => (
  <section className={`rounded-lg p-5 ${
    darkMode 
      ? 'bg-[#1E1E1E] border border-gray-700/50' 
      : 'bg-white border border-gray-200'
  } shadow-md`}>
    <div className="flex items-center justify-between mb-5">
      <div className={`h-7 w-48 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      {showCount && (
        <div className={`h-7 w-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
      )}
    </div>
    <MovieGridSkeleton darkMode={darkMode} count={6} />
  </section>
);

function UserProfile() {
  const dispatch = useDispatch();
  const { username } = useParams();
  const { targetUser, isLoading, error } = useSelector(state => state.targetUser);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { following } = useSelector(state => state.social);
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const Navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    stats: true,
    favourites: true,
    reviews: true
  });

  useEffect(() => {
    if (username === user?.username) {
      Navigate('/profile');
    }
  });

  const isFollowing = following.some((u) => u.username === username);

  const handleFollowButtonClick = useCallback(async () => {
    try {
      if (isFollowing) {
        await dispatch(unfollowUser({ userToUnfollow: username, loggedInUser: user.username })).unwrap();
      } else {
        await dispatch(followUser({ userToFollow: username, loggedInUser: user.username })).unwrap();
      }

      await dispatch(fetchFollowing({ username: user.username })).unwrap();
      await dispatch(fetchFollowers({ username: user.username })).unwrap();
      await dispatch(fetchTargetUserProfile(username)).unwrap();
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  }, [isFollowing, username, dispatch, user]);

  useEffect(() => {
    if (username && username !== user?.username) {
      setLoadingStates({
        profile: true,
        stats: true,
        favourites: true,
        reviews: true
      });

      dispatch(fetchTargetUserProfile(username)).then(() => {
        // Progressive loading simulation
        setLoadingStates(prev => ({ ...prev, profile: false }));
        
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, stats: false }));
        }, 150);
        
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, favourites: false }));
        }, 300);
        
        setTimeout(() => {
          setLoadingStates(prev => ({ ...prev, reviews: false }));
        }, 450);
      });
    } else {
      dispatch(fetchUserInfo(user?.username));
    }
    return () => dispatch(clearErrors());
  }, [dispatch, username, user]);

  const openModal = (users, title) => {
    setModalUsers(users || []);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  if (error) return (
    <div className="text-red-500 text-center mt-4 animate-[fadeIn_0.3s_ease-in-out]">
      Error fetching profile: {error.message}
    </div>
  );
  
  if (isLoading && !targetUser) return <Loader />;

  const userToDisplay = targetUser?.userInfo;
  const recentReviews = [...(targetUser?.reviews || [])]
    .sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
    .slice(0, 6);
  const userfavourites = targetUser?.favourites || [];

  if (!userToDisplay?.username && !isLoading) {
    return (
      <div className={`text-center mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No profile found
      </div>
    );
  }

  // Level-based ticket color system
  const getTicketTier = (reviewCount) => {
    if (reviewCount >= 100) {
      return {
        color: 'from-purple-600 via-pink-600 to-purple-700',
        badge: '👑 LEGEND',
        badgeColor: 'bg-yellow-400/20 text-yellow-200 border-yellow-400/40'
      };
    }
    if (reviewCount >= 50) {
      return {
        color: 'from-orange-500 via-red-500 to-orange-600',
        badge: '🔥 VETERAN',
        badgeColor: 'bg-orange-400/20 text-orange-200 border-orange-400/40'
      };
    }
    if (reviewCount >= 25) {
      return {
        color: 'from-blue-500 via-indigo-500 to-blue-600',
        badge: '⭐ REGULAR',
        badgeColor: 'bg-blue-400/20 text-blue-200 border-blue-400/40'
      };
    }
    if (reviewCount >= 10) {
      return {
        color: 'from-green-500 via-teal-500 to-green-600',
        badge: '🎬 ACTIVE',
        badgeColor: 'bg-green-400/20 text-green-200 border-green-400/40'
      };
    }
    return {
      color: 'from-gray-500 via-gray-600 to-gray-700',
      badge: '🌟 NEWCOMER',
      badgeColor: 'bg-gray-400/20 text-gray-200 border-gray-400/40'
    };
  };

  const reviewCount = targetUser?.reviews?.length || 0;
  const ticketTier = getTicketTier(reviewCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Ticket Stub Header */}
      <div className={`rounded-xl p-8 mb-8 ${darkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="relative">
          {/* Main Ticket */}
          {loadingStates.profile ? (
            <TicketSkeleton darkMode={darkMode} />
          ) : userToDisplay && (
            <div className={`bg-gradient-to-r ${ticketTier.color} rounded-lg p-6 relative overflow-visible shadow-xl animate-[fadeIn_0.3s_ease-in-out]`}>
              {/* Perforated circles on sides */}
              <div className="absolute top-1/2 -left-4 w-10 h-10 rounded-full transform -translate-y-1/2"
                   style={{ backgroundColor: darkMode ? '#1E1E1E' : 'white' }}>
              </div>
              <div className="absolute top-1/2 -right-4 w-10 h-10 rounded-full transform -translate-y-1/2"
                   style={{ backgroundColor: darkMode ? '#1E1E1E' : 'white' }}>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 pl-2 pr-2">
                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${ticketTier.badgeColor} backdrop-blur-sm`}>
                      {ticketTier.badge}
                    </span>
                  </div>
                  <h1 className="text-white text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: "'Urbanist', sans-serif" }}>
                    {userToDisplay.name}
                  </h1>
                  <p className="text-white/80 text-lg mb-3 font-medium">
                    @{userToDisplay.username}
                  </p>
                  {userToDisplay.bio && (
                    <p className="text-white/90 text-sm max-w-2xl leading-relaxed">
                      ~ {userToDisplay.bio}
                    </p>
                  )}
                  {userToDisplay.location && (
                    <p className="text-white/70 text-sm mt-2 flex items-center justify-center md:justify-start gap-1.5">
                      <span>📍</span> {userToDisplay.location}
                    </p>
                  )}
                </div>

                {/* Follow/Unfollow Button */}
                {isAuthenticated && username !== user?.username && (
                  <button 
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-all tracking-wide text-sm ${
                      isFollowing
                        ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
                        : 'bg-white hover:bg-white/90 text-gray-900 border border-white'
                    }`}
                    onClick={handleFollowButtonClick}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Stats Bar Below Ticket */}
          {loadingStates.stats ? (
            <StatsSkeleton darkMode={darkMode} />
          ) : targetUser && (
            <div className={`mt-6 grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 ${darkMode ? 'text-white' : 'text-gray-800'} animate-[fadeIn_0.3s_ease-in-out]`}>
              <div 
                className={`p-4 min-w-fit rounded-lg text-center cursor-pointer transition-all hover:scale-105 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                } shadow-md`}
                onClick={() => openModal(targetUser.followers, 'Followers')}
              >
                <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                  {targetUser.followers?.length || 0}
                </div>
                <div className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Followers
                </div>
              </div>

              <div 
                className={`p-4 min-w-fit rounded-lg text-center cursor-pointer transition-all hover:scale-105 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                } shadow-md`}
                onClick={() => openModal(targetUser.following, 'Following')}
              >
                <div className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                  {targetUser.following?.length || 0}
                </div>
                <div className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Following
                </div>
              </div>

              <div 
                className={`p-4 min-w-fit rounded-lg text-center ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                } shadow-md`}
              >
                <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                  {reviewCount}
                </div>
                <div className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Reviews
                </div>
              </div>
            </div>
          )}

          {/* Progress to Next Tier */}
          {!loadingStates.stats && reviewCount < 100 && (
            <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} animate-[fadeIn_0.3s_ease-in-out]`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {reviewCount < 10 && `${10 - reviewCount} reviews until ACTIVE 🎬`}
                  {reviewCount >= 10 && reviewCount < 25 && `${25 - reviewCount} reviews until REGULAR ⭐`}
                  {reviewCount >= 25 && reviewCount < 50 && `${50 - reviewCount} reviews until VETERAN 🔥`}
                  {reviewCount >= 50 && reviewCount < 100 && `${100 - reviewCount} reviews until LEGEND 👑`}
                </span>
                <span className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {reviewCount < 10 && `${reviewCount}/10`}
                  {reviewCount >= 10 && reviewCount < 25 && `${reviewCount}/25`}
                  {reviewCount >= 25 && reviewCount < 50 && `${reviewCount}/50`}
                  {reviewCount >= 50 && reviewCount < 100 && `${reviewCount}/100`}
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ 
                    width: `${
                      reviewCount < 10 ? (reviewCount / 10) * 100 :
                      reviewCount < 25 ? ((reviewCount - 10) / 15) * 100 :
                      reviewCount < 50 ? ((reviewCount - 25) / 25) * 100 :
                      ((reviewCount - 50) / 50) * 100
                    }%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Favourites Section */}
        {loadingStates.favourites ? (
          <SectionSkeleton darkMode={darkMode} title="Favourite Films" />
        ) : userfavourites.length > 0 ? (
          <section className={`rounded-lg p-5 ${
            darkMode 
              ? 'bg-[#1E1E1E] border border-gray-700/50' 
              : 'bg-white border border-gray-200'
          } shadow-md animate-[fadeIn_0.3s_ease-in-out]`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                <span className="text-2xl">⭐</span> Favourite Films
              </h2>
              <span className={`text-xs sm:text-sm font-mono px-3 py-1.5 rounded-full font-medium ${
                darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {userfavourites.length} films
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {userfavourites.map((movie) => (
                <Link 
                  to={`/movie/${movie.movie_id}`} 
                  key={movie.movie_id}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-md shadow-md transition-all hover:scale-105 hover:shadow-xl">
                    <img 
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : alternatePoster} 
                      alt={movie.title || 'Movie poster'} 
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all flex items-center justify-center p-2">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-xs sm:text-sm text-center leading-tight">
                        {movie.title}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Recent Activity Section */}
        {loadingStates.reviews ? (
          <SectionSkeleton darkMode={darkMode} title="Recent Activity" showCount={false} />
        ) : (
          <section className={`rounded-lg p-5 ${
            darkMode 
              ? 'bg-[#1E1E1E] border border-gray-700/50' 
              : 'bg-white border border-gray-200'
          } shadow-md animate-[fadeIn_0.3s_ease-in-out]`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                <span className="text-2xl">🕑</span> Recent Activity
              </h2>
              {userToDisplay && (
                <Link 
                  className={`text-xs sm:text-sm font-mono px-3 py-1.5 rounded-full font-medium ${
                    darkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                  to={`/${userToDisplay.username}/journal`}
                >
                  All reviews →
                </Link>
              )}
            </div>
            {recentReviews.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {recentReviews.slice(0, 6).map((review) => (
                  <Link 
                    to={`/${username}/review/${review.review_id}`} 
                    key={review.review_id}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-md shadow-md transition-all hover:scale-105 hover:shadow-xl">
                      <img 
                        src={`https://image.tmdb.org/t/p/w500${review.poster_path}`} 
                        alt={review.title || 'Movie poster'} 
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-white text-xs sm:text-sm font-bold truncate mb-0.5 leading-tight">
                            {review.title}
                          </p>
                          <p className="text-gray-300 text-xs font-mono">
                            {format(new Date(review.review_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-base mb-2 font-semibold">🎥 No reviews yet</p>
                <p className="text-sm">This user hasn't reviewed any movies yet.</p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Modal */}
      <FollowersFollowingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        users={modalUsers} 
        title={modalTitle} 
        darkMode={darkMode} 
      />

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

export default UserProfile;