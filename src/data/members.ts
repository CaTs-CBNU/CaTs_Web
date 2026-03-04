import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/db';

export async function getMembers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    // ✅ [수정] 가입 대기(pending) 상태인 회원은 리스트에서 제외
    .neq('role', 'pending')
    // 정렬: Enum 정의 순서(president -> vice -> member)에 따라 오름차순 정렬
    .order('role', { ascending: true }) 
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data as Profile[];
}