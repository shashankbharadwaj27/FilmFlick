import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import { Link, useParams } from 'react-router-dom';
import { fetchTargetUserProfile, clearErrors } from '../features/targetUserSlice';
import { getUserReviews } from '../features/userDataSlice';
import { format } from 'date-fns';

// Skeleton Components
const GridReviewSkeleton = ({ darkMode }) => (
    <div className={`aspect-[2/3] rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
);

const ListReviewSkeleton = ({ darkMode }) => (
    <div className={`flex gap-4 p-4 rounded-lg shadow-md ${
        darkMode ? 'bg-[#1E1E1E] border border-gray-700/50' : 'bg-white border border-gray-200'
    }`}>
        <div className={`w-20 sm:w-24 aspect-[2/3] rounded-md flex-shrink-0 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
        } animate-pulse`} />
        <div className="flex-1 space-y-3">
            <div className={`h-6 w-3/4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
            <div className={`h-4 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
            <div className={`h-4 w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
            <div className={`h-12 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
        </div>
    </div>
);

// Lazy loaded review card for grid view
const GridReviewCard = React.memo(({ review, username, darkMode, formatDate }) => {
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
                rootMargin: '100px',
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
            to={`/${username}/review/${review.review_id}`}
            className="group relative"
        >
            <div className="relative overflow-hidden rounded-md shadow-md group-hover:shadow-xl transition-all duration-300">
                {isVisible ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${review.poster_path}`}
                        alt={review.title}
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className={`w-full aspect-[2/3] ${darkMode ? 'bg-gray-800' : 'bg-gray-300'} animate-pulse`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                        <h4 className="text-white font-bold text-xs sm:text-sm mb-1 line-clamp-2 leading-tight">
                            {review.title}
                        </h4>
                        <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: Math.min(review.rating, 5) }).map((_, index) => (
                                <span key={index} className="text-yellow-400 text-xs">★</span>
                            ))}
                        </div>
                        <p className="text-gray-300 text-xs font-mono">
                            {formatDate(review.review_date)}
                        </p>
                        {review.rewatch && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full font-medium">
                                Rewatch
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
});
GridReviewCard.displayName = 'GridReviewCard';

// Lazy loaded review card for list view
const ListReviewCard = React.memo(({ review, username, darkMode, formatDate }) => {
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
                rootMargin: '100px',
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
            to={`/${username}/review/${review.review_id}`}
            className={`flex gap-4 p-4 rounded-lg transition-all group shadow-md ${
                darkMode
                    ? 'bg-[#1E1E1E] hover:bg-gray-700 border border-gray-700/50'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
        >
            {isVisible ? (
                <img
                    src={`https://image.tmdb.org/t/p/w500${review.poster_path}`}
                    alt={review.title}
                    className="w-20 sm:w-24 h-auto object-cover rounded-md flex-shrink-0 shadow-sm"
                    loading="lazy"
                />
            ) : (
                <div className={`w-20 sm:w-24 aspect-[2/3] rounded-md flex-shrink-0 ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-300'
                } animate-pulse`} />
            )}
            <div className="flex-1 min-w-0">
                <h3 className={`text-base sm:text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors tracking-tight ${
                    darkMode ? 'text-white' : 'text-gray-900'
                }`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                    {review.title}
                </h3>
                <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: Math.min(review.rating, 5) }).map((_, index) => (
                        <span key={index} className="text-yellow-400 text-sm">★</span>
                    ))}
                </div>
                <p className={`text-xs sm:text-sm mb-2 font-mono ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                    {formatDate(review.review_date)}
                    {review.rewatch && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full font-medium">
                            Rewatch
                        </span>
                    )}
                </p>
                {review.review && (
                    <p className={`text-sm line-clamp-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                        {review.review}
                    </p>
                )}
            </div>
        </Link>
    );
});
ListReviewCard.displayName = 'ListReviewCard';

