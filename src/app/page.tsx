// src/app/page.tsx (또는 src/app/home/page.tsx)

import { getSchedules } from "@/data/schedule";
import { getProjects } from "@/data/projects";
import { getPerformances } from "@/data/performance";
import HomeClient from "@/components/pages/HomeClient"; // ⭐️ Client Component 분리 필요

// ✅ [중요] async 키워드 추가 (Error 1308 해결)
export default async function Home() {
  
  // ✅ 병렬로 데이터 Fetching
  const [schedules, projects, performances] = await Promise.all([
    getSchedules(),
    getProjects(),
    getPerformances(), // Error 2724 해결 (함수로 호출)
  ]);

  // 최근 실적 3개 추출
  const recentPerformances = performances.slice(0, 3);

  // ✅ Client Component에 데이터 전달 (Error 2741 해결)
  return (
    <HomeClient 
      schedules={schedules} 
      projects={projects} 
      recentPerformances={recentPerformances} 
    />
  );
}