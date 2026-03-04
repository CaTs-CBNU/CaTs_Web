export const dynamic = "force-dynamic"; 

import { getProjects } from "@/data/projects";
import ProjectList from "@/components/pages/ProjectList";
import { Suspense } from "react";
import { motion } from "framer-motion"; // 서버 컴포넌트라 직접 애니메이션 못 줌

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto text-white min-h-screen">
      <section className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy/30 blur-[100px] rounded-full -z-10 pointer-events-none" />
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white">Our Projects</h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            CaTs 멤버들이 함께 고민하고 만들어낸 결과물들을 소개합니다.
          </p>
      </section>
      <Suspense fallback={<div>프로젝트를 불러오는 중입니다...</div>}>
        <ProjectList projects={projects} />
      </Suspense>
    </main>
  );
}