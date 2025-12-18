import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import imdbLight from '../assets/imdb-light-mode.svg';
import imdbDark from '../assets/imdb-dark-mode.svg';
import tmdbDark from '../assets/tmdb-dark-mode.svg';
import tmdbLight from '../assets/tmdb-light-mode.svg';
import Loader from '../components/Loader';
import userAltImage from '../assets/userAlternate.png';

const base = import.meta.env.VITE_API_BASE_URL;

// Memoize image URL generation
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const getTmdbImage = (path, size = 'w500') => 
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

// Skeleton Components
const ProfileSkeleton = ({ darkMode }) => (
  <div className="lg:w-1/3 w-full mb-6 lg:mb-0 flex-shrink-0">
    <div className={`rounded-lg shadow-lg w-full aspect-[2/3] ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    } animate-pulse`}></div>
  </div>
);

const InfoSkeleton = ({ darkMode }) => (
  <div className="lg:w-2/3 w-full lg:ml-8">
    <div className={`h-10 w-64 mb-4 rounded ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    } animate-pulse`}></div>
    
    <div className="space-y-3 mb-6">
      <div className={`h-5 w-48 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
      <div className={`h-5 w-56 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
    </div>

    <div className="space-y-2">
      <div className={`h-4 w-full rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
      <div className={`h-4 w-full rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
      <div className={`h-4 w-3/4 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
    </div>

    <div className="flex gap-2 mt-5">
      <div className={`h-10 w-10 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
      <div className={`h-10 w-16 rounded ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      } animate-pulse`}></div>
    </div>
  </div>
);

const CreditsGridSkeleton = ({ darkMode, count = 8 }) => (
  <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(count)].map((_, i) => (
      <div 
        key={i} 
        className={`rounded-md aspect-[2/3] ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        } animate-pulse`}
      ></div>
    ))}
  </div>
);

const TabsSkeleton = ({ darkMode }) => (
  <div className="flex gap-2 border-b pb-2">
    <div className={`h-10 w-32 rounded-t-md ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    } animate-pulse`}></div>
    <div className={`h-10 w-32 rounded-t-md ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    } animate-pulse`}></div>
  </div>
);

// Separate memoized components
const CreditCard = React.memo(({ item, showCharacters = false, showJobs = false }) => {
  const id = item.movie_id ?? item.id;
  const title = item.title ?? 'Untitled';
  const poster = getTmdbImage(item.poster_path) || userAltImage;
  
  return (
    <Link 
      to={`/movie/${id}`} 
      className="relative rounded-md overflow-hidden group block"
      aria-label={`View ${title}`}
    >
      <img 
        src={poster} 
        alt={title} 
        className="z-0 min-h-56 w-full rounded-md object-cover group-hover:brightness-110 transition-brightness duration-200" 
        loading="lazy" 
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
      <div className="absolute bottom-4 left-4 text-left">
        <h3 className="text-lg font-semibold text-white line-clamp-1">{title}</h3>
        {showCharacters && item.charactersLabel && (
          <p className="text-sm text-gray-300">{item.charactersLabel}</p>
        )}
        {showJobs && item.jobsLabel && (
          <p className="text-sm text-gray-300">{item.jobsLabel}</p>
        )}
        {item.overview && (
          <p className="mt-2 text-sm text-gray-300 line-clamp-3">{item.overview}</p>
        )}
      </div>
    </Link>
  );
});
CreditCard.displayName = 'CreditCard';

// Separate component for credits grid
const CreditsGrid = React.memo(({ items, showCharacters, showJobs, isEmpty }) => {
  if (isEmpty) return <p className="text-gray-500">No credits found.</p>;
  
  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <CreditCard 
          key={item.movie_id} 
          item={item} 
          showCharacters={showCharacters}
          showJobs={showJobs}
        />
      ))}
    </div>
  );
});
CreditsGrid.displayName = 'CreditsGrid';

