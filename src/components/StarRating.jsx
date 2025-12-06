import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRatingChange, size = 20, readOnly = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index) => {
        if (!readOnly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index) => {
        if (!readOnly && onRatingChange) {
            onRatingChange(index);
        }
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-transform hover:scale-110`}
                    disabled={readOnly}
                >
                    <Star
                        size={size}
                        className={`transition-colors ${index <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
