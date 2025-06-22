import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovieDetails, fetchCast } from '../features/moviesSlice';
import imdbLight from '../assets/imdb-light-mode.svg';
import imdbDark from '../assets/imdb-dark-mode.svg';
import tmdbDark from '../assets/tmdb-dark-mode.svg';
import tmdbLight from '../assets/tmdb-light-mode.svg';
import ReviewForm from '../components/ReviewForm';
import Loader from '../components/Loader';

const MovieDetails = () => {
  const { movieId } = useParams(); 
  const dispatch = useDispatch();
  
  const { movieDetails = {}, cast = [], loading, error } = useSelector(state => state.movies);
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const user = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('cast');
  
  useEffect(() => {
    dispatch(fetchMovieDetails(movieId));
    dispatch(fetchCast(movieId));
  }, [dispatch, movieId, user]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'bg-transparent text-white' : 'bg-transparent text-black'}`}>
      {loading ? (
        <Loader/>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="flex flex-col lg:flex-row">
          {/* Poster */}
          <div className="lg:w-1/3 w-full mb-6 lg:mb-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${movieDetails.poster}`}
              alt={movieDetails.title}
              className="rounded-lg shadow-lg w-full"
            />
          </div>

          {/* Details and Tabs */}
          <div className="lg:w-2/3 w-full lg:ml-8">
            <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{movieDetails.title}</h1>

            <div className={`space-y-2 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <p className="inline-flex gap-1">
                <strong>Director: </strong> 
                <Link className={`${darkMode ? 'hover:text-white' : 'hover:text-black'} font-medium`}>{movieDetails.director}</Link>
              </p>
              <p><strong>Runtime:</strong> {movieDetails.runtime} mins</p>
            </div>

            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{movieDetails.description}</p>

            <div className="inline-flex gap-2 mt-5 opacity-50">
              <a href={`${movieDetails.imdb_link}`} target="_main"><img src={darkMode ? imdbDark : imdbLight} className="w-10" alt="IMDb" /></a>
              <a href={`https://www.themoviedb.org/movie/${movieDetails.tmdb_id}`} target="_main"><img src={darkMode ? tmdbDark : tmdbLight} className="w-16 pt-2.5" alt="TMDb" /></a>
            </div>

            {/* Tabs */}
            <div className={`flex space-x-6 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
              <button
                className={`pb-2 font-semibold text-lg transition-colors duration-300 ${
                  activeTab === 'cast' 
                    ? `border-b-2 ${darkMode ? 'border-white text-white' : 'border-black text-black'}` 
                    : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                }`}
                onClick={() => handleTabClick('cast')}
              >
                Cast
              </button>
              <button
                className={`pb-2 font-semibold text-lg transition-colors duration-300 ${
                  activeTab === 'log' 
                    ? `border-b-2 ${darkMode ? 'border-white text-white' : 'border-black text-black'}` 
                    : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
                }`}
                onClick={() => {
                  if (user.isAuthenticated) {
                    handleTabClick('log');
                  }
                }}
              >
                Add to Journal
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'cast' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {cast.map((actor) => (
                    <Link to={`/person/${actor.id}`} key={actor.id} className="flex items-center space-x-4">
                      <img
                        src={`https://image.tmdb.org/t/p/w200${actor.profile_pic}`}
                        alt={actor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{actor.name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{actor.character_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {activeTab === 'log' && <ReviewForm movie={movieDetails} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
