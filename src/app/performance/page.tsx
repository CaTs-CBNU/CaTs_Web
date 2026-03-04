import { getPerformances } from "@/data/performance";
import PerformanceList from "@/components/pages/PerformanceList";

export default async function PerformancePage() {
  const performances = await getPerformances();

  return (
    <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto text-white min-h-screen">

      <PerformanceList performances={performances} />
    </main>
  );
}