function Journal() {
    const { isLoading, user, error: authError } = useSelector(state => state.auth);
    const targetUser = useSelector(state => state.targetUser.targetUser);
    const { reviews: userReviews, loading: userDataLoading } = useSelector(state => state.userData);
    const darkMode = useSelector(state => state.darkMode.darkMode);
    
    const dispatch = useDispatch();
    const { username } = useParams();
    
    const isOwnProfile = username === user?.username;

    // Loading states
    const [loadingStates, setLoadingStates] = useState({
        profile: true,
        reviews: true
    });

    // Filter states
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [viewMode, setViewMode] = useState('grid');

    // Pagination for infinite scroll
    const [displayCount, setDisplayCount] = useState(24);
    const loadMoreRef = useRef(null);

    // Fetch data on mount or when username changes
    useEffect(() => {
        if (isOwnProfile) {
            dispatch(getUserReviews({ username }))
                .finally(() => setLoadingStates(prev => ({ ...prev, reviews: false })));
        } else {
            dispatch(fetchTargetUserProfile(username))
                .finally(() => setLoadingStates(prev => ({ ...prev, profile: false, reviews: false })));
        }
        
        return () => dispatch(clearErrors());
    }, [dispatch, username, isOwnProfile]);

    // Get reviews
    const reviews = useMemo(() => {
        return isOwnProfile ? userReviews : targetUser?.reviews;
    }, [isOwnProfile, userReviews, targetUser?.reviews]);

    // Get available years
    const availableYears = useMemo(() => {
        if (!reviews?.length) return [];
        const years = [...new Set(reviews.map(r => new Date(r.review_date).getFullYear()))];
        return years.sort((a, b) => b - a);
    }, [reviews]);

    // Set initial year
    useEffect(() => {
        if (availableYears.length > 0 && !selectedYear) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    // Get month counts for selected year
    const monthCounts = useMemo(() => {
        if (!reviews?.length || !selectedYear) return {};
        
        return reviews.reduce((acc, review) => {
            const reviewDate = new Date(review.review_date);
            const reviewYear = reviewDate.getFullYear();
            
            if (reviewYear === selectedYear) {
                const monthName = format(reviewDate, 'MMMM');
                acc[monthName] = (acc[monthName] || 0) + 1;
            }
            return acc;
        }, {});
    }, [reviews, selectedYear]);

    // Get rating counts
    const ratingCounts = useMemo(() => {
        if (!reviews?.length) return {};
        
        const filteredByYear = selectedYear 
            ? reviews.filter(r => new Date(r.review_date).getFullYear() === selectedYear)
            : reviews;

        return filteredByYear.reduce((acc, review) => {
            const rating = review.rating || 0;
            acc[rating] = (acc[rating] || 0) + 1;
            return acc;
        }, {});
    }, [reviews, selectedYear]);

    // Get type counts (rewatch vs first watch)
    const typeCounts = useMemo(() => {
        if (!reviews?.length) return { rewatch: 0, firstWatch: 0 };
        
        const filteredByYear = selectedYear 
            ? reviews.filter(r => new Date(r.review_date).getFullYear() === selectedYear)
            : reviews;

        return {
            rewatch: filteredByYear.filter(r => r.rewatch).length,
            firstWatch: filteredByYear.filter(r => !r.rewatch).length
        };
    }, [reviews, selectedYear]);

    // Filter reviews
    const filteredReviews = useMemo(() => {
        if (!reviews?.length) return [];
        
        return reviews.filter(review => {
            const reviewDate = new Date(review.review_date);
            const reviewYear = reviewDate.getFullYear();
            const reviewMonth = format(reviewDate, 'MMMM');
            
            if (selectedYear && reviewYear !== selectedYear) return false;
            if (selectedMonth !== 'All' && reviewMonth !== selectedMonth) return false;
            if (selectedRating !== 'All' && review.rating !== parseInt(selectedRating)) return false;
            if (selectedType === 'Rewatch' && !review.rewatch) return false;
            if (selectedType === 'First Watch' && review.rewatch) return false;
            
            return true;
        }).sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
    }, [reviews, selectedYear, selectedMonth, selectedRating, selectedType]);

    // Displayed reviews with pagination
    const displayedReviews = useMemo(() => {
        return filteredReviews.slice(0, displayCount);
    }, [filteredReviews, displayCount]);

    const hasMore = displayCount < filteredReviews.length;

    // Reset display count when filters change
    useEffect(() => {
        setDisplayCount(24);
    }, [selectedYear, selectedMonth, selectedRating, selectedType, viewMode]);

    // Infinite scroll observer
    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setDisplayCount(prev => Math.min(prev + 24, filteredReviews.length));
                }
            },
            {
                rootMargin: '300px',
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
    }, [hasMore, filteredReviews.length]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : 'Unknown';
    };

    // Show skeleton loader while initial data is loading
    if (loadingStates.reviews || (isLoading && !reviews)) {
        return (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
                    {/* Sidebar Skeleton */}
                    <aside className={`rounded-lg p-5 h-fit lg:sticky lg:top-6 shadow-md ${
                        darkMode ? 'bg-[#1E1E1E] border border-gray-700/50' : 'bg-white border border-gray-200'
                    }`}>
                        <div className={`h-6 w-20 mb-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`h-10 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
                            ))}
                        </div>
                    </aside>

                    {/* Main Content Skeleton */}
                    <main>
                        <div className="mb-6">
                            <div className={`h-9 w-64 mb-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
                            <div className={`h-4 w-40 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse`} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {[...Array(12)].map((_, i) => (
                                <GridReviewSkeleton key={i} darkMode={darkMode} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (authError) return (
        <div className="text-red-500 text-center mt-4">
            Error fetching profile: {authError.message}
        </div>
    );

    const displayName = isOwnProfile ? user?.name : targetUser?.userInfo?.name;
    const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
                {/* Sidebar */}
                <aside className={`rounded-lg p-5 h-fit lg:sticky lg:top-6 shadow-md ${
                    darkMode ? 'bg-[#1E1E1E] border border-gray-700/50' : 'bg-white border border-gray-200'
                }`}>
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className={`text-xl font-bold mb-1 tracking-tight ${
                            darkMode ? 'text-white' : 'text-gray-900'
                        }`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                            Filters
                        </h2>
                        <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {filteredReviews.length} results
                        </p>
                    </div>

                    {/* Reset Filters */}
                    {(selectedMonth !== 'All' || selectedRating !== 'All' || selectedType !== 'All') && (
                        <button
                            onClick={() => {
                                setSelectedMonth('All');
                                setSelectedRating('All');
                                setSelectedType('All');
                            }}
                            className={`w-full mb-6 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                                darkMode
                                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                        >
                            Reset Filters
                        </button>
                    )}

                    {/* Year Filter */}
                    <div className="mb-6">
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            Year
                        </div>
                        <div className="space-y-2">
                            {availableYears.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                                        selectedYear === year
                                            ? darkMode
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-500 text-white'
                                            : darkMode
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span>{year}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        selectedYear === year
                                            ? 'bg-white text-blue-600'
                                            : darkMode
                                                ? 'bg-gray-600 text-gray-300'
                                                : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {reviews?.filter(r => new Date(r.review_date).getFullYear() === year).length || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month Filter */}
                    <div className="mb-6">
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            Month
                        </div>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                            <button
                                onClick={() => setSelectedMonth('All')}
                                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                    selectedMonth === 'All'
                                        ? darkMode
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-500 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span>All Months</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    selectedMonth === 'All'
                                        ? 'bg-white text-blue-600'
                                        : darkMode
                                            ? 'bg-gray-600 text-gray-300'
                                            : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {selectedYear ? reviews?.filter(r => new Date(r.review_date).getFullYear() === selectedYear).length : reviews?.length || 0}
                                </span>
                            </button>
                            {allMonths.map((month) => {
                                const count = monthCounts[month] || 0;
                                if (count === 0) return null;
                                
                                return (
                                    <button
                                        key={month}
                                        onClick={() => setSelectedMonth(month)}
                                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                            selectedMonth === month
                                                ? darkMode
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-blue-500 text-white'
                                                : darkMode
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span>{month}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            selectedMonth === month
                                                ? 'bg-white text-blue-600'
                                                : darkMode
                                                    ? 'bg-gray-600 text-gray-300'
                                                    : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="mb-6">
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            Rating
                        </div>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedRating('All')}
                                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                    selectedRating === 'All'
                                        ? darkMode
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-500 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span>All Ratings</span>
                            </button>
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = ratingCounts[rating] || 0;
                                if (count === 0) return null;
                                
                                return (
                                    <button
                                        key={rating}
                                        onClick={() => setSelectedRating(rating.toString())}
                                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                            selectedRating === rating.toString()
                                                ? darkMode
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-blue-500 text-white'
                                                : darkMode
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: rating }).map((_, i) => (
                                                <span key={i} className="text-yellow-400">★</span>
                                            ))}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            selectedRating === rating.toString()
                                                ? 'bg-white text-blue-600'
                                                : darkMode
                                                    ? 'bg-gray-600 text-gray-300'
                                                    : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="mb-6">
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            Watch Type
                        </div>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedType('All')}
                                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                    selectedType === 'All'
                                        ? darkMode
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-500 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span>All Types</span>
                            </button>
                            {typeCounts.firstWatch > 0 && (
                                <button
                                    onClick={() => setSelectedType('First Watch')}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                        selectedType === 'First Watch'
                                            ? darkMode
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-500 text-white'
                                            : darkMode
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span>First Watch</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        selectedType === 'First Watch'
                                            ? 'bg-white text-blue-600'
                                            : darkMode
                                                ? 'bg-gray-600 text-gray-300'
                                                : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {typeCounts.firstWatch}
                                    </span>
                                </button>
                            )}
                            {typeCounts.rewatch > 0 && (
                                <button
                                    onClick={() => setSelectedType('Rewatch')}
                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                        selectedType === 'Rewatch'
                                            ? darkMode
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-500 text-white'
                                            : darkMode
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <span>Rewatch</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        selectedType === 'Rewatch'
                                            ? 'bg-white text-blue-600'
                                            : darkMode
                                                ? 'bg-gray-600 text-gray-300'
                                                : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {typeCounts.rewatch}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main>
                    {/* Header with view toggle */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold mb-1 tracking-tight ${
                                darkMode ? 'text-white' : 'text-gray-900'
                            }`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                                {displayName}'s Journal
                            </h1>
                            <p className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Showing {displayedReviews.length} of {filteredReviews.length} reviews
                            </p>
                        </div>

                        {/* View Toggle */}
                        <div className={`flex rounded-lg overflow-hidden shadow-sm ${
                            darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                        }`}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                    viewMode === 'grid'
                                        ? darkMode
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-500 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                    viewMode === 'list'
                                        ? darkMode
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-500 text-white'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                List
                            </button>
                        </div>
                    </div>

                    {/* Reviews Display */}
                    {filteredReviews.length > 0 ? (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                    {displayedReviews.map((review) => (
                                        <GridReviewCard
                                            key={review.review_id}
                                            review={review}
                                            username={username}
                                            darkMode={darkMode}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {displayedReviews.map((review) => (
                                        <ListReviewCard
                                            key={review.review_id}
                                            review={review}
                                            username={username}
                                            darkMode={darkMode}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Load more trigger */}
                            {hasMore && (
                                <div ref={loadMoreRef} className="flex justify-center py-8">
                                    <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${
                                        darkMode ? 'border-gray-600' : 'border-gray-300'
                                    }`} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`text-center py-20 rounded-lg shadow-md ${
                            darkMode ? 'bg-[#1E1E1E] border border-gray-700/50' : 'bg-white border border-gray-200'
                        }`}>
                            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                                <span className="text-5xl">🔍</span>
                            </div>
                            <h3 className={`text-2xl font-bold mb-2 tracking-tight ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`} style={{ fontFamily: "'Urbanist', sans-serif" }}>
                                No Reviews Found
                            </h3>
                            <p className={`text-base ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                Try adjusting your filters
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Journal;