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

function mapSeries(row: any): Series {
  const genreField = row.genre || '';
  const genres = Array.isArray(genreField) ? genreField :
    (typeof genreField === 'string' && genreField ? genreField.split(',').map((g: string) => g.trim()) : []);

  return {
    id: row.id,
    title: row.title || 'Untitled',
    description: row.description || '',
    genre: genres,
    poster_url: row.poster_url || '',
    banner_url: row.banner_url || undefined,
    rating: Number(row.rating) || 0,
    release_year: row.release_year || new Date().getFullYear(),
    is_featured: !!row.is_featured,
  };
}

function mapEpisode(row: any): SeriesEpisode {
  return {
    id: row.id,
    number: row.episode_number,
    title: row.title || `Episode ${row.episode_number}`,
    duration: row.duration || '',
    description: row.description || '',
    video_url: row.video_url || undefined,
    thumbnail_url: row.thumbnail_url || undefined,
    season_id: row.season_id,
    series_id: row.series_id,
  };
}

const SERIES_CACHE_KEY = 'series_cache';
const CACHE_DURATION = 5 * 60 * 1000;

export const seriesService = {
  async getAllSeries(): Promise<Series[]> {
    try {
      const cached = localStorage.getItem(SERIES_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch {}

    const { data, error } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return [];

    const mapped = data.map(mapSeries);
    localStorage.setItem(SERIES_CACHE_KEY, JSON.stringify({
      data: mapped,
      timestamp: Date.now(),
    }));
    return mapped;
  },

  async getSeriesWithSeasons(seriesId: string): Promise<SeriesWithSeasons | null> {
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select('*')
      .eq('id', seriesId)
      .single();

    if (seriesError || !seriesData) return null;

    const { data: seasonsData } = await supabase
      .from('seasons')
      .select('*')
      .eq('series_id', seriesId)
      .order('season_number', { ascending: true });

    const { data: episodesData } = await supabase
      .from('episodes')
      .select('*')
      .eq('series_id', seriesId)
      .order('episode_number', { ascending: true });

    const seasons: SeriesSeason[] = (seasonsData || []).map((s: any) => ({
      id: s.id,
      number: s.season_number,
      title: s.title || undefined,
      episodes: (episodesData || [])
        .filter((e: any) => e.season_id === s.id)
        .map(mapEpisode),
    }));

    return {
      ...mapSeries(seriesData),
      seasons,
    };
  },

  async getFeaturedSeries(): Promise<Series[]> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('is_featured', true)
      .limit(10);

    if (error || !data) return [];
    return data.map(mapSeries);
  },

  clearCache(): void {
    localStorage.removeItem(SERIES_CACHE_KEY);
  },
};
