import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { useMovieDetail } from "@/hooks/useSeries";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Calendar, Tag, Clock } from "lucide-react";

const MovieDetail = () => {
  const { id } = useParams();
  const { data: movie, isLoading } = useMovieDetail(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Movie not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16">
        <VideoPlayer videoUrl={movie.video_url} title={movie.title} />

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {movie.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[hsl(var(--cine-gold))] text-[hsl(var(--cine-gold))]" />
                <span>{movie.rating}/10</span>
              </div>
            )}
            {movie.release_year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{movie.release_year}</span>
              </div>
            )}
            {movie.genre && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{movie.genre}</span>
              </div>
            )}
            {movie.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{movie.duration}</span>
              </div>
            )}
          </div>

          {movie.description && (
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              {movie.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
