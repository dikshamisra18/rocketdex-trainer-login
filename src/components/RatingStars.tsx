import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingStarsProps {
  onRate: (rating: number) => void;
  currentRating: number;
}

const RatingStars = ({ onRate, currentRating }: RatingStarsProps) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-accent hover:scale-125 transition-transform bg-transparent border-none cursor-pointer p-0"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            size={14}
            fill={star <= (hover || Math.round(currentRating)) ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
