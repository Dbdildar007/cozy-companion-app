import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Tv, Plus, CheckCircle } from "lucide-react"; 
// Remove: import { Button } from "./ui/button";
import type { Series } from "@/services/seriesService";


interface SeriesCardProps {
  series: Series;
  onSelect: (series: Series) => void;
  onRate?: (rating: number) => void;
  onToggleWatchlist?: () => void;
}

export default function SeriesCard({ series, onSelect, onRate, onToggleWatchlist }: SeriesCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 w-[140px] md:w-[180px] group cursor-pointer"
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onSelect(series)}
    >
      <div className="relative rounded-md overflow-hidden aspect-[2/3] bg-secondary shadow-lg">
        {series.poster_url ? (
          <img
            src={series.poster_url}
            alt={series.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Tv className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Series badge */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-primary/90 px-1.5 py-0.5 rounded text-[10px] font-semibold text-primary-foreground z-10">
          <Tv className="w-2.5 h-2.5" />
          Series
        </div>

        {/* Hover overlay - Interactive Elements Added Here */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 space-y-2"
        >
          <p className="text-[10px] md:text-xs text-gray-200">
            {series.release_year} • {series.genre.join(", ")}
          </p>
          
          {/* 1. Interactive Star Rating */}
          {onRate && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents opening the series modal
                    onRate(star);
                  }}
                  className="focus:outline-none transition-transform active:scale-125"
                >
                  <Star
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                      star <= (series.rating ?? 0)
                        ? "text-cine-gold fill-cine-gold"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* 2. Add to My List Button */}
         
{onToggleWatchlist && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggleWatchlist();
    }}
    className={`mt-2 flex items-center gap-1 text-xs font-medium transition-colors ${
      series.isInWatchlist ? "text-primary" : "text-foreground"
    }`}
  >
    {series.isInWatchlist ? (
      <CheckCircle className="w-3 h-3" />
    ) : (
      <Plus className="w-3 h-3" />
    )}
    {series.isInWatchlist ? "Listed" : "My List"}
  </button>
)}
        </motion.div>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-xs md:text-sm font-medium text-foreground truncate">
        {series.title}
      </h3>

      {/* 3. Removed the static rating div from here to keep UI clean */}
    </motion.div>
  );
}
