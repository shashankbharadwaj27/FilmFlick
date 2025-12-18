import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import posterAlternate from '../assets/poster_alternate.png'
import image from '../assets/image.png';

import NothingFound from '../components/NothingFound';

// Skeleton Components
const MovieCardSkeleton = ({ darkMode }) => (
  <div className={`border rounded-lg shadow-md overflow-hidden ${
    darkMode ? 'border-gray-700' : 'border-gray-300'
  }`}>
    <div className={`h-72 w-full ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    } animate-pulse`}></div>
    <div className={`p-3 ${darkMode ? 'bg-[#2e3237]' : 'bg-white'}`}>
      <div className={`h-5 w-3/4 mb-2 rounded ${
        darkMode ? 'bg-gray-600' : 'bg-gray-300'
      } animate-pulse`}></div>
      <div className={`h-4 w-1/4 rounded ${
        darkMode ? 'bg-gray-600' : 'bg-gray-300'
      } animate-pulse`}></div>
    </div>
  </div>
);

const UserCardSkeleton = ({ darkMode }) => (
  <div className={`border rounded-lg shadow-md overflow-hidden ${
    darkMode ? 'border-gray-700 bg-gradient-to-br from-[#2e3237] to-[#1a1d21]' : 'bg-gradient-to-br from-white to-gray-50 border-gray-300'
  }`}>
    <div className="p-6 flex flex-col items-center gap-4">
      {/* Avatar skeleton */}
      <div className={`w-20 h-20 rounded-full ${
        darkMode ? 'bg-gray-600' : 'bg-gray-300'
      } animate-pulse`}></div>
      
      {/* Username skeleton */}
      <div className="text-center w-full space-y-2">
        <div className={`h-5 w-24 mx-auto rounded ${
          darkMode ? 'bg-gray-600' : 'bg-gray-300'
        } animate-pulse`}></div>
        <div className={`h-4 w-20 mx-auto rounded ${
          darkMode ? 'bg-gray-600' : 'bg-gray-300'
        } animate-pulse`}></div>
      </div>

      {/* Stats skeleton */}
      <div className={`w-full flex justify-around pt-4 border-t ${
        darkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        {[1, 2].map((i) => (
          <div key={i} className="text-center space-y-1">
            <div className={`h-5 w-8 mx-auto rounded ${
              darkMode ? 'bg-gray-600' : 'bg-gray-300'
            } animate-pulse`}></div>
            <div className={`h-3 w-12 mx-auto rounded ${
              darkMode ? 'bg-gray-600' : 'bg-gray-300'
            } animate-pulse`}></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ResultsGridSkeleton = ({ darkMode, category, count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      category === 'movie' ? (
        <MovieCardSkeleton key={i} darkMode={darkMode} />
      ) : (
        <UserCardSkeleton key={i} darkMode={darkMode} />
      )
    ))}
  </div>
);

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const base = import.meta.env.VITE_API_BASE_URL;

  const [category, setCategory] = useState('movie');
  const [allMovieResults, setAllMovieResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(1);
  const [resultsPerPage] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  const years = Array.from({ length: 70 }, (_, i) => `${2025 - i}`);

  // Redirect to home if no query
  useEffect(() => {
    if (!query) {
      navigate('/');
    }
  }, [query, navigate]);

  const filteredMovieResults = allMovieResults.filter((movie) =>
    (!yearFilter || movie.year?.toString() === yearFilter)
  );

  const paginatedResults = (category === 'movie'
    ? filteredMovieResults
    : userResults
  ).slice((page - 1) * resultsPerPage, page * resultsPerPage);

  const totalPages = Math.ceil(
    (category === 'movie' ? filteredMovieResults.length : userResults.length) / resultsPerPage
  );

  useEffect(() => {
    if (!query.trim()) {
      setAllMovieResults([]);
      setUserResults([]);
      setError('No search query provided.');
      setInitialLoad(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await axios.get(`${base}/movie/search/${query}`, {
          params: {
            category,
          },
        });

        if (category === 'movie') {
          const movieResults = Array.isArray(res?.data) ? res.data.map((movie) => {
            const date = movie.release_date || '';
            const year = date.split('-')[0];
            return { ...movie, year };
          }) : [];
          console.log(movieResults)
          setAllMovieResults(movieResults);
        } else {
          setUserResults(Array.isArray(res?.data) ? res.data : []);
        }

        setPage(1);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch results.');
        setAllMovieResults([]);
        setUserResults([]);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchResults();
  }, [query, category, base]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [yearFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setYearFilter('');
    setPage(1);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-black'}`}>
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={loading}
          className={`px-4 py-2 rounded-md border ${
            darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'border-gray-300 bg-white text-black'
          } disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
        >
          <option value="movie">Movies</option>
          <option value="user">Users</option>
        </select>

        {category === 'movie' && (
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            disabled={loading}
            className={`px-4 py-2 rounded-md border ${
              darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'border-gray-300 bg-white text-black'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      {/* Loading State with Skeleton */}
      {loading && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <ResultsGridSkeleton darkMode={darkMode} category={category} count={resultsPerPage} />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-8 animate-[fadeIn_0.3s_ease-in-out]">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
            darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && paginatedResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-[fadeIn_0.4s_ease-in-out]">
          {category === 'movie' ? (
            paginatedResults.map((movie, index) => (
              <div
                key={movie.id}
                className={`cursor-pointer border rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : posterAlternate}
                  alt={movie.title}
                  onError={(e) => { e.target.src = posterAlternate; }}
                  className="h-72 w-full object-cover"
                  loading="lazy"
                />
                <div className={`p-3 ${darkMode ? 'bg-[#2e3237]' : 'bg-white'}`}>
                  <h2 className={`text-md font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {movie.title}
                  </h2>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {movie.year}
                  </p>
                </div>
              </div>
            ))
          ) : (
            paginatedResults.map((user, index) => (
              <div
                key={user.username}
                className={`cursor-pointer border rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl ${
                  darkMode ? 'border-gray-700 bg-gradient-to-br from-[#2e3237] to-[#1a1d21]' : 'bg-gradient-to-br from-white to-gray-50 border-gray-300'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => navigate(`/${user.username}/profile`)}
              >
                <div className="p-6 flex flex-col items-center gap-4">
                  {/* Avatar with glow effect */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
                      darkMode ? 'bg-blue-500' : 'bg-blue-400'
                    }`}></div>
                    <img
                      src={user.pfp_url || image}
                      alt={user.username}
                      className={`relative w-20 h-20 rounded-full object-cover border-4 ${
                        darkMode ? 'border-blue-500' : 'border-blue-400'
                      }`}
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Username */}
                  <div className="text-center w-full">
                    <h3 className={`font-bold text-lg truncate ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.username}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      View Profile
                    </p>
                  </div>

                  {/* Stats (if available) */}
                  {(user.followers_count !== undefined || user.reviews_count !== undefined) && (
                    <div className={`w-full flex justify-around pt-4 border-t ${
                      darkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      {user.followers_count !== undefined && (
                        <div className="text-center">
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.followers_count}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Followers
                          </p>
                        </div>
                      )}
                      {user.reviews_count !== undefined && (
                        <div className="text-center">
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {user.reviews_count}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Reviews
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && paginatedResults.length === 0 && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <NothingFound message={'No Matching Search Results'} />
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 gap-4 animate-[fadeIn_0.5s_ease-in-out]">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 border rounded ${
              darkMode ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-black hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            Prev
          </button>
          <span className="font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 border rounded ${
              darkMode ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-black hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            Next
          </button>
        </div>
      )}

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
};

export default SearchResults;