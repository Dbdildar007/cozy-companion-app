import { supabase } from '@/integrations/supabase/client';
import type { Movie } from '@/data/movies';
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

function mapDbMovie(row: any): Movie {
  const genreField = row.genre || '';
  const genres = Array.isArray(genreField) ? genreField : (typeof genreField === 'string' && genreField ? genreField.split(',').map((g: string) => g.trim()) : []);
  const catField = row.category || '';
  const cats = Array.isArray(catField) ? catField : (typeof catField === 'string' && catField ? catField.split(',').map((c: string) => c.trim()) : []);

  return {
    id: row.id,
    title: row.title || 'Untitled',
    year: row.release_year || new Date().getFullYear(),
    rating: Number(row.rating) || 0,
    genre: genres,
    category: cats.length > 0 ? cats : genres,
    language: row.language || 'English',
    description: row.description || '',
    poster: resolveUrl(row.poster_url, posterMap),
    heroImage: resolveUrl(row.banner_url, heroMap) || undefined,
    url: row.video_url || undefined,
    duration: row.duration || '',
    isTrending: !!row.is_trending,
    isEditorChoice: !!row.is_featured,
    isSeries: !!row.is_series,
  };
}

export const movieService = {
  async getAllMovies(): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("DB fetch failed:", error);
      return [];
    }

    return (data || []).map(mapDbMovie);
  },

  async getFeaturedMovies(): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('is_featured', true)
      .limit(10);

    if (error || !data || data.length === 0) return [];
    return data.map(mapDbMovie);
  },

  async getMoviesByCategory(category: string): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('category', `%${category}%`);

    if (error) return [];
    return (data || []).map(mapDbMovie);
  },

  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('genre', `%${genre}%`);

    if (error) return [];
    return (data || []).map(mapDbMovie);
  },

  async searchMovies(query: string, filters?: {
    genre?: string;
    year?: number;
    minRating?: number;
  }): Promise<Movie[]> {
    let qb = supabase.from('movies').select('*') as any;

    if (query) qb = qb.ilike('title', `%${query}%`);
    if (filters?.genre) qb = qb.ilike('genre', `%${filters.genre}%`);
    if (filters?.year) qb = qb.eq('release_year', filters.year);
    if (filters?.minRating) qb = qb.gte('rating', filters.minRating);

    const { data, error } = await qb.range(0, 50);
    if (error) return [];
    return (data || []).map(mapDbMovie);
  },

  clearCache(): void {
    // no-op
  }
};
