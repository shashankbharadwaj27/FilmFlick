import React, { useState, useEffect, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateReview } from '../features/reviewSlice';
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
            onClose();
        } catch (error) {
            console.error("Error updating review:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className={`rounded-lg shadow-2xl p-6 w-full max-w-md ${
                darkMode 
                    ? 'bg-gray-800 text-gray-100' 
                    : 'bg-white text-gray-800'
            }`}>
                <h2 className={`text-2xl font-semibold mb-6 ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                    Edit Review
                </h2>
                
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
                        darkMode={darkMode}
                    />
                    
                    <TextArea
                        text={review}
                        onChange={handleTextChange}
                        darkMode={darkMode}
                        rows="4"
                        columns="30"
                        placeholder="Update your review"
                    />
                    
                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            className={`flex-1 py-2.5 px-4 font-semibold rounded-lg shadow-sm transition-colors ${
                                darkMode
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                    : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        >
                            Save Changes
                        </button>
                        
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2.5 px-4 font-semibold rounded-lg shadow-sm transition-colors ${
                                darkMode
                                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default EditModal;