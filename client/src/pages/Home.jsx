import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Link} from 'react-router-dom';
import { fetchPopularMovies, fetchTopRatedMovies } from '../features/moviesSlice';
import { fetchFollowing, fetchFollowingActivity } from '../features/socialSlice';
import MovieSwiper from '../components/movieSwiper';
import Loader from '../components/Loader';
import image from '../assets/image.png'

const Home = () => {
  const [activeTab, setActiveTab] = useState('following');
  const dispatch = useDispatch();
  const { popular = [], topRated = [], loading, error } = useSelector(state => state.movies);

  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const {user} = useSelector(state=>state.auth)
  const {following,activity} = useSelector((state)=>state.social)

  useEffect(() => {
    dispatch(fetchPopularMovies());
    dispatch(fetchTopRatedMovies());
  }, [dispatch]);

  useEffect(() => {
    if (user?.username) {
      let username = user.username
      dispatch(fetchFollowing({username}));
    }
  }, [dispatch, user?.username]);

  useEffect(() => {
    if (following.length > 0) {
      dispatch(fetchFollowingActivity({ following }));
    }
  }, [dispatch, following]);


  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  [...activity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-8`}>
      {/* Tab Navigation */}
      <div className={`flex space-x-4 mb-6 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          className={`pb-2 text-lg font-semibold transition-colors duration-300 ${
            activeTab === 'following' 
              ? `border-b-2 ${darkMode ? 'border-white text-white' : 'border-black text-black'}` 
              : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
          }`}
          onClick={() => handleTabClick('following')}
        >
          Following
        </button>
        <button
          className={`pb-2 text-lg font-semibold transition-colors duration-300 ${
            activeTab === 'foryou' 
              ? `border-b-2 ${darkMode ? 'border-white text-white' : 'border-black text-black'}` 
              : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
          }`}
          onClick={() => handleTabClick('foryou')}
        >
          For You
        </button>
      </div>

      {/* Tab Content */}
      <div className={`${darkMode ? 'text-white' : 'text-black'}`}>
        {activeTab === 'following' && (
          <div className='flex flex-wrap gap-4'>
            {
              loading ? (
                <Loader/>
              ): error ? (
                <p className="text-red-500">Error: {error}</p>
              ):following.length>0?(
                <>
                {
                  activity.map((movie) => (
                    <div
                      key={movie.review_id}
                      className=" rounded-lg overflow-hidden w-48 flex-shrink-0"
                    >
                      {/* Link to Movie Review */}
                      <Link to={`/${movie.username}/review/${movie.review_id}`}>
                        {/* Movie Poster */}
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                          alt={movie.title}
                          className="h-72 w-full object-cover"
                        />
                      </Link>
          
                      {/* Bottom Overlay */}
                      <div className={`p-2 ${darkMode?'bg-[#aaabad]':'bg-[#2e3237]'} rounded-b-lg flex justify-between items-center text-xs`}>
                        {/* Username */}
                        <span className={`font-semibold flex items-center ${darkMode?'text-gray-700':'text-gray-300'}`}>
                          <img
                            src={image}
                            alt={movie.username}
                            className={`w-6 h-6 rounded-full mr-2 border ${darkMode?'border-[#2e3237]':'border-[#aaabad]'}`}
                          />
                          {movie.username}
                        </span>
                      </div>
                        {/* Rating */}
                        <div className={`rounded-lg flex items-center gap-1 ${darkMode?'text-yellow-400':'text-yellow-700'}`}>
                          {Array.from({ length: Math.min(movie.rating, 5) }).map((_, index) => (
                            <span key={index}>&#9733;</span> // &#9733; is a star
                          ))}
                        </div>
                    </div>
                  ))}
                </>
              ):(
                <>
                  <h2 className="text-xl font-bold mb-4">Following</h2>
                  <p>Your feed of movies from the people you follow.</p>
                </>
              )
            }
            
          </div>
        )}
        {activeTab === 'foryou' && (
          <div>
            {loading ? (
              <Loader/>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : (
              <>
                <section id="Popular">
                  <h2 className="text-xl font-bold mb-4">Popular</h2>
                  <MovieSwiper movies={popular} />
                </section>
                <section id="top-rated" className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Top Rated</h2>
                  <MovieSwiper movies={topRated} />
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
