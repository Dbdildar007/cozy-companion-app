import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useRatings() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("cinestream-ratings");
      if (saved) setRatings(JSON.parse(saved));
      return;
    }

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("movie_ratings")
        .select("movie_id, rating")
        .eq("user_id", user.id);

      if (data && !error) {
        const dbRatings = data.reduce<Record<string, number>>((acc, curr) => {
          acc[curr.movie_id] = curr.rating;
          return acc;
        }, {});
        setRatings(dbRatings);
        localStorage.setItem("cinestream-ratings", JSON.stringify(dbRatings));
      }
    };

    fetchRatings();
  }, [user]);

  const setRating = useCallback(
  async (id: string, rating: number) => {
    if (!user) return;

    // Optimistic update (updates the UI immediately)
    setRatings((prev) => ({ ...prev, [id]: rating }));

    const { error } = await supabase
      .from('movie_ratings') // Your table name
      .upsert(
        { 
          movie_id: id,      // Put the ID (Movie or Series) into this column
          user_id: user.id, 
          rating: rating 
        },
        { onConflict: 'user_id,movie_id' } // Matches your UNIQUE constraint
      );

    if (error) {
      console.error("Error setting rating:", error);
      // Revert UI if database fails
      setRatings((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  },
  [user, supabase]
);

  const getRating = useCallback((movieId: string) => {
    return ratings[movieId] || 0;
  }, [ratings]);

  return { ratings, setRating, getRating };
}
