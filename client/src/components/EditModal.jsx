import React, { useState, useEffect, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateReview } from '../features/reviewSlice'; // Only updateReview now
import DateInput from './DateInput';
import Checkbox from './Checkbox';
import Rating from './Rating';
import TextArea from './TextArea';

const EditModal = forwardRef(({ movie, existingReview, isOpen, onClose }, ref) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [watchDate, setWatchDate] = useState(existingReview?.review_date || new Date().toISOString().split('T')[0]);
    const [rewatch, setRewatch] = useState(existingReview?.rewatch === 1);
    const [containSpoilers, setContainSpoilers] = useState(existingReview?.spoilers === 1);
    const [review, setReview] = useState(existingReview?.review_text || '');
    const [error, setError] = useState('');

    const dispatch = useDispatch();
    const darkMode = useSelector((state) => state.darkMode.darkMode);
    const user = useSelector((state) => state.auth?.user);

    useEffect(() => {
        if (isOpen) {
            setRating(existingReview?.rating || 0);
            setWatchDate(existingReview?.review_date || new Date().toISOString().split('T')[0]);
            setRewatch(existingReview?.rewatch === 1);
            setContainSpoilers(existingReview?.spoilers === 1);
            setReview(existingReview?.review_text || '');
            setError('');
        }
    }, [isOpen, existingReview]);

    const today = new Date().toISOString().split('T')[0];
    const minDate = '1970-01-01';
    const formatDateForMySQL = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

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
        if (error) return;

        const formattedDate = formatDateForMySQL(watchDate);
        const logDetails = {
            reviewId: existingReview?.review_id,
            movie,
            date: formattedDate,
            rating,
            rewatch,
            spoilers: containSpoilers,
            review,
            username: user?.username,
        };

        try {
            await dispatch(updateReview(logDetails)).unwrap();
            onClose(); // Close modal on success
        } catch (error) {
            console.error("Error updating review:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className={`bg-white rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800 text-gray-300' : 'text-gray-800'}`}>
                <h2 className="text-xl font-semibold mb-4">Edit Review</h2>
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
                        rating={rating}
                        onRatingClick={setRating}
                    />
                    <TextArea
                        text={review}
                        onChange={handleTextChange}
                        darkMode={darkMode}
                        rows="3"
                        columns="30"
                        placeholder="Update your review"
                    />
                    <button
                        type="submit"
                        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Save Changes
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="mt-4 text-blue-500 hover:underline"
                >
                    Close
                </button>
            </div>
        </div>
    );
});

export default EditModal;
