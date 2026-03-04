import { supabase } from '@/lib/supabase/client';
import { Performance } from '@/types/db';

export async function getPerformances(): Promise<Performance[]> {
  const { data, error } = await supabase
    .from('performances')
    .select(`
      *,
      members:performance_members (
        user_id,
        profiles (
          id,
          full_name,
          image_url
        )
      )
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching performances:', error);
    return [];
  }

  return data as unknown as Performance[];
}