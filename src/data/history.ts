import { supabase } from '@/lib/supabase/client';
import { History } from '@/types/db';

export type HistoryItem = {
  date: string;
  title: string;
  description?: string;
  tags?: string[];
};

export type HistoryYearBlock = {
  year: number;
  headline?: string;
  items: HistoryItem[];
};

export async function getHistoryRoadmap(): Promise<HistoryYearBlock[]> {
  const { data, error } = await supabase
    .from('histories')
    .select('*')
    .order('date', { ascending: true }); 

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  // DB 타입이 History 인터페이스와 일치한다고 가정하고 단언
  const rawHistory = data as unknown as History[];

  const grouped: Record<number, HistoryItem[]> = {};
  
  rawHistory.forEach((item) => {
    const dateObj = new Date(item.date);
    const year = dateObj.getFullYear();
    const formattedDate = `${year}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped[year]) {
      grouped[year] = [];
    }

    // nullish 값 처리 (description, tags)
    grouped[year].push({
      date: formattedDate,
      title: item.title,
      description: item.description || undefined,
      tags: item.tags || [],
    });
  });

  const roadmap: HistoryYearBlock[] = Object.keys(grouped)
    .map((yearStr) => {
      const year = parseInt(yearStr);
      return {
        year,
        headline: `${year}년의 발자취`,
        items: grouped[year],
      };
    })
    .sort((a, b) => a.year - b.year);

  return roadmap;
}