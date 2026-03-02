import { supabase } from '@/integrations/supabase/client';

export interface SeriesEpisode {
  id: string;
  number: number;
  title: string;
  duration: string;
  description: string;
  video_url?: string;
  thumbnail_url?: string;
  season_id: string;
  series_id: string;
}

export interface SeriesSeason {
  id: string;
  number: number;
  title?: string;
  episodes: SeriesEpisode[];
}

export interface Series {
  id: string;
  title: string;
  description: string;
  genre: string[];
  poster_url: string;
  banner_url?: string;
  rating: number;
  release_year: number;
  is_featured: boolean;
  seasons?: SeriesSeason[];
}

export interface SeriesWithSeasons extends Series {
  seasons: SeriesSeason[];
}

const SERIES_CACHE_KEY = 'series_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Helper to map a database row from the 'movies' table to the 'Series' interface
 */
function mapSeries(row: any): Series {
  // Safe genre handling: converts Postgres array or comma-string to string[]
  const genreField = row.genre || '';
  const genres = Array.isArray(genreField) 
    ? genreField 
    : (typeof genreField === 'string' && genreField ? genreField.split(',').map((g: string) => g.trim()) : []);

  return {
    id: row.id,
    title: row.title || 'Untitled',
    description: row.description || '',
    genre: genres,
    poster_url: row.poster || '', // Mapped from new 'poster' column
    banner_url: row.heroImage || undefined, // Mapped from new 'heroImage' column
    rating: Number(row.rating) || 0,
    release_year: row.year || new Date().getFullYear(),
    is_featured: !!row.isEditorChoice, // Using EditorChoice as featured flag
  };
}

/**
 * Helper to map a database row from the 'episodes' table to the 'SeriesEpisode' interface
 */
function mapEpisode(row: any, seriesId: string): SeriesEpisode {
  return {
    id: row.id,
    number: row.episode_number,
    title: row.title || `Episode ${row.episode_number}`,
    duration: row.duration || '',
    description: row.description || '',
    // Note: Add video_url/thumbnail_url to your SQL if you need them later
    thumbnail_url: row.thumbnail_url || undefined, 
    video_url: row.video_url || undefined,
    season_id: row.season_id,
    series_id: seriesId,
  };
}

export const seriesService = {
  /**
   * Fetches all series with local caching logic
   */
  async getAllSeries(): Promise<Series[]> {
    try {
      const cached = localStorage.getItem(SERIES_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (e) {
      console.error("Cache read error:", e);
    }

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('isSeries', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    const mapped = data.map(mapSeries);

    try {
      localStorage.setItem(SERIES_CACHE_KEY, JSON.stringify({
        data: mapped,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.error("Cache write error:", e);
    }

    return mapped;
  },

  /**
   * Fetches a single series with its nested seasons and episodes
   */
  async getSeriesWithSeasons(seriesId: string): Promise<SeriesWithSeasons | null> {
    // 1. Fetch the series metadata
    const { data: seriesData, error: seriesError } = await supabase
      .from('movies')
      .select('*')
      .eq('id', seriesId)
      .single();

    if (seriesError || !seriesData) return null;

    // 2. Fetch seasons and their related episodes using a join
    const { data: seasonsData, error: seasonsError } = await supabase
      .from('seasons')
      .select(`
        id,
        season_number,
        episodes (*)
      `)
      .eq('movie_id', seriesId)
      .order('season_number', { ascending: true });

    if (seasonsError) {
      console.error("Error fetching seasons:", seasonsError);
    }

    // 3. Map the relational data to our interface
    const seasons: SeriesSeason[] = (seasonsData || []).map((s: any) => ({
      id: s.id,
      number: s.season_number,
      episodes: (s.episodes || [])
        .sort((a: any, b: any) => a.episode_number - b.episode_number)
        .map((e: any) => mapEpisode(e, seriesId)),
    }));

    return {
      ...mapSeries(seriesData),
      seasons,
    };
  },

  /**
   * Fetches only featured series (isEditorChoice)
   */
  async getFeaturedSeries(): Promise<Series[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('isSeries', true)
      .eq('isEditorChoice', true)
      .limit(10);

    if (error || !data) return [];
    return data.map(mapSeries);
  },

  /**
   * Clears the local cache
   */
  clearCache(): void {
    localStorage.removeItem(SERIES_CACHE_KEY);
  },
};
