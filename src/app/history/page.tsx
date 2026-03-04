import { getHistoryRoadmap } from "@/data/history"; // ✅ 위에서 만든 함수
import RoadmapTimeline from "@/components/pages/RoadmapTimeline";

export default async function HistoryPage() {
  // 1. 서버에서 데이터 가져오기
  const historyRoadmap = await getHistoryRoadmap();

  return (
    // 2. 컴포넌트에 데이터 전달 (이 부분이 빠져서 에러가 났던 것)
    <RoadmapTimeline historyRoadmap={historyRoadmap} />
  );
}