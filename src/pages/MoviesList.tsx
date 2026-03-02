import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import { useAllMovies } from "@/hooks/useSeries";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";

const MoviesList = () => {
  const { data: movies, isLoading } = useAllMovies();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">All Movies</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : !movies?.length ? (
          <div className="text-center py-20 space-y-4">
            <Film className="w-16 h-16 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">
              No movies available yet. Add movie data to the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((m) => (
              <ContentCard
                key={m.id}
                id={m.id}
                title={m.title}
                posterUrl={m.poster_url}
                genre={m.genre}
                rating={m.rating}
                releaseYear={m.release_year}
                type="movie"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesList;
