import { Play, CheckCircle2, AlertCircle } from "lucide-react";
import type { SeasonWithEpisodes } from "@/hooks/useSeries";

interface EpisodeListProps {
  seasons: SeasonWithEpisodes[];
  currentSeasonIndex: number;
  currentEpisodeIndex: number;
  onSeasonChange: (index: number) => void;
  onEpisodeSelect: (seasonIndex: number, episodeIndex: number) => void;
}

const EpisodeList = ({
  seasons,
  currentSeasonIndex,
  currentEpisodeIndex,
  onSeasonChange,
  onEpisodeSelect,
}: EpisodeListProps) => {
  const currentSeason = seasons[currentSeasonIndex];

  return (
    <div className="space-y-4">
      {/* Season tabs */}
      {seasons.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {seasons.map((season, idx) => (
            <button
              key={season.id}
              onClick={() => onSeasonChange(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                idx === currentSeasonIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {season.title || `Season ${season.season_number}`}
            </button>
          ))}
        </div>
      )}

      {/* Episode list */}
      <div className="space-y-2">
        {currentSeason?.episodes.map((episode, epIdx) => {
          const isActive =
            currentSeasonIndex === currentSeasonIndex &&
            epIdx === currentEpisodeIndex;
          const hasVideo = !!episode.video_url;

          return (
            <button
              key={episode.id}
              onClick={() => onEpisodeSelect(currentSeasonIndex, epIdx)}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left ${
                isActive
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-card hover:bg-accent border border-transparent"
              }`}
            >
              {/* Episode number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                {isActive ? (
                  <Play className="w-4 h-4 text-primary" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">
                    {episode.episode_number}
                  </span>
                )}
              </div>

              {/* Thumbnail */}
              {episode.thumbnail_url && (
                <div className="flex-shrink-0 w-28 h-16 rounded overflow-hidden bg-muted">
                  <img
                    src={episode.thumbnail_url}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {episode.title}
                  </h4>
                  {!hasVideo && (
                    <AlertCircle className="w-3.5 h-3.5 text-[hsl(var(--cine-gold))] flex-shrink-0" />
                  )}
                </div>
                {episode.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {episode.description}
                  </p>
                )}
                {episode.duration && (
                  <span className="text-xs text-muted-foreground">
                    {episode.duration}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeList;
