import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import image from '../assets/image.png'
import NothingFound from '../components/NothingFound';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.darkMode.darkMode);
  const base = import.meta.env.VITE_API_BASE_URL;

  if(!query){
    navigate('/')
  }

  const [category, setCategory] = useState('movie');
  const [allMovieResults, setAllMovieResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(1);
  const [resultsPerPage] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi'];
  const years = Array.from({ length: 70 }, (_, i) => `${2025 - i}`);

  const filteredMovieResults = allMovieResults.filter((movie) =>
    (!genreFilter || movie.genre === genreFilter) &&
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
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${base}/movie/search/${query}`, {
          params: {
            genre: category === 'movie' ? genreFilter : '',
            year: category === 'movie' ? yearFilter : '',
            category,
          },
        });

        if (category === 'movie') {
          setAllMovieResults(res.data.results || []);
        } else {
          setUserResults(res.data.users || []);
        }

        setPage(1);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch results.');
        setAllMovieResults([]);
        setUserResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, genreFilter, yearFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-8 ${darkMode ? 'text-white' : 'text-black'}`}>
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-md bg-transparent ${darkMode ? 'border-gray-600 text-white' : 'text-black'}`}
        >
          <option className={darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'bg-[#aaabad] text-black'} value="movie">Movies</option>
          <option className={darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'bg-[#aaabad] text-black'} value="user">Users</option>
        </select>

        {category === 'movie' && (
          <>
            <select
              value={genreFilter}
              onChange={(e) => {
                setGenreFilter(e.target.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md ${darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'bg-[#aaabad] text-black'}`}
            >
              <option className={darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'bg-[#aaabad] text-black'} value="">All Genres</option>
              {genres.map((g) => <option key={g}>{g}</option>)}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md bg-transparent ${darkMode ? 'border-gray-600 text-white' : 'text-black'}`}
            >
              <option className={darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'bg-[#aaabad] text-black'} value="">All Years</option>
              {years.map((y) => <option className={darkMode ? 'border-gray-600 bg-[#2e3237] text-white' : 'bg-[#aaabad] text-black'} key={y}>{y}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Loading/Error */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Results */}
      {!loading && paginatedResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {category === 'movie' ? (
            paginatedResults.map((movie) => (
              <div
                key={movie.movie_id}
                className={`cursor-pointer border rounded-lg shadow-md overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
                onClick={() => navigate(`/movie/${movie.movie_id}`)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster}` || '/placeholder.jpg'}
                  alt={movie.title}
                  onError={(e) => (e.target.src = '/placeholder.jpg')}
                  className="h-72 w-full object-cover"
                />
                <div className={`p-3 ${darkMode ? 'bg-[#aaabad]' : 'bg-[#2e3237]'}`}>
                  <h2 className={`text-md font-semibold truncate ${darkMode ? 'text-gray-700' : 'text-white'}`}>{movie.title}</h2>
                  <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                    {movie.genre} • {movie.year}
                  </p>
                </div>
              </div>
            ))
          ) : (
            paginatedResults.map((user) => (
              <div
                key={user.username}
                className={`cursor-pointer border rounded-lg shadow-md overflow-hidden flex flex-col items-center gap-4 p-4 ${darkMode ? 'border-gray-700 bg-[#aaabad]' : 'bg-[#2e3237] border-gray-300'}`}
                onClick={() => navigate(`/${user.username}/profile`)}
              >
                <img
                  src={user.pfp_url || image}
                  alt={user.username}
                  className={`${darkMode?'border-[#2e3237]':'border-[#aaabad]'}  w-16 h-16 rounded-full object-cover`}
                />
                <span className={`${darkMode?'text-[#2e3237]':'text-[#aaabad]'} font-semibold`}>{user.username}</span>
              </div>
            ))
          )}
        </div>
      ):(<NothingFound message={'No Matching Search Results'}/>)}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 gap-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 border rounded ${darkMode ? 'border-gray-600 text-white' : 'text-black'} disabled:opacity-50`}
          >
            Prev
          </button>
          <span>{page} / {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 border rounded ${darkMode ? 'border-gray-600 text-white' : 'text-black'} disabled:opacity-50`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
