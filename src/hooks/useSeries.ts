import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Series = Tables<"series">;
export type Season = Tables<"seasons">;
export type Episode = Tables<"episodes">;
export type Movie = Tables<"movies">;

export type SeasonWithEpisodes = Season & { episodes: Episode[] };
export type SeriesWithSeasons = Series & { seasons: SeasonWithEpisodes[] };

export function useAllSeries() {
  return useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Series[];
    },
  });
}

export function useSeriesDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["series", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: series, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (seriesError) throw seriesError;
      if (!series) return null;

      const { data: seasons, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .eq("series_id", id!)
        .order("season_number");
      if (seasonsError) throw seasonsError;

      const { data: episodes, error: episodesError } = await supabase
        .from("episodes")
        .select("*")
        .eq("series_id", id!)
        .order("episode_number");
      if (episodesError) throw episodesError;

      const seasonsWithEpisodes: SeasonWithEpisodes[] = (seasons || []).map(
        (season) => ({
          ...season,
          episodes: (episodes || []).filter((ep) => ep.season_id === season.id),
        })
      );

      return { ...series, seasons: seasonsWithEpisodes } as SeriesWithSeasons;
    },
  });
}

export function useAllMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Movie[];
    },
  });
}

export function useMovieDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["movie", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as Movie | null;
    },
  });
}
