import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Star, Tv, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRatings } from "@/hooks/useRatings";
import { useMovies } from "@/hooks/useMovies";
import { useAllSeries } from "@/hooks/useSeries";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import SeriesModal from "@/components/SeriesModal";
import SeriesVideoPlayer from "@/components/SeriesVideoPlayer";
import VideoPlayer from "@/components/VideoPlayer";
import type { Movie } from "@/data/movies";
import type { Series, SeriesEpisode } from "@/services/seriesService";

export default function MyRatingsPage() {
  const navigate = useNavigate();
  const { ratings, setRating } = useRatings();
  const { allMovies } = useMovies();
  const { allSeries } = useAllSeries();
  const { updateProgress, getProgress } = useWatchProgress();

  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [playingSeries, setPlayingSeries] = useState<{ series: Series; episode: SeriesEpisode; season: number } | null>(null);

  const ratedMovies = Object.entries(ratings)
    .map(([movieId, rating]) => {
      const movie = allMovies.find(m => m.id === movieId);
      if (!movie) return null;
      return { movie, userRating: rating };
    })
    .filter(Boolean) as { movie: typeof allMovies[0]; userRating: number }[];

  const handlePlay = (movie: Movie) => {
    if (movie.isSeries) {
      const s = allSeries.find(s => s.id === movie.id);
      if (s) setSelectedSeries(s);
    } else {
      setPlayingMovie(movie);
    }
  };

  const handlePlaySeriesEpisode = (series: Series, episode: SeriesEpisode, season: number) => {
    setSelectedSeries(null);
    setPlayingSeries({ series, episode, season });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-6 md:pt-24 px-4 md:px-12 pb-24"
    >
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/profile")} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display tracking-wider text-foreground">MY RATINGS</h1>
        <span className="ml-auto text-sm text-muted-foreground">{ratedMovies.length} rated</span>
      </div>

      {ratedMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Star className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No ratings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratedMovies.map(({ movie, userRating }) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 p-3 rounded-lg bg-secondary"
            >
              <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Tv className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                {movie.isSeries && (
                  <div className="absolute top-0.5 left-0.5 flex items-center gap-0.5 bg-primary/90 px-1 py-0.5 rounded text-[8px] font-semibold text-primary-foreground">
                    <Tv className="w-2 h-2" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <p className="text-foreground text-sm font-semibold truncate">{movie.title}</p>
                  <p className="text-muted-foreground text-xs">{movie.year} • {movie.genre.slice(0, 2).join(", ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setRating(movie.id, s)} className="p-0.5">
                        <Star className={`w-5 h-5 transition-colors ${s <= userRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">{userRating}/5</span>
                  </div>
                  <button onClick={() => handlePlay(movie)} className="ml-auto flex items-center gap-1 text-primary text-xs font-medium">
                    <Play className="w-3 h-3 fill-current" /> {movie.isSeries ? 'Episodes' : 'Play'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SeriesModal series={selectedSeries} onClose={() => setSelectedSeries(null)} onPlayEpisode={handlePlaySeriesEpisode} />

      <AnimatePresence>
        {playingMovie && (
          <VideoPlayer
            movie={playingMovie}
            onClose={() => setPlayingMovie(null)}
            onProgressUpdate={updateProgress}
            initialTime={getProgress(playingMovie.id)?.currentTime || 0}
            allMovies={allMovies}
            onPlayMovie={(m) => { setPlayingMovie(null); setTimeout(() => setPlayingMovie(m), 100); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playingSeries && (
          <SeriesVideoPlayer
            series={playingSeries.series}
            initialEpisode={playingSeries.episode}
            initialSeason={playingSeries.season}
            onClose={() => setPlayingSeries(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
