import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux';
import imdbLight from '../assets/imdb-light-mode.svg';
import imdbDark from '../assets/imdb-dark-mode.svg';
import tmdbDark from '../assets/tmdb-dark-mode.svg';
import tmdbLight from '../assets/tmdb-light-mode.svg';
import userAltImage from '../assets/userAlternate.png';
import ReviewForm from '../components/ReviewForm';
import Loader from '../components/Loader';
import axios from 'axios';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const CAST_LIMIT = 10;
const base = import.meta.env.VITE_API_BASE_URL;

// Memoized credit card with lazy loading
const CreditCard = React.memo(({ person, role, darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const profileImage = person.profile_path ? `${TMDB_IMAGE_BASE}/w185${person.profile_path}` : userAltImage;

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

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <Link
      ref={cardRef}
      to={`/person/${person.id}`}
      className="relative rounded-md overflow-hidden group block h-64"
      aria-label={`View ${person.name} profile`}
    >
      {isVisible ? (
        profileImage ? (
          <img
            src={profileImage}
            alt={person.name}
            className="w-full h-full object-cover group-hover:brightness-110 transition-brightness duration-200"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>No Image</span>
          </div>
        )
      ) : (
        <div className={`w-full h-full ${darkMode ? 'bg-gray-800' : 'bg-gray-300'} animate-pulse`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
      <div className="absolute bottom-4 left-4 text-left">
        <h3 className="text-lg font-semibold text-white line-clamp-1">{person.name}</h3>
        {role && <p className="text-sm text-gray-300">{role}</p>}
      </div>
    </Link>
  );
});
CreditCard.displayName = 'CreditCard';

// Memoized cast grid with pagination
const CastGrid = React.memo(({ cast, darkMode }) => {
  const [displayCount, setDisplayCount] = useState(12);
  const loadMoreRef = useRef(null);

  const displayedCast = useMemo(() => {
    return cast.slice(0, displayCount);
  }, [cast, displayCount]);

  const hasMore = displayCount < cast.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplayCount(prev => Math.min(prev + 12, cast.length));
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, cast.length]);

  if (!cast || cast.length === 0) {
    return (
      <p className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        No cast information available.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCast.map((actor) => (
          <CreditCard
            key={actor.id}
            person={actor}
            role={actor.character || 'Unknown Character'}
            darkMode={darkMode}
          />
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
CastGrid.displayName = 'CastGrid';

// Memoized crew grid with pagination
const CrewGrid = React.memo(({ crew, darkMode }) => {
  const [displayCount, setDisplayCount] = useState(12);
  const loadMoreRef = useRef(null);

  const displayedCrew = useMemo(() => {
    return crew.slice(0, displayCount);
  }, [crew, displayCount]);

  const hasMore = displayCount < crew.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplayCount(prev => Math.min(prev + 12, crew.length));
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, crew.length]);

  if (!crew || crew.length === 0) {
    return (
      <p className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        No crew information available.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCrew.map((crewMember) => (
          <CreditCard
            key={`${crewMember.id}-${crewMember.job}`}
            person={crewMember}
            role={crewMember.job || 'Unknown Role'}
            darkMode={darkMode}
          />
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
CrewGrid.displayName = 'CrewGrid';

// Memoized poster section with lazy loading
const PosterSection = React.memo(({ posterPath, title, darkMode }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="lg:w-1/3 w-full mb-6 lg:mb-0 flex-shrink-0">
      {!imageLoaded && (
        <div className={`rounded-lg shadow-lg w-full aspect-[2/3] ${
          darkMode ? 'bg-gray-800' : 'bg-gray-300'
        } animate-pulse`} />
      )}
      <img
        src={`${TMDB_IMAGE_BASE}/w500${posterPath}`}
        alt={title}
        className={`rounded-lg shadow-lg w-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
        loading="eager"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
});
PosterSection.displayName = 'PosterSection';

// Memoized info section
const InfoSection = React.memo(({ movieDetails, darkMode, director }) => (
  <div className="lg:w-2/3 w-full lg:ml-8">
    <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
      {movieDetails.title || 'Unknown Title'}
    </h1>

    <div className={`space-y-2 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
      {director && (
        <p className="inline-flex gap-1">
          <strong>Director:</strong>
          <Link 
            to={`/person/${director.id}`} 
            className={`${darkMode ? 'hover:text-white' : 'hover:text-black'} font-medium transition-colors`}
          >
            {director.name}
          </Link>
        </p>
      )}
      {movieDetails.runtime && (
        <p><strong>Runtime:</strong> {movieDetails.runtime} mins</p>
      )}
    </div>

    {movieDetails.overview && (
      <p className={`leading-relaxed ${darkMode ? 'text-gray-500' : 'text-gray-700'}`}>
        {movieDetails.overview}
      </p>
    )}

    <div className="inline-flex gap-2 mt-5 opacity-70 hover:opacity-100 transition-opacity">
      {movieDetails.imdb_id && (
        <a 
          href={`https://www.imdb.com/title/${movieDetails.imdb_id}`} 
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on IMDb"
        >
          <img 
            src={darkMode ? imdbDark : imdbLight} 
            className="w-10 transition-transform hover:scale-110" 
            alt="IMDb" 
          />
        </a>
      )}
      <a 
        href={`https://www.themoviedb.org/movie/${movieDetails.id}`} 
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View on TMDB"
      >
        <img 
          src={darkMode ? tmdbDark : tmdbLight} 
          className="w-16 pt-2.5 transition-transform hover:scale-110" 
          alt="TMDB" 
        />
      </a>
    </div>
  </div>
));
InfoSection.displayName = 'InfoSection';

// Memoized tab button
const TabButton = React.memo(({ 
  label, 
  isActive, 
  onClick, 
  disabled, 
  darkMode 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-pressed={isActive}
    className={`pb-2 font-semibold text-lg transition-colors duration-300 ${
      isActive 
        ? `border-b-2 ${darkMode ? 'border-white text-white' : 'border-black text-black'}` 
        : `${darkMode ? 'text-gray-400' : 'text-gray-500'} ${!disabled && 'hover:text-gray-300'}`
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {label}
  </button>
));
TabButton.displayName = 'TabButton';

const MovieDetails = () => {
  const { movieId } = useParams(); 
  const dispatch = useDispatch();
  
  const darkMode = useSelector(state => state.darkMode.darkMode);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cast');

  // Fetch movie details
  useEffect(() => {
    if (!movieId) return;

    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${base}/movie/${movieId}`);
        setMovieDetails(response.data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  // Memoize derived values
  const director = useMemo(() => 
    movieDetails?.credits?.crew?.find(person => person.job === 'Director'),
    [movieDetails?.credits?.crew]
  );

  const cast = useMemo(() => 
    movieDetails?.credits?.cast ?? [],
    [movieDetails?.credits?.cast]
  );

  const crew = useMemo(() => {
    const allCrew = movieDetails?.credits?.crew ?? [];
    const map = new Map();
    for (const member of allCrew) {
      if (member.job === 'Director') continue;
      const key = `${member.id}-${member.job}`;
      if (!map.has(key)) {
        map.set(key, member);
      }
    }
    return Array.from(map.values()).slice(0, 20);
  }, [movieDetails?.credits?.crew]);

  const handleTabClick = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleJournalClick = useCallback(() => {
    if (isAuthenticated) {
      handleTabClick('log');
    }
  }, [isAuthenticated, handleTabClick]);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    return error?.message ?? 'Something went wrong';
  }, [error]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 p-4">Error: {errorMessage}</p>;

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'bg-transparent text-white' : 'bg-transparent text-black'}`}>
      <div className="flex flex-col lg:flex-row gap-8">
        <PosterSection 
          posterPath={movieDetails.poster_path} 
          title={movieDetails.title}
          darkMode={darkMode}
        />
        <InfoSection 
          movieDetails={movieDetails}
          darkMode={darkMode}
          director={director}
        />
      </div>

      {/* Tabs */}
      <div className={`flex space-x-6 border-b-2 mt-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <TabButton
          label="Cast"
          isActive={activeTab === 'cast'}
          onClick={() => handleTabClick('cast')}
          darkMode={darkMode}
        />
        <TabButton
          label="Crew"
          isActive={activeTab === 'crew'}
          onClick={() => handleTabClick('crew')}
          darkMode={darkMode}
        />
        <TabButton
          label="Add to Journal"
          isActive={activeTab === 'log'}
          onClick={handleJournalClick}
          disabled={!isAuthenticated}
          darkMode={darkMode}
        />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'cast' && (
          <CastGrid 
            cast={cast}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'crew' && (
          <CrewGrid 
            crew={crew}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'log' && isAuthenticated && (
          <ReviewForm movie={movieDetails} />
        )}
      </div>
    </div>
  );
};

export default MovieDetails;