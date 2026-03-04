import { supabase } from '@/lib/supabase/client';
import { Project } from '@/types/db';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      members:project_members (
        user_id,
        role,
        profiles (
          id,
          full_name,
          image_url
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  // ✅ DB 구조와 타입이 일치하므로 안전하게 변환
  return data as unknown as Project[];
}