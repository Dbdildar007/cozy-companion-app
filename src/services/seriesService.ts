import { supabase } from '@/integrations/supabase/client';
import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";
import poster3 from "@/assets/poster-3.jpg";
import poster4 from "@/assets/poster-4.jpg";
import poster5 from "@/assets/poster-5.jpg";
import poster6 from "@/assets/poster-6.jpg";
import poster7 from "@/assets/poster-7.jpg";
import poster8 from "@/assets/poster-8.jpg";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const posterMap: Record<string, string> = {
  '/assets/poster-1.jpg': poster1,
  '/assets/poster-2.jpg': poster2,
  '/assets/poster-3.jpg': poster3,
  '/assets/poster-4.jpg': poster4,
  '/assets/poster-5.jpg': poster5,
  '/assets/poster-6.jpg': poster6,
  '/assets/poster-7.jpg': poster7,
  '/assets/poster-8.jpg': poster8,
};

const heroMap: Record<string, string> = {
  '/assets/hero-1.jpg': hero1,
  '/assets/hero-2.jpg': hero2,
  '/assets/hero-3.jpg': hero3,
};

function resolveUrl(path: string | null | undefined, map: Record<string, string>): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return map[path] || path;
}

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
  isSeries: boolean;
  language?: string;
  category?: string[];
  duration?: string;
  seasons?: SeriesSeason[];
}

export interface SeriesWithSeasons extends Series {
  seasons: SeriesSeason[];
}

function mapSeries(row: any): Series {
  const genreField = row.genre || '';
  const genres = Array.isArray(genreField)
    ? genreField
    : (typeof genreField === 'string' && genreField ? genreField.split(',').map((g: string) => g.trim()) : []);
  const catField = row.category || '';
  const cats = Array.isArray(catField)
    ? catField
    : (typeof catField === 'string' && catField ? catField.split(',').map((c: string) => c.trim()) : []);
  return {
    id: row.id,
    title: row.title || 'Untitled',
    description: row.description || '',
    genre: genres,
    poster_url: resolveUrl(row.poster_url, posterMap),
    banner_url: resolveUrl(row.banner_url, heroMap) || undefined,
    rating: Number(row.rating) || 0,
    release_year: row.release_year || new Date().getFullYear(),
    is_featured: !!row.is_featured,
    isSeries: true,
    language: row.language || 'English',
    category: cats,
    duration: row.duration || '',
  };
}

function mapEpisode(row: any, seriesId: string): SeriesEpisode {
  return {
    id: row.id,
    number: row.episode_number,
    title: row.title || `Episode ${row.episode_number}`,
    duration: row.duration || '',
    description: row.description || '',
    thumbnail_url: row.thumbnail_url || undefined,
    video_url: row.video_url || undefined,
    season_id: row.season_id,
    series_id: seriesId,
  };
}

export const seriesService = {
  async getAllSeries(): Promise<Series[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('is_series', true)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapSeries);
  },

  async getSeriesWithSeasons(seriesId: string): Promise<SeriesWithSeasons | null> {
    const { data: seriesData, error: seriesError } = await supabase
      .from('movies')
      .select('*')
      .eq('id', seriesId)
      .single();

    if (seriesError || !seriesData) return null;

    const { data: seasonsData, error: seasonsError } = await supabase
      .from('seasons')
      .select(`id, season_number, title, episodes (*)`)
      .eq('series_id', seriesId)
      .order('season_number', { ascending: true });

    if (seasonsError) {
      console.error("Error fetching seasons:", seasonsError);
    }

    const seasons: SeriesSeason[] = (seasonsData || []).map((s: any) => ({
      id: s.id,
      number: s.season_number,
      title: s.title,
      episodes: (s.episodes || [])
        .sort((a: any, b: any) => a.episode_number - b.episode_number)
        .map((e: any) => mapEpisode(e, seriesId)),
    }));

    return {
      ...mapSeries(seriesData),
      seasons,
    };
  },

  async getFeaturedSeries(): Promise<Series[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('is_series', true)
      .eq('is_featured', true)
      .limit(10);

    if (error || !data) return [];
    return data.map(mapSeries);
  },

  clearCache(): void {
    // no-op, react-query handles caching
  },
};
