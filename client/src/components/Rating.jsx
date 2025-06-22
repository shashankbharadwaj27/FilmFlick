import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';

const Rating = forwardRef(({ rating, onRatingClick }, ref) => {
    const [hoverRating, setHoverRating] = useState(0);
    const darkMode = useSelector(state=>state.darkMode.darkMode);

    useImperativeHandle(ref, () => ({
        reset: () => { setHoverRating(0); },
    }));

    return (
        <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, index) => (
                <svg
                    key={index}
                    onClick={() => onRatingClick(index + 1)}
                    onMouseEnter={() => setHoverRating(index + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`w-6 h-6 cursor-pointer ${index < rating ? 'text-yellow-400' : index < hoverRating ? 'text-yellow-300' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
            ))}
        </div>
    );
});

export default Rating;
