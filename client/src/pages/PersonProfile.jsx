import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux';
import imdbLight from '../assets/imdb-light-mode.svg';
import imdbDark from '../assets/imdb-dark-mode.svg';
import tmdbDark from '../assets/tmdb-dark-mode.svg';
import tmdbLight from '../assets/tmdb-light-mode.svg';
import Loader from '../components/Loader';
import userAltImage from '../assets/userAlternate.png'
import {fetchActorDetails,fetchActorCredits} from '../features/creditsSlice';

function PersonProfile() {
    const { personId } = useParams(); 
    const { actorDetails = {}, actorCredits = [], loading, error } = useSelector(state => state.actor);
    const darkMode = useSelector((state) => state.darkMode.darkMode);
    const user = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    useEffect(()=>{
      dispatch(fetchActorDetails(personId));
      dispatch(fetchActorCredits(personId));
    },[personId,dispatch]);

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'bg-transparent text-white' : 'bg-transparent text-black'}`}>
      {/* Main Content */}
      {loading ? (
        <Loader/>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <div className="flex flex-col lg:flex-row">
          {/* MovieDetails Poster */}
          <div className="lg:w-1/3 w-full mb-6 lg:mb-0">
            <img
              src={`${actorDetails && actorDetails.profile_pic?`https://image.tmdb.org/t/p/w500${actorDetails.profile_pic}`:`${userAltImage}`}`}
              className={`rounded-lg shadow-lg w-full`}
            />
          </div>

          {/* MovieDetails Details and Tabs */}
          <div className="lg:w-2/3 w-full lg:ml-8">
            <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{actorDetails?actorDetails.name:''}</h1>

            {/* Additional Movie Information */}
            <div className={`space-y-2 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              <span className="inline-flex gap-1">
                <strong>Nationality: </strong> 
                <p className={`${darkMode ? 'hover:text-white' : 'hover:text-black'} font-medium`}>{actorDetails?actorDetails.nationality:'N/A'}</p>
              </span>
              <p><strong>Occupation:</strong> {actorDetails?.occupation==="Actor"?"Actor":"Director"}</p>
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{actorDetails?actorDetails.bio:'N/A'}</p>
            <div className="inline-flex gap-2 mt-5 opacity-50">
              <a href={`https://www.imdb.com/name/${actorDetails?actorDetails.imdb_id:''}/`}  target="_main"><img src={darkMode ? imdbDark : imdbLight} className="w-10" alt="IMDb" /></a>
              <a href={`https://www.themoviedb.org/person/${actorDetails?actorDetails.tmdb_id:''}`} target="_main"><img src={darkMode ? tmdbDark : tmdbLight} className="w-16 pt-2.5" alt="TMDb" /></a>
            </div>

            {/* Tabs */}
            <div className={`center space-x-6 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
              <p className={`pb-2 font-semibold text-center text-lg transition-colors duration-300`}>
                {actorDetails?`${actorDetails.name}'s`:''} Movies
              </p>
            </div>

            {/*Movies by actor */}
            <div>
              {actorCredits && actorCredits.message?(
                  <p className='text-center'>{actorCredits.message}</p>
              ) :actorCredits && actorCredits.length>0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {actorCredits.map((movie) => (
                      <Link to={`/movie/${movie.movie_id}`}
                      className="relative rounded-md "
                      key={movie.movie_id}
                      // style={{ height: cardHeight, width: cardWidth }}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                        alt={movie.title}
                        className="z-0 h-full w-full rounded-md object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                      {/* {windowWidth > 480 && ( */}
                        <div className="absolute bottom-4 left-4 text-left">
                          <h1 className="text-lg font-semibold text-white line-clamp-1">
                            {movie.title}
                          </h1>
                          <p className={`text-sm  text-gray-300 `}>({movie.character_name})</p>
                          <p className="mt-2 text-sm text-gray-300 line-clamp-3">
                            {movie.description}
                          </p>
                        </div>
                      {/* )} */}
                    </Link>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      )
      }
    </div>
  )
}

export default PersonProfile
