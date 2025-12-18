import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMovieToJournal} from '../features/userDataSlice';
import DateInput from './DateInput';
import Checkbox from './Checkbox';
import Rating from './Rating';
import TextArea from './TextArea';

function ReviewForm({ movie }) {
    const [rating, setRating] = useState(0);
    const [watchDate, setWatchDate] = useState(new Date().toISOString().split('T')[0]);
    const [containSpoilers, setContainSpoilers] = useState(false);
    const [review, setReview] = useState('');
    const [error, setError] = useState('');

    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.darkMode.darkMode);
    const user = useSelector((state) => state.auth?.user);
    const watchedMovies = useSelector(state => state.userData?.reviews);
    
    const [rewatch, setRewatch] = useState(watchedMovies && watchedMovies.some((watchedMovie) => watchedMovie.movie_id === movie.id));
    useEffect(() => {
        setRewatch(watchedMovies && watchedMovies.some((watchedMovie) => watchedMovie.id === movie.id));
    }, [watchedMovies, movie.id]);

    const today = new Date().toISOString().split('T')[0];
    const minDate = '1970-01-01';

    const textAreaRef = useRef();
    const ratingRef = useRef();

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setWatchDate(selectedDate);
        validateDate(selectedDate);
    };

    const validateDate = (date) => {
        if (date < minDate || date > today) {
            setError(`Date must be between ${minDate} and ${today}.`);
        } else {
            setError('');
        }
    };

    const handleTextChange = (e) => {
        setReview(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            return;
        }
        const logDetails = {
            movie:movie,
            date: watchDate,
            rating,
            rewatch,
            spoilers: containSpoilers,
            review: textAreaRef.current.getText(),
            username: user.username
        };
        try {
            await dispatch(addMovieToJournal(logDetails)).unwrap();
            setWatchDate(today);
            setRating(0);
            setReview('');
            textAreaRef.current.clearText('');
            setContainSpoilers(false);
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <DateInput
                    value={watchDate}
                    onChange={handleDateChange}
                    min={minDate}
                    max={today}
                    error={error}
                    darkMode={darkMode}
                />
                <Checkbox 
                    id="rewatch" 
                    checked={rewatch}
                    onChange={() => setRewatch(!rewatch)} 
                    label="Watched this movie before?" 
                    darkMode={darkMode} 
                />
                <Checkbox 
                    id="contain-spoilers" 
                    checked={containSpoilers} 
                    onChange={() => setContainSpoilers(!containSpoilers)} 
                    label="Contains spoilers?" 
                    darkMode={darkMode} 
                />
                <Rating 
                    ref={ratingRef}
                    rating={rating} 
                    onRatingClick={setRating} 
                />
                <TextArea
                    ref={textAreaRef}
                    value={review} 
                    onChange={handleTextChange} 
                    darkMode={darkMode} 
                    placeholder="Add a review"
                />
                <button
                    type="submit"
                    className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Save Review
                </button>
            </form>
        </div>
    );
}

export default ReviewForm;
