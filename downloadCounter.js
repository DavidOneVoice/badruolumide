import { supabase } from "./supabase";

// Function to fetch current download count
export const getDownloadCount = async () => {
  const { data, error } = await supabase
    .from("download")
    .select("count")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching count:", error);
    return 0; // fallback
  }

  return data.count;
};

// Function to increment download count by 1
export const incrementDownloadCount = async () => {
  // First, fetch current count
  const currentCount = await getDownloadCount();

  // Then, update the count in Supabase
  const { data, error } = await supabase
    .from("download")
    .update({ count: currentCount + 1 })
    .eq("id", 1) // assuming your row id = 1
    .select()
    .single();

  if (error) {
    console.error("Error incrementing count:", error);
    return currentCount;
  }

  return data.count;
};
