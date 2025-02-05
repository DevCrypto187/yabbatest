import { supabase } from "./api";

export async function fetchUserScore(supabaseUserId: string | null) {
  if (!supabaseUserId) return 0;

  try {
    const { data, error } = await supabase
      .from("Leaderboard")
      .select("score")
      .eq("userId", supabaseUserId);

    if (error) throw error;

    return data?.[0]?.score || 0;
  } catch (error) {
    console.error("Failed to fetch score:", error);
    return 0;
  }
}
