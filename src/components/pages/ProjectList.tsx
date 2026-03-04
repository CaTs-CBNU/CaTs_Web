"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Github, FolderKanban, CheckCircle2, Users, X, Link as LinkIcon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import { Project, ProjectStatus } from "@/types/db";

// ✅ 공통 컴포넌트 및 상수
import MotionWrapper from "@/components/MotionWrapper";
import FilterTabs from "@/components/ui/FilterTabs";
import EmptyState from "@/components/ui/EmptyState";
import { UI_TEXT } from "@/constants/uiText";

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProjectStatus>("ongoing");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // URL 파라미터 감지 및 자동 모달 오픈
  useEffect(() => {
    const idFromParams = searchParams.get("id");
    if (idFromParams) {
      const targetProject = projects.find(p => p.id === idFromParams);
      if (targetProject) {
        setActiveTab(targetProject.status);
        setSelectedId(idFromParams);
      }
    }
  }, [searchParams, projects]);

  const filteredProjects = projects.filter((p) => p.status === activeTab);
  const selectedProject = projects.find(p => p.id === selectedId);

  // 모달 오픈 시 스크롤 잠금
  useEffect(() => {
    if (selectedId) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedId]);

  return (
    <>
      {/* 1. 필터 탭 (FilterTabs 컴포넌트 사용) */}
      <MotionWrapper delay={0.1} className="flex justify-center mb-12">
        <FilterTabs 
          items={[
            { label: "Ongoing Projects", value: "ongoing" },
            { label: "Finished Projects", value: "finished" }
          ]}
          activeValue={activeTab}
          onSelect={setActiveTab}
        />
      </MotionWrapper>

      {/* 2. 프로젝트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="wait">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            // ✅ [수정] 등장 애니메이션은 MotionWrapper가 담당
            <MotionWrapper key={project.id} layoutId={project.id}> 
              <motion.div
                // ⚠️ layoutId와 onClick은 MotionWrapper에 전달되지 않으므로 내부 div에 유지
                layoutId={`card-${project.id}`} 
                onClick={() => setSelectedId(project.id)}
                className="group cursor-pointer rounded-[24px] border border-white/10 bg-white/5 overflow-hidden hover:border-white/30 hover:bg-white/10 transition-colors duration-300 flex flex-col hover:shadow-2xl hover:shadow-white/5 h-full"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* 썸네일 */}
                <div className="relative h-56 w-full overflow-hidden bg-black/50">
                  {project.image_url ? (
                    <Image 
                      src={project.image_url} 
                      alt={project.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700"><FolderKanban size={48} /></div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${project.status === 'ongoing' ? 'bg-navy/80 border-navy text-white' : 'bg-white/20 border-white/30 text-white'}`}>
                      {project.status === 'ongoing' ? 'Ongoing' : 'Finished'}
                    </span>
                  </div>
                </div>

                {/* 카드 내용 */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors whitespace-normal break-words">
                      {project.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                      <Users size={14} />
                      <span className="truncate">
                        {project.members?.map((m) => m.profiles.full_name).join(", ") || "구성원 정보 없음"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 font-mono pl-6">
                        {project.start_date ? project.start_date.split('-')[0] : ''}
                        {project.end_date ? ` ~ ${project.end_date.split('-')[0]}` : ''}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                          {tag}
                        </span>
                      ))}
                      {(project.tags?.length || 0) > 3 && <span className="text-[10px] text-zinc-500 px-1">+{ (project.tags?.length || 0) - 3 }</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            </MotionWrapper>
          ))
        ) : (
          // ✅ [수정] 빈 상태 컴포넌트 사용
          <EmptyState 
            icon={<FolderKanban size={32} />}
            content={UI_TEXT.EMPTY.NO_DATA_PROJECT}
          />
        )}
        </AnimatePresence>
      </div>

      {/* 3. 상세 정보 모달 */}
      <AnimatePresence>
        {selectedId && selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                <motion.div
                    // layoutId를 카드와 매칭시켜 확장 효과 구현
                    layoutId={`card-${selectedId}`} 
                    className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative pointer-events-auto max-h-[90vh] flex flex-col"
                >
                    <button 
                        onClick={() => setSelectedId(null)}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white hover:text-black rounded-full text-white transition"
                    >
                        <X size={20} />
                    </button>

                    {/* 모달 헤더 이미지 */}
                    <div className="relative h-64 md:h-80 w-full shrink-0 bg-black">
                        {selectedProject.image_url ? (
                            <Image 
                                src={selectedProject.image_url} 
                                alt={selectedProject.title} 
                                fill 
                                className="object-cover opacity-90"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700"><FolderKanban size={64} /></div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900 to-transparent pt-20">
                            {/* ✅ 모달 내부 요소들도 MotionWrapper로 부드럽게 등장 */}
                            <MotionWrapper delay={0.2}>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg whitespace-normal break-words">
                                    {selectedProject.title}
                                </h2>
                                <div className="flex gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedProject.status === 'ongoing' ? 'bg-navy border-navy text-white' : 'bg-zinc-700 border-zinc-600 text-zinc-300'}`}>
                                        {selectedProject.status.toUpperCase()}
                                    </span>
                                    {(selectedProject.start_date || selectedProject.end_date) && (
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/50 border border-white/10 text-zinc-300 flex items-center gap-1">
                                            <Calendar size={12} /> 
                                            {selectedProject.start_date ? selectedProject.start_date.split('-')[0] : ''} 
                                            {selectedProject.end_date ? ` ~ ${selectedProject.end_date.split('-')[0]}` : ' ~ ing'}
                                        </span>
                                    )}
                                </div>
                            </MotionWrapper>
                        </div>
                    </div>

                    {/* 모달 내용 */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                        <div className="prose prose-invert max-w-none mb-8">
                            <MotionWrapper delay={0.3}>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">Project Description</h3>
                                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                                    {selectedProject.description}
                                </p>
                            </MotionWrapper>
                        </div>

                        <MotionWrapper delay={0.4} className="mb-8">
                             <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Users size={18} className="text-zinc-400"/> Team Members</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedProject.members?.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-navy/30 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                            {member.profiles.full_name[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{member.profiles.full_name}</div>
                                            <div className="text-xs text-zinc-500 uppercase font-semibold">{member.role}</div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </MotionWrapper>

                        <MotionWrapper delay={0.5} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-white/10 pt-6">
                             <div className="flex flex-wrap gap-2">
                                {selectedProject.tags?.map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 border border-white/5 text-xs font-medium">
                                        # {tag}
                                    </span>
                                ))}
                             </div>
                             
                             <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                {selectedProject.links?.map((link, idx) => {
                                    const lowerTitle = link.title.toLowerCase();
                                    return (
                                        <a 
                                            key={idx}
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${lowerTitle.includes('git') ? 'bg-zinc-800 hover:bg-white hover:text-black text-white' : 'bg-navy hover:bg-white hover:text-black text-white shadow-lg shadow-navy/20'}`}
                                        >
                                            {lowerTitle.includes('git') ? <Github size={18} /> : <LinkIcon size={18} />}
                                            {link.title}
                                        </a>
                                    );
                                })}
                             </div>
                        </MotionWrapper>
                    </div>
                </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}