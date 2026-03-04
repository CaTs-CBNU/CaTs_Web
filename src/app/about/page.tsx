import { getHistoryRoadmap } from "@/data/history";
import { getProjects } from "@/data/projects";
import { getMembers } from "@/data/members";
import AboutContent from "@/components/pages/AboutContent";

export default async function AboutPage() {
  const [history, projects, members] = await Promise.all([
    getHistoryRoadmap(),
    getProjects(),
    getMembers(),
  ]);

  const startYear = Math.min(...history.map((h) => h.year));
  const currentYear = new Date().getFullYear();
  const yearsHistory = currentYear - startYear + 1;
  const activeMembersCount = members.filter((m) => m.status === "student" || m.status === "재학").length;
  const projectsCount = projects.length;

  return (
    <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto text-white">
      <AboutContent 
        yearsHistory={yearsHistory}
        activeMembersCount={activeMembersCount}
        projectsCount={projectsCount}
      />
    </main>
  );
}