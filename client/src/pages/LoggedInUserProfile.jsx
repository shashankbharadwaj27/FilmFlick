// src/pages/ProfileSelfPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import FollowersFollowingModal from '../components/FollowersFollowingModal';
import { fetchUserFavourites, getUserReviews } from '../features/userDataSlice';
import { fetchFollowers, fetchFollowing } from '../features/socialSlice';
import EditProfileModal from '../components/EditProfileModal';
import image from '../assets/image.png';
import { format } from 'date-fns';

function LoggedInUserProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { favourites, reviews } = useSelector((state) => state.userData);
  const { followers, following } = useSelector((state) => state.social);
  const darkMode = useSelector((state) => state.darkMode.darkMode);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (user?.username) {
      dispatch(fetchUserFavourites({ username: user.username }));
      dispatch(getUserReviews({ username: user.username }));
      dispatch(fetchFollowers({ username: user.username }));
      dispatch(fetchFollowing({ username: user.username }));
    }
  }, [dispatch, user?.username]);

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

  if (!user?.username) return <div className="text-gray-500 text-center mt-4">No profile found</div>;

  const recentReviews = [...(reviews || [])]
    .sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
    .slice(0, 4);

  if (!user) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-transparent rounded-lg">
      <div className={`flex ${deviceWidth > 480 ? '' : 'flex-col gap-6'} items-center justify-between mb-8`}>
        <div className="flex items-center gap-6">
          <img src={user.pfp_url || image} alt={user.username} className="w-20 h-20 rounded-full object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-3 pt-4">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{user.name}</h1>
                <p className={`text-sm pt-1 ${darkMode ? 'text-white' : 'text-black'}`}>@ {user.username}</p>
              </div>
              <button className="bg-gray-600 text-white text-sm px-3 py-1 rounded hover:bg-gray-500" onClick={() => setIsEditModalOpen(true)}>
                Edit Profile
              </button>
            </div>
            <div className="mt-1 space-y-1">
              {user.bio && <p className={`text-sm break-words ${darkMode ? 'text-gray-400' : 'text-gray-900'}`}>{user.bio}</p>}
              {user.location && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-900'}`}><span>📍</span> {user.location}</p>}
            </div>
          </div>
        </div>
        <div className="flex space-x-6">
          <div className="text-center cursor-pointer" onClick={() => openModal(followers, 'Followers')}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{followers.length}</p>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Followers</h3>
          </div>
          <div className="text-center cursor-pointer" onClick={() => openModal(following, 'Following')}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{following.length}</p>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Following</h3>
          </div>
        </div>
      </div>

      <FollowersFollowingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} users={modalUsers} title={modalTitle} darkMode={darkMode} />

      {favourites.length > 0 && (
        <div className="mt-10">
          <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Favourites</h2>
          <div className={`flex overflow-x-auto space-x-${deviceWidth > 480 ? '4' : '2'} py-4`}>
            {favourites.map((movie) => (
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

      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
}

export default LoggedInUserProfile;