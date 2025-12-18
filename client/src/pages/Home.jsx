import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPopularMovies, fetchTopRatedMovies } from '../features/moviesSlice';
import { fetchFollowing, fetchFollowingActivity } from '../features/socialSlice';
import MovieSwiper from '../components/MovieSwiper';
import Loader from '../components/Loader';
import image from '../assets/image.png';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Skeleton Components
const ActivityCardSkeleton = ({ darkMode }) => (
  <div className="rounded-lg overflow-hidden w-48 flex-shrink-0">
    <div className={`h-72 w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
    <div className={`p-2 flex flex-col gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-800'}`}>
      <div className="flex items-center">
        <div className={`w-6 h-6 rounded-full mr-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-400'} animate-pulse`} />
        <div className={`h-3 w-20 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-400'} animate-pulse`} />
      </div>
      <div className={`h-4 w-16 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-400'} animate-pulse`} />
    </div>
  </div>
);

const SwiperSkeleton = ({ darkMode }) => (
  <div className={`h-64 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
);

// Memoized activity card with lazy loading
const ActivityCard = React.memo(({ movie, darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      to={`/${movie.username}/review/${movie.review_id}`}
      className="rounded-lg overflow-hidden w-48 flex-shrink-0 group block"
      aria-label={`Review of ${movie.title} by ${movie.username}`}
    >
      <div className="relative">
        {isVisible ? (
          <img
            src={`${TMDB_IMAGE_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="h-72 w-full object-cover group-hover:brightness-110 transition-brightness duration-200"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`h-72 w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
      </div>

      <div className={`p-2 flex flex-col gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-800'}`}>
        <div className={`flex items-center text-xs font-semibold ${darkMode ? 'text-gray-900' : 'text-gray-300'}`}>
          <img
            src={image}
            alt={movie.username}
            className={`w-6 h-6 rounded-full mr-2 border ${darkMode ? 'border-gray-800' : 'border-gray-700'}`}
            loading="lazy"
          />
          <span className="truncate">{movie.username}</span>
        </div>

        <div className={`flex gap-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
          {Array.from({ length: Math.min(movie.rating, 5) }).map((_, i) => (
            <span key={i} className="text-sm">★</span>
          ))}
        </div>
      </div>
    </Link>
  );
});
ActivityCard.displayName = 'ActivityCard';

// Memoized tab button
const TabButton = React.memo(({ label, isActive, onClick, darkMode }) => (
  <button
    onClick={onClick}
    aria-pressed={isActive}
    className={`pb-2 text-lg font-semibold transition-colors duration-300 ${
      isActive
        ? `border-b-2 ${darkMode ? 'border-white text-white' : 'border-black text-black'}`
        : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`
    }`}
  >
    {label}
  </button>
));
TabButton.displayName = 'TabButton';

// Activity feed section with infinite scroll
const FollowingActivity = React.memo(({ activity, darkMode, loadingStates, isAuthenticated }) => {
  const [displayCount, setDisplayCount] = useState(12);
  const loadMoreRef = useRef(null);

  const sortedActivity = useMemo(() => {
    return [...activity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [activity]);

  const displayedActivity = useMemo(() => {
    return sortedActivity.slice(0, displayCount);
  }, [sortedActivity, displayCount]);

  const hasMore = displayCount < sortedActivity.length;

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingStates.activity) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplayCount(prev => Math.min(prev + 12, sortedActivity.length));
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadingStates.activity, sortedActivity.length]);

  if (!isAuthenticated) {
    return (
      <div className={`text-center py-20 px-4 rounded-lg ${darkMode ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">👥</div>
          <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Connect with Movie Lovers
          </h2>
          <p className={`text-base mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to follow other users and see their latest movie reviews and ratings in your personalized feed.
          </p>
          <Link
            to="/user/login"
            className={`inline-block px-6 py-3 rounded-lg font-semibold transition-all ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loadingStates.following || loadingStates.activity) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Following</h2>
        <div className="flex flex-wrap gap-4">
          {[...Array(6)].map((_, i) => (
            <ActivityCardSkeleton key={i} darkMode={darkMode} />
          ))}
        </div>
      </div>
    );
  }

  if (sortedActivity.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Following</h2>
        <div className={`text-center py-16 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <p className={`text-lg mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            👥 No activity yet
          </p>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Follow users to see their movie reviews and ratings here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {displayedActivity.map((movie) => (
          <ActivityCard key={movie.review_id} movie={movie} darkMode={darkMode} />
        ))}
      </div>
      
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${
            darkMode ? 'border-gray-600' : 'border-gray-300'
          }`} />
        </div>
      )}
    </div>
  );
});
FollowingActivity.displayName = 'FollowingActivity';

// For you section with lazy loading
const ForYouSection = React.memo(({ popular, topRated, darkMode, loadingStates, isAuthenticated }) => {
  return (
    <div className="space-y-8">
      <section id="popular">
        <h2 className="text-xl font-bold mb-4">Popular</h2>
        {loadingStates.popular ? (
          <SwiperSkeleton darkMode={darkMode} />
        ) : popular.length > 0 ? (
          <MovieSwiper movies={popular} />
        ) : (
          <div className={`text-center py-16 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              No popular movies available
            </p>
          </div>
        )}
      </section>
      
      <section id="top-rated">
        <h2 className="text-xl font-bold mb-4">Top Rated</h2>
        {loadingStates.topRated ? (
          <SwiperSkeleton darkMode={darkMode} />
        ) : topRated.length > 0 ? (
          <MovieSwiper movies={topRated} />
        ) : (
          <div className={`text-center py-16 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              No top rated movies available
            </p>
          </div>
        )}
      </section>
    </div>
  );
});
ForYouSection.displayName = 'ForYouSection';

const Home = () => {
  const [activeTab, setActiveTab] = useState('following');
  const dispatch = useDispatch();

  const { popular = [], topRated = [], loading, error } = useSelector(state => state.movies);
  const darkMode = useSelector(state => state.darkMode.darkMode);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { following = [], activity = [] } = useSelector(state => state.social);

  // Track individual loading states
  const [loadingStates, setLoadingStates] = useState({
    popular: true,
    topRated: true,
    following: true,
    activity: true
  });

  // Fetch data based on active tab to avoid unnecessary requests
  useEffect(() => {
    if (activeTab === 'foryou') {
      if (popular.length === 0) {
        dispatch(fetchPopularMovies())
          .finally(() => setLoadingStates(prev => ({ ...prev, popular: false })));
      } else {
        setLoadingStates(prev => ({ ...prev, popular: false }));
      }
      
      if (topRated.length === 0) {
        dispatch(fetchTopRatedMovies())
          .finally(() => setLoadingStates(prev => ({ ...prev, topRated: false })));
      } else {
        setLoadingStates(prev => ({ ...prev, topRated: false }));
      }
    }
  }, [dispatch, activeTab, popular.length, topRated.length]);

  // Fetch following list when user is available
  useEffect(() => {
    if (user?.username && activeTab === 'following') {
      dispatch(fetchFollowing({ username: user.username }))
        .finally(() => setLoadingStates(prev => ({ ...prev, following: false })));
    }
  }, [dispatch, user?.username, activeTab]);

  // Fetch activity when following list changes and tab is active
  useEffect(() => {
    if (following.length > 0 && activeTab === 'following') {
      dispatch(fetchFollowingActivity({ following }))
        .finally(() => setLoadingStates(prev => ({ ...prev, activity: false })));
    } else if (following.length === 0 && activeTab === 'following') {
      setLoadingStates(prev => ({ ...prev, activity: false }));
    }
  }, [dispatch, following, activeTab]);

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-black'}`}>
      {/* Tab Navigation */}
      <div className={`flex space-x-4 mb-6 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <TabButton
          label="Following"
          isActive={activeTab === 'following'}
          onClick={() => handleTabClick('following')}
          darkMode={darkMode}
        />
        <TabButton
          label="For You"
          isActive={activeTab === 'foryou'}
          onClick={() => handleTabClick('foryou')}
          darkMode={darkMode}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'following' && (
        <FollowingActivity
          activity={activity}
          darkMode={darkMode}
          loadingStates={loadingStates}
          isAuthenticated={isAuthenticated}
        />
      )}
      {activeTab === 'foryou' && (
        <ForYouSection
          popular={popular}
          topRated={topRated}
          darkMode={darkMode}
          loadingStates={loadingStates}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default Home;