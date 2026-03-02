import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";

interface ContentCardProps {
  id: string;
  title: string;
  posterUrl: string | null;
  genre: string | null;
  rating: number | null;
  releaseYear: number | null;
  type: "series" | "movie";
}

const ContentCard = ({
  id,
  title,
  posterUrl,
  genre,
  rating,
  releaseYear,
  type,
}: ContentCardProps) => {
  const linkTo = type === "series" ? `/series/${id}` : `/movies/${id}`;

  return (
    <Link
      to={linkTo}
      className="group relative flex-shrink-0 w-[160px] sm:w-[200px] rounded-lg overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">{genre || "—"}</span>
          {rating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-[hsl(var(--cine-gold))] text-[hsl(var(--cine-gold))]" />
              <span className="text-xs text-muted-foreground">{rating}</span>
            </div>
          )}
        </div>
        {releaseYear && (
          <span className="text-xs text-muted-foreground">{releaseYear}</span>
        )}
      </div>
    </Link>
  );
};

export default ContentCard;
