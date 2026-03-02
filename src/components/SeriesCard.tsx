import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Tv } from "lucide-react";
import type { Series } from "@/services/seriesService";


interface SeriesCardProps {
  series: Series;
  onSelect: (series: Series) => void;
  onRate?: (rating: number) => void;         // Add this line
  onToggleWatchlist?: () => void;            // Add this line
}

export default function SeriesCard({ series, onSelect }: SeriesCardProps) {
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
      <div className="relative rounded-md overflow-hidden aspect-[2/3] bg-secondary">
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

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex flex-col justify-end p-3"
        >
          <p className="text-xs text-muted-foreground">{series.release_year} • {series.genre.join(", ")}</p>
        </motion.div>
      </div>

      <h3 className="mt-2 text-xs md:text-sm font-medium text-foreground truncate">{series.title}</h3>
      <div className="flex items-center gap-1 mt-0.5">
        <Star className="w-3 h-3 text-cine-gold fill-cine-gold" />
        <span className="text-xs text-muted-foreground">{series.rating}</span>
      </div>
    </motion.div>
  );
}
