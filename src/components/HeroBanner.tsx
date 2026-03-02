import { Link } from "react-router-dom";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Series, Movie } from "@/hooks/useSeries";

interface HeroBannerProps {
  item: Series | Movie;
  type: "series" | "movie";
}

const HeroBanner = ({ item, type }: HeroBannerProps) => {
  const linkTo = type === "series" ? `/series/${item.id}` : `/movies/${item.id}`;

  return (
    <div className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden">
      {item.banner_url ? (
        <img
          src={item.banner_url}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : item.poster_url ? (
        <img
          src={item.poster_url}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

      <div className="absolute bottom-16 left-4 sm:left-8 lg:left-12 max-w-xl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-3 drop-shadow-lg">
          {item.title}
        </h1>
        {item.description && (
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 mb-5">
            {item.description}
          </p>
        )}
        <div className="flex gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link to={linkTo}>
              <Play className="w-5 h-5" />
              Play
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="gap-2">
            <Link to={linkTo}>
              <Info className="w-5 h-5" />
              More Info
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
