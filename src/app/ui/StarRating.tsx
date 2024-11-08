
import React, { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
    rating: number
    maxRating?: number
    onChange?: (rating: number) => void
}

export default function StarRating({ rating, maxRating = 10, onChange }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0)

    // Ensure the rating is between 0 and maxRating
    const clampedRating = Math.max(0, Math.min(rating, maxRating))

    // Convert the rating to a 5-star scale
    const scaledRating = (clampedRating / maxRating) * 5

    // Create an array of 5 elements to represent the stars
    const stars = Array(5).fill(0)

    const handleStarClick = (index: number, isHalf: boolean) => {
        if (onChange) {
            // Convert the clicked star index (0-4) back to the original scale
            const newRating = ((index + (isHalf ? 0.5 : 1)) / 5) * maxRating
            onChange(newRating)
        }
    }

    const handleStarHover = (index: number, isHalf: boolean) => {
        if (onChange) {
            setHoverRating(index + (isHalf ? 0.5 : 1))
        }
    }

    const handleMouseLeave = () => {
        if (onChange) {
            setHoverRating(0)
        }
    }

    return (
        <div 
            className="flex items-center space-x-1" 
            aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating}`}
            onMouseLeave={handleMouseLeave}
        >
            {stars.map((_, index) => {
                const starValue = index + 1
                const isHovered = starValue <= hoverRating
                const isHalfHovered = starValue === Math.ceil(hoverRating) && !Number.isInteger(hoverRating)
                const isFilled = starValue <= scaledRating
                const isHalfFilled = starValue === Math.ceil(scaledRating) && !Number.isInteger(scaledRating)

                return (
                <span 
                    key={index} 
                    className={`relative inline-block ${onChange !== undefined && 'cursor-pointer'}`}
                >
                    <Star 
                    className="md:w-8 md:h-8 w-6 h-6 text-gray-300" 
                    onClick={() => handleStarClick(index, false)}
                    onMouseEnter={() => handleStarHover(index, false)}
                    />
                    <span 
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ 
                        width: isHovered ? '100%' : isHalfHovered ? '50%' : isFilled ? '100%' : isHalfFilled ? '50%' : '0%',
                        transition: 'width 0.2s ease-in-out'
                    }}
                    >
                    <Star className="md:w-8 md:h-8 w-6 h-6 text-yellow-400" />
                    </span>
                    <span 
                    className={`absolute top-0 left-0 w-1/2 h-full ${onChange !== undefined && 'cursor-pointer'}`}
                    onClick={() => handleStarClick(index, true)}
                    onMouseEnter={() => handleStarHover(index, true)}
                    />
                </span>
                )
            })}
            <span className="ml-2 md:text-md text-white">
                {rating.toFixed(1)} / {maxRating}
            </span>
        </div>
    )
}