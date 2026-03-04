import { supabase } from '@/lib/supabase/client';
import { Schedule } from '@/types/db';

export async function getSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }

  return data as Schedule[];
}