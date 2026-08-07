import React, { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
    rating: number
    maxRating?: number
    onChange?: (rating: number) => void
    compact?: boolean
}

export default function StarRating({ rating, maxRating = 10, onChange, compact = false }: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0)

    // Ensure the rating is between 0 and maxRating
    const clampedRating = Math.max(0, Math.min(rating, maxRating))

    // Convert the rating to a 5-star scale
    const scaledRating = (clampedRating / maxRating) * 5

    // Create an array of 5 elements to represent the stars
    const stars = Array(5).fill(0)
    const starSize = compact ? 'h-5 w-5 md:h-8 md:w-8' : 'h-6 w-6 md:h-8 md:w-8'

    const handleRating = (index: number, isHalf: boolean) => {
        if (onChange) {
            // Convert the star index (0-4) back to the original scale
            const newRating = ((index + (isHalf ? 0.5 : 1)) / 5) * maxRating
            onChange(newRating)
        }
    }

    const handleMouseEnter = (index: number, isHalf: boolean) => {
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
            className="inline-flex shrink-0 items-center gap-1"
            aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating}`}
            onMouseLeave={handleMouseLeave}
        >
        {stars.map((_, index) => {
            const starValue = index + 1
            const fillPercentage = Math.min(100, Math.max(0, ((hoverRating || scaledRating) - index) * 100))

            return (
                <span 
                    key={index} 
                    className={`relative inline-block shrink-0 ${onChange !== undefined && 'cursor-pointer'}`}
                    onClick={() => handleRating(index, false)}
                    onMouseEnter={() => handleMouseEnter(index, false)}
                >
                <Star className={`${starSize} text-gray-300`} />
                <span 
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ 
                        width: `${fillPercentage}%`,
                        transition: 'width 0.2s ease-in-out'
                    }}
                >
                    <Star className={`${starSize} text-yellow-400`} />
                </span>
                <span 
                    className="absolute top-0 left-0 w-1/2 h-full"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleRating(index, true)
                    }}
                    onMouseEnter={(e) => {
                        e.stopPropagation()
                        handleMouseEnter(index, true)
                    }}
                />
                </span>
            )
        })}
            <span className={`ml-1 shrink-0 whitespace-nowrap tabular-nums text-white md:ml-2 md:text-base ${compact ? 'text-sm' : ''}`}>
                {rating.toFixed(1)} / {maxRating}
            </span>
        </div>
    )
}
