import { useParams } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeList from "@/components/EpisodeList";
import { useSeriesDetail } from "@/hooks/useSeries";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Calendar, Tag } from "lucide-react";

const SeriesDetail = () => {
  const { id } = useParams();
  const { data: series, isLoading } = useSeriesDetail(id);
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const currentSeason = series?.seasons?.[currentSeasonIndex];
  const currentEpisode = currentSeason?.episodes?.[currentEpisodeIndex];

  // Calculate if there's a next episode
  const hasNextEpisode = useCallback(() => {
    if (!series?.seasons) return false;
    const season = series.seasons[currentSeasonIndex];
    if (!season) return false;
    // Next episode in same season
    if (currentEpisodeIndex < season.episodes.length - 1) return true;
    // Next season exists with episodes
    if (currentSeasonIndex < series.seasons.length - 1) {
      return (series.seasons[currentSeasonIndex + 1]?.episodes?.length || 0) > 0;
    }
    return false;
  }, [series, currentSeasonIndex, currentEpisodeIndex]);

  const goToNextEpisode = useCallback(() => {
    if (!series?.seasons) return;
    const season = series.seasons[currentSeasonIndex];
    if (currentEpisodeIndex < season.episodes.length - 1) {
      setCurrentEpisodeIndex((prev) => prev + 1);
      setAutoPlay(true);
    } else if (currentSeasonIndex < series.seasons.length - 1) {
      setCurrentSeasonIndex((prev) => prev + 1);
      setCurrentEpisodeIndex(0);
      setAutoPlay(true);
    }
  }, [series, currentSeasonIndex, currentEpisodeIndex]);

  const handleEpisodeSelect = useCallback(
    (seasonIdx: number, epIdx: number) => {
      setCurrentSeasonIndex(seasonIdx);
      setCurrentEpisodeIndex(epIdx);
      setAutoPlay(true);
    },
    []
  );

  const handleSeasonChange = useCallback((idx: number) => {
    setCurrentSeasonIndex(idx);
    setCurrentEpisodeIndex(0);
  }, []);

  // Reset when series changes
  useEffect(() => {
    setCurrentSeasonIndex(0);
    setCurrentEpisodeIndex(0);
    setAutoPlay(false);
  }, [id]);

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

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Series not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16">
        {/* Video Player */}
        <VideoPlayer
          key={currentEpisode?.id || "no-episode"}
          videoUrl={currentEpisode?.video_url || null}
          title={
            currentEpisode
              ? `S${currentSeason?.season_number || 1}:E${currentEpisode.episode_number} - ${currentEpisode.title}`
              : series.title
          }
          onNext={goToNextEpisode}
          hasNext={hasNextEpisode()}
          autoPlay={autoPlay}
        />

        {/* Series Info */}
        <div className="mt-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {series.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {series.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[hsl(var(--cine-gold))] text-[hsl(var(--cine-gold))]" />
                <span>{series.rating}/10</span>
              </div>
            )}
            {series.release_year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{series.release_year}</span>
              </div>
            )}
            {series.genre && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{series.genre}</span>
              </div>
            )}
            <span>
              {series.seasons.length} Season{series.seasons.length !== 1 ? "s" : ""}
            </span>
          </div>

          {series.description && (
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              {series.description}
            </p>
          )}
        </div>

        {/* Episodes */}
        {series.seasons.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Episodes</h2>
            <EpisodeList
              seasons={series.seasons}
              currentSeasonIndex={currentSeasonIndex}
              currentEpisodeIndex={currentEpisodeIndex}
              onSeasonChange={handleSeasonChange}
              onEpisodeSelect={handleEpisodeSelect}
            />
          </div>
        ) : (
          <div className="mt-8 p-6 bg-card rounded-lg border border-border text-center">
            <p className="text-muted-foreground">
              No seasons or episodes available for this series yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
