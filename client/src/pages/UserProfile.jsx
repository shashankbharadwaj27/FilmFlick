// src/pages/UserPublicProfilePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import Loader from '../components/Loader';
import FollowersFollowingModal from '../components/FollowersFollowingModal';
import { fetchTargetUserProfile, clearErrors } from '../features/targetUserSlice';
import { followUser, unfollowUser, fetchFollowers, fetchFollowing } from '../features/socialSlice';
import { getUserInfo } from '../features/authSlice';
import image from '../assets/image.png';
import { format } from 'date-fns';

function UserProfile() {
  const dispatch = useDispatch();
  const { username } = useParams();
  const { targetUser, isLoading, error } = useSelector(state => state.targetUser);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { following } = useSelector(state => state.social);
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);

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
      dispatch(fetchTargetUserProfile(username));
    }else{
        dispatch(getUserInfo(user?.username));
    }
    return () => dispatch(clearErrors());
  }, [dispatch, username, user]);

  useEffect(() => {
    const handleResize = () => setDeviceWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openModal = (users, title) => {
    setModalUsers(users || []);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  if (error) return <div className="text-red-500 text-center mt-4">Error fetching profile: {error.message}</div>;
  if (isLoading) return <Loader />;

  const userToDisplay = targetUser?.userinfo;
  const recentReviews = [...(targetUser.reviews || [])]
    .sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
    .slice(0, 4);
  const userfavourites = targetUser.favourites || [];

  if (!userToDisplay?.username) return <div className="text-gray-500 text-center mt-4">No profile found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-transparent rounded-lg">
      <div className={`flex ${deviceWidth > 480 ? '' : 'flex-col gap-6'} items-center justify-between mb-8`}>
        <div className="flex items-center gap-6">
          <img src={userToDisplay.pfp_url || image} alt={userToDisplay.username} className="w-20 h-20 rounded-full object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-3 pt-4">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{userToDisplay.name}</h1>
                <p className={`text-sm pt-1 ${darkMode ? 'text-white' : 'text-black'}`}>@ {userToDisplay.username}</p>
              </div>
              {isAuthenticated && username !== user?.username && (
                <button className="bg-gray-600 text-white text-sm px-3 py-1 rounded hover:bg-gray-500" onClick={handleFollowButtonClick}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
            <div className="mt-1 space-y-1">
              {userToDisplay.bio && <p className={`text-sm break-words ${darkMode ? 'text-gray-400' : 'text-gray-900'}`}>{userToDisplay.bio}</p>}
              {userToDisplay.location && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-900'}`}><span>📍</span> {userToDisplay.location}</p>}
            </div>
          </div>
        </div>
        <div className="flex space-x-6">
          <div className="text-center cursor-pointer" onClick={() => openModal(targetUser.followers, 'Followers')}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{targetUser.followers?.length}</p>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Followers</h3>
          </div>
          <div className="text-center cursor-pointer" onClick={() => openModal(targetUser.following, 'Following')}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{targetUser.following?.length}</p>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Following</h3>
          </div>
        </div>
      </div>

      <FollowersFollowingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={modalUsers} title={modalTitle} darkMode={darkMode} />

      {userfavourites.length > 0 && (
        <div className="mt-10">
          <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Favourites</h2>
          <div className={`flex overflow-x-auto space-x-${deviceWidth > 480 ? '4' : '2'} py-4`}>
            {userfavourites.map((movie) => (
              <Link to={`/movie/${movie.movie_id}`} key={movie.favourite_id} className={`flex-none ${deviceWidth > 480 ? 'w-40' : 'w-16'}`}>
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster}`} alt={movie.title || 'Movie poster'} className="object-cover rounded-lg" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Recent Activity</h2>
        <div className={`flex overflow-x-auto space-x-${deviceWidth > 480 ? '4' : '2'} py-4`}>
          {recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <Link to={`/movie/${review.movie_id}`} key={review.review_id} className={`block ${darkMode ? 'text-white' : 'text-black'} flex-none ${deviceWidth > 480 ? 'w-40' : 'w-16'}`}>
                <img src={`https://image.tmdb.org/t/p/w500${review.poster}`} alt={review.title || 'Movie poster'} className="object-cover rounded-lg" />
                <p className="text-xs pt-2 text-gray-400">{format(new Date(review.review_date), 'MMMM dd, yyyy')}</p>
              </Link>
            ))
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
