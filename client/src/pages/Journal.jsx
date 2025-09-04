import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import { Link, useParams } from 'react-router-dom';
import { fetchTargetUserProfile, clearErrors } from '../features/targetUserSlice';
import { getUserReviews } from '../features/userDataSlice';
import { format } from 'date-fns';

function Journal() {
    const [reviews, setReviews] = useState([]);

    const { isLoading, user, error } = useSelector(state => state.auth);
    const targetUser = useSelector(state => state.targetUser.targetUser);
    const userReviews = useSelector(state => state.userData?.reviews);
    const dispatch = useDispatch();
    const { username } = useParams();
    const darkMode = useSelector(state => state.darkMode.darkMode);

    const isOwnProfile = username === user?.username;

    useEffect(() => {
        if (!isOwnProfile) {
            dispatch(fetchTargetUserProfile(username));
        } else{
            dispatch(getUserReviews({username}))
        }
    }, [dispatch, username, user, isOwnProfile]);

    useEffect(() => {
        if (!isOwnProfile) {
            setReviews(targetUser.reviews);
        }else{
            setReviews(userReviews)
        }
        dispatch(clearErrors());
    }, [targetUser, username, user, isOwnProfile]);

    if (isLoading) return <Loader />;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime()) ? format(date, 'MMMM do yyyy') : 'Unknown';
    };

    const groupReviewsByMonth = (reviews) => {
        return reviews.reduce((acc, review) => {
            const date = new Date(review.review_date);
            const monthYear = format(date, 'MMMM yyyy');
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(review);
            return acc;
        }, {});
    };

    if (error) return <div className="text-red-500 text-center mt-4">Error fetching profile: {error.message}</div>;

    const sortedReviews = reviews
        ? [...reviews].sort((a, b) => new Date(b.review_date) - new Date(a.review_date))
        : [];

    const reviewsByMonth = groupReviewsByMonth(sortedReviews);

    return (
        <div className="w-full p-4 bg-transparent rounded-lg">
            <h2 className={`text-xl font-semibold border-b-2 pb-2 ${darkMode ? 'border-gray-400 text-white' : 'border-gray-500 text-black'} mb-2`}>
                {`${isOwnProfile ? user.name : targetUser?.userinfo?.name}'s`} Journal
            </h2>
            {sortedReviews.length > 0 ? (
                Object.keys(reviewsByMonth).map((month) => (
                    <div key={month}>
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                            {month}
                        </h3>
                        {reviewsByMonth[month].map((review) => (
                            <Link
                                to={`/${username}/review/${review.review_id}`}
                                state={{ review }}
                                key={review.review_id}
                                className={`mb-4 flex pb-2 items-start border border-transparent ${darkMode ? 'border-b-gray-500' : 'border-gray-400'} border-b-1 space-x-4`}
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${review.poster}`}
                                    alt={review.title}
                                    className="w-20 h-30 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {review.title}
                                    </h3>
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} text-sm mb-2`}>
                                        Directed by {review.director}
                                    </p>
                                    {Array.from({ length: Math.min(review.rating, 5) }).map((_, index) => (
                                        <span key={index} className="text-yellow-400">&#9733;</span>
                                    ))}
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} text-sm`}>
                                        <span>{formatDate(review.review_date)}</span>
                                        {review.rewatch ? ' (Rewatched)' : ''}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ))
            ) : (
                <p className={`text-gray-500 dark:text-gray-400`}>No recent activity yet.</p>
            )}
        </div>
    );
}

export default Journal;
