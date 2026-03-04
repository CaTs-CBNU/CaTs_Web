import { supabase } from '@/lib/supabase/client';
import { Post } from '@/types/db';

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles (
        id,
        full_name,
        image_url,
        role
      )
    `)
    .order('date', { ascending: false }); // 최신 글 순서

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data as any;
}