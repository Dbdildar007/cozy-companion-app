import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WatchProgress {
  movieId: string;
  episodeId?: string;      // Ensure this is here
  mediaType?: 'movie' | 'series'; 
  currentTime: number;
  duration: number;
  lastWatched: number;
}

const STORAGE_KEY = "cinestream_watch_progress";

function loadLocalProgress(): WatchProgress[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useWatchProgress() {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState<WatchProgress[]>(loadLocalProgress);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

 // Load from DB on login
  useEffect(() => {
    if (!user) return;
  const fetchProgress = async () => {
      const { data } = await supabase
        .from("watch_progress")
        .select("movie_id, episode_id, media_type, current_time_sec, duration_sec, last_watched")
        .eq("user_id", user.id);

      if (data) {
        const dbList: WatchProgress[] = (data as any[]).map((d: any) => ({
          movieId: d.movie_id,
          episodeId: d.episode_id || undefined,
          mediaType: (d.media_type as 'movie' | 'series') || 'movie',
          currentTime: Number(d.current_time_sec),
          duration: Number(d.duration_sec),
          lastWatched: new Date(d.last_watched).getTime(),
        }));
        setProgressList(dbList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbList));
      }
    };
    fetchProgress();
  }, [user]);

  // Persist locally
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressList));
  }, [progressList]);

  const updateProgress = useCallback((movieId: string, currentTime: number, duration: number,mediaType: 'movie' | 'series' = 'movie',
  episodeId?: string) => {
    if (duration <= 0) return;
setProgressList((prev) => {
  // Filter out ONLY the specific item being updated (match both ID and episode)
  const filtered = prev.filter((p) => 
    !(p.movieId === movieId && p.episodeId === episodeId)
  );
  
  const percent = currentTime / duration;
  if (currentTime < 5 || percent > 0.95) return filtered;

  return [{ 
    movieId, 
    episodeId, 
    mediaType, 
    currentTime, 
    duration, 
    lastWatched: Date.now() 
  }, ...filtered];
});

    // Debounced DB sync
    if (user) {
      const debounceKey = `${movieId}_${episodeId || ''}`;
      if (debounceRef.current[debounceKey]) clearTimeout(debounceRef.current[debounceKey]);
      debounceRef.current[debounceKey] = setTimeout(async () => {
        const percent = currentTime / duration;
        const episodeVal = episodeId || '';
        // Always delete first, then insert if needed (expression index prevents simple upsert)
        await (supabase.from("watch_progress") as any)
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movieId)
          .eq("episode_id", episodeVal);

        if (percent <= 0.95 && currentTime >= 5) {
          await (supabase.from("watch_progress") as any).insert({
            user_id: user.id,
            movie_id: movieId,
            episode_id: episodeVal,
            current_time_sec: Math.round(currentTime),
            duration_sec: Math.round(duration),
            media_type: mediaType,
            last_watched: new Date().toISOString(),
          });
        }
      }, 3000);
    }
  }, [user]);

  const getProgress = useCallback((movieId: string, episodeId?: string): WatchProgress | undefined => {
    if (episodeId) {
      return progressList.find((p) => p.movieId === movieId && p.episodeId === episodeId);
    }
    return progressList.find((p) => p.movieId === movieId);
  }, [progressList]);

  const getContinueWatching = useCallback((): WatchProgress[] => {
    return [...progressList].sort((a, b) => b.lastWatched - a.lastWatched).slice(0, 10);
  }, [progressList]);

  const clearProgress = useCallback(async (movieId: string, episodeId?: string) => {
    setProgressList((prev) => prev.filter((p) => 
      !(p.movieId === movieId && (!episodeId || p.episodeId === episodeId))
    ));
    if (user) {
      const episodeVal = episodeId || '';
      await (supabase.from("watch_progress") as any)
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", movieId)
        .eq("episode_id", episodeVal);
    }
  }, [user]);

  return { updateProgress, getProgress, getContinueWatching, clearProgress };
}