// Profile section component
const ProfileSection = React.memo(({ actorDetails }) => {
  const profileImage = getTmdbImage(actorDetails?.profile_path) || userAltImage;
  
  return (
    <div className="lg:w-1/3 w-full mb-6 lg:mb-0 flex-shrink-0">
      <img 
        src={profileImage} 
        alt={`${actorDetails?.name ?? 'Actor'} profile`} 
        className="rounded-lg shadow-lg w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
});
ProfileSection.displayName = 'ProfileSection';

// Info section component
const InfoSection = React.memo(({ actorDetails, darkMode, personId }) => {
  return (
    <div className="lg:w-2/3 w-full lg:ml-8">
      <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
        {actorDetails?.name ?? 'Unknown'}
      </h1>

      <div className={`space-y-2 mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
        <div className="inline-flex gap-1">
          <strong>Nationality:</strong>
          <p className={`${darkMode ? 'hover:text-white' : 'hover:text-black'} font-medium`}>
            {actorDetails?.place_of_birth ?? 'N/A'}
          </p>
        </div>
        <p><strong>Known for:</strong> {actorDetails?.known_for_department ?? 'N/A'}</p>
      </div>

      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
        {actorDetails?.biography ?? 'Biography not available.'}
      </p>

      <div className="inline-flex gap-2 mt-5 opacity-80">
        {actorDetails?.imdb_id && (
          <a 
            href={`https://www.imdb.com/name/${actorDetails.imdb_id}/`} 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="View on IMDb"
          >
            <img src={darkMode ? imdbDark : imdbLight} className="w-10" alt="IMDb" />
          </a>
        )}
        <a 
          href={`https://www.themoviedb.org/person/${actorDetails?.id ?? personId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="View on TMDB"
        >
          <img src={darkMode ? tmdbDark : tmdbLight} className="w-16 pt-2.5" alt="TMDB" />
        </a>
      </div>
    </div>
  );
});
InfoSection.displayName = 'InfoSection';

// Main grouping function (pure, reusable)
function groupCredits(items, isCast = true) {
  const map = new Map();
  
  for (const item of items) {
    const movieId = item.id;
    if (!movieId) continue;
    
    if (!map.has(movieId)) {
      map.set(movieId, {
        movie_id: movieId,
        id: movieId,
        title: item.title ?? item.original_title ?? item.name,
        poster_path: item.poster_path,
        release_date: item.release_date,
        overview: item.overview,
        popularity: item.popularity ?? 0,
        vote_count: item.vote_count ?? 0,
        ...(isCast ? {
          characters: [item.character].filter(Boolean),
          orders: Number.isFinite(item.order) ? [item.order] : [],
        } : {
          jobs: [item.job].filter(Boolean),
          departments: [item.department].filter(Boolean),
        })
      });
    } else {
      const existing = map.get(movieId);
      if (isCast) {
        if (item.character && !existing.characters.includes(item.character)) {
          existing.characters.push(item.character);
        }
        if (Number.isFinite(item.order) && !existing.orders.includes(item.order)) {
          existing.orders.push(item.order);
        }
      } else {
        if (item.job && !existing.jobs.includes(item.job)) {
          existing.jobs.push(item.job);
        }
        if (item.department && !existing.departments.includes(item.department)) {
          existing.departments.push(item.department);
        }
      }
      existing.popularity = Math.max(existing.popularity, item.popularity ?? 0);
      existing.vote_count = Math.max(existing.vote_count, item.vote_count ?? 0);
      existing.poster_path = existing.poster_path || item.poster_path;
      existing.overview = existing.overview || item.overview;
      existing.release_date = existing.release_date || item.release_date;
    }
  }

  const sorted = Array.from(map.values()).map(it => {
    const labels = isCast ? it.characters.join(', ') : it.jobs.join(', ');
    return {
      ...it,
      ...(isCast ? { charactersLabel: labels } : { jobsLabel: labels }),
    };
  });

  sorted.sort((a, b) => {
    const timeA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const timeB = b.release_date ? new Date(b.release_date).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.popularity ?? 0) - (a.popularity ?? 0);
  });

  return sorted;
}

function PersonProfile() {
  const { personId } = useParams();
  const darkMode = useSelector((s) => s.darkMode?.darkMode);
  
  // Local state
  const [actorDetails, setActorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cast');
  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    credits: true
  });

  // Fetch actor details
  useEffect(() => {
    if (!personId) return;

    const fetchActorDetails = async () => {
      setLoading(true);
      setError(null);
      setLoadingStates({ profile: true, credits: true });
      
      try {
        const response = await axios.get(`${base}/person/${personId}`);
        setActorDetails(response.data);
        
        // Simulate progressive loading - profile loads first
        setLoadingStates({ profile: false, credits: true });
        
        // Credits load slightly after
        setTimeout(() => {
          setLoadingStates({ profile: false, credits: false });
        }, 300);
        
      } catch (err) {
        console.error('Error fetching actor details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load actor details');
      } finally {
        setLoading(false);
      }
    };

    fetchActorDetails();
  }, [personId]);

  // Memoize grouped data - only recalculate when credits change
  const groupedCast = useMemo(
    () => groupCredits(actorDetails?.credits?.cast ?? [], true),
    [actorDetails?.credits?.cast]
  );

  const groupedCrew = useMemo(
    () => groupCredits(actorDetails?.credits?.crew ?? [], false),
    [actorDetails?.credits?.crew]
  );

  const castCount = groupedCast.length;
  const crewCount = groupedCrew.length;

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  if (loading && !actorDetails) return <Loader />;
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const hasCredits = castCount > 0 || crewCount > 0;

  return (
    <div className={`container mx-auto p-4 ${darkMode ? 'bg-transparent text-white' : 'bg-transparent text-black'}`}>
      {/* Profile and Info Section */}
      {loadingStates.profile ? (
        <div className="flex flex-col lg:flex-row gap-8">
          <ProfileSkeleton darkMode={darkMode} />
          <InfoSkeleton darkMode={darkMode} />
        </div>
      ) : actorDetails ? (
        <div className="flex flex-col lg:flex-row gap-8 animate-[fadeIn_0.3s_ease-in-out]">
          <ProfileSection actorDetails={actorDetails} />
          <InfoSection 
            actorDetails={actorDetails} 
            darkMode={darkMode} 
            personId={personId}
          />
        </div>
      ) : null}

      {/* Credits Section */}
      {actorDetails && (
        <div className="mt-8">
          {loadingStates.credits ? (
            <>
              <TabsSkeleton darkMode={darkMode} />
              <div className="pt-4">
                <CreditsGridSkeleton darkMode={darkMode} count={8} />
              </div>
            </>
          ) : hasCredits ? (
            <div className="animate-[fadeIn_0.3s_ease-in-out]">
              <div role="tablist" aria-label="Credits tabs" className="flex gap-2 border-b pb-2">
                <button 
                  role="tab" 
                  aria-selected={activeTab === 'cast'} 
                  aria-controls="tab-cast" 
                  id="tab-btn-cast" 
                  onClick={() => handleTabChange('cast')}
                  className={`px-4 py-2 rounded-t-md transition-colors ${
                    activeTab === 'cast' 
                      ? 'bg-white/5 border border-b-0' 
                      : 'bg-transparent hover:bg-white/5'
                  }`}
                >
                  Cast ({castCount})
                </button>
                <button 
                  role="tab" 
                  aria-selected={activeTab === 'crew'} 
                  aria-controls="tab-crew" 
                  id="tab-btn-crew" 
                  onClick={() => handleTabChange('crew')}
                  className={`px-4 py-2 rounded-t-md transition-colors ${
                    activeTab === 'crew' 
                      ? 'bg-white/5 border border-b-0' 
                      : 'bg-transparent hover:bg-white/5'
                  }`}
                >
                  Crew ({crewCount})
                </button>
              </div>

              {activeTab === 'cast' && (
                <div id="tab-cast" role="tabpanel" aria-labelledby="tab-btn-cast" className="pt-4">
                  <CreditsGrid 
                    items={groupedCast} 
                    showCharacters 
                    isEmpty={castCount === 0}
                  />
                </div>
              )}

              {activeTab === 'crew' && (
                <div id="tab-crew" role="tabpanel" aria-labelledby="tab-btn-crew" className="pt-4">
                  <CreditsGrid 
                    items={groupedCrew} 
                    showJobs 
                    isEmpty={crewCount === 0}
                  />
                </div>
              )}
            </div>
          ) : null}
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
}

export default PersonProfile;