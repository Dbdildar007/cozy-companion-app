import Navbar from "@/components/Navbar";
import ContentCard from "@/components/ContentCard";
import { useAllSeries } from "@/hooks/useSeries";
import { Skeleton } from "@/components/ui/skeleton";
import { Tv } from "lucide-react";

const SeriesList = () => {
  const { data: series, isLoading } = useAllSeries();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">All Series</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : !series?.length ? (
          <div className="text-center py-20 space-y-4">
            <Tv className="w-16 h-16 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">
              No series available yet. Add series data to the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {series.map((s) => (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesList;
