import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import ContentCard from "@/components/ContentCard";
import { useAllSeries, useAllMovies } from "@/hooks/useSeries";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";

const Index = () => {
  const { data: series, isLoading: loadingSeries } = useAllSeries();
  const { data: movies, isLoading: loadingMovies } = useAllMovies();

  const featuredSeries = series?.find((s) => s.is_featured) || series?.[0];
  const featuredMovie = movies?.find((m) => m.is_featured) || movies?.[0];
  const heroItem = featuredSeries || featuredMovie;
  const heroType = featuredSeries ? "series" : "movie";

  const isEmpty = !loadingSeries && !loadingMovies && !series?.length && !movies?.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      {heroItem ? (
        <HeroBanner item={heroItem} type={heroType as "series" | "movie"} />
      ) : (
        <div className="h-[60vh] flex items-center justify-center pt-16">
          {loadingSeries || loadingMovies ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <div className="text-center space-y-4">
              <Film className="w-16 h-16 text-muted-foreground mx-auto" />
              <h1 className="text-3xl font-bold text-foreground">Welcome to CineStream</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                No content available yet. Add series and movies to the database to get started.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="relative -mt-16 z-10 pb-16 space-y-2">
        {/* Series row */}
        {(loadingSeries || (series && series.length > 0)) && (
          <ContentRow title="📺 Series">
            {loadingSeries
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="w-[200px] h-[340px] rounded-lg flex-shrink-0" />
                ))
              : series?.map((s) => (
                  <ContentCard
                    key={s.id}
                    id={s.id}
                    title={s.title}
                    posterUrl={s.poster_url}
                    genre={s.genre}
                    rating={s.rating}
                    releaseYear={s.release_year}
                    type="series"
                  />
                ))}
          </ContentRow>
        )}

        {/* Movies row */}
        {(loadingMovies || (movies && movies.length > 0)) && (
          <ContentRow title="🎬 Movies">
            {loadingMovies
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="w-[200px] h-[340px] rounded-lg flex-shrink-0" />
                ))
              : movies?.map((m) => (
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
          </ContentRow>
        )}
      </div>
    </div>
  );
};

export default Index;
