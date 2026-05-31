"use server";

import { createClient } from "@/lib/supabase/server";

interface SaveSessionParams {
  focus: number;
  fatigue: number;
  complexity: number;
  duration: number;
  category: string;
  confidence: number;
}

export async function saveStudySession(params: SaveSessionParams) {
  try {
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase.from("study_sessions").insert({
      user_id: userData.user.id,
      ...params,
    }).select().single();

    if (error) {
      console.error("Error saving session:", error);
      return { success: false, error: "Failed to save session" };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Caught error saving session:", err);
    return { success: false, error: err.message || "Unknown error occurred" };
  }
}

export async function getStudySessions() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return [];
  }

  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error retrieving sessions:", error);
    return [];
  }

  return data;
}