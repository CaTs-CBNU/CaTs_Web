"use client";

import { useState } from "react";
import { Trophy, ScrollText, Lightbulb, Calendar, Award, Users, ExternalLink } from "lucide-react";
import { AnimatePresence } from "framer-motion"; 
import { Performance, PerformanceCategory } from "@/types/db"; 

// ✅ 공통 컴포넌트 및 상수 import
import MotionWrapper from "@/components/MotionWrapper";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import FilterTabs from "@/components/ui/FilterTabs";
import { UI_TEXT } from "@/constants/uiText";

interface PerformanceListProps {
  performances: Performance[];
}

export default function PerformanceList({ performances }: PerformanceListProps) {
  const [filter, setFilter] = useState<"all" | PerformanceCategory>("all");
  const filteredData = performances.filter((item) => filter === "all" || item.category === filter);
  
  // 통계 데이터 (필요 시 사용, 현재 디자인에서는 FilterTabs로 대체됨)
  /*
  const stats = {
    award: performances.filter((p) => p.category === "award").length,
    paper: performances.filter((p) => p.category === "paper").length,
    patent: performances.filter((p) => p.category === "patent").length,
  };
  */

  return (
    <>
      {/* 1. 헤더 섹션 */}
      <section className="flex flex-col items-center">
        <PageHeader content={UI_TEXT.HEADERS.PERFORMANCE} />
      </section>

      {/* 2. 필터 탭 (StatCard 대신 탭 스타일로 변경하여 일관성 유지) */}
      <MotionWrapper delay={0.2} className="flex justify-center mb-12">
        <FilterTabs 
          items={[
            { label: "All View", value: "all" },
            { label: "Awards", value: "award" },
            { label: "Papers", value: "paper" },
            { label: "Patents", value: "patent" }
          ]}
          activeValue={filter}
          onSelect={setFilter}
        />
      </MotionWrapper>

      {/* 3. 실적 리스트 */}
      <div className="space-y-6 relative">
        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block" />
        
        <AnimatePresence mode="popLayout">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <MotionWrapper key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* 아이콘 원 */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-navy bg-navy shadow-lg shadow-navy/40 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {item.category === "award" && <Trophy size={18} className="text-yellow-400" />}
                  {item.category === "paper" && <ScrollText size={18} className="text-blue-400" />}
                  {item.category === "patent" && <Lightbulb size={18} className="text-purple-400" />}
                </div>
                
                {/* 카드 내용 */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <time className="flex items-center gap-2 text-xs font-mono text-zinc-500 font-bold">
                        <Calendar size={12} /> {item.date}
                    </time>
                    {getBadge(item)}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">{item.title}</h3>
                  
                  <div className="text-sm text-zinc-400 mb-4 space-y-1">
                    {item.award_grade && ( 
                        <div className="flex items-center gap-2 text-yellow-200/90 font-semibold">
                            <Award size={14} /> {item.award_grade}
                        </div> 
                    )}
                    {(item.journal || item.organizer) && ( 
                        <div className="text-zinc-500 text-xs">
                            {item.journal || item.organizer} {item.number && `| ${item.number}`}
                        </div> 
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Users size={14} />
                      <span>{item.members?.map(m => m.profiles.full_name).join(", ") || ""}</span>
                    </div>
                    
                    {item.links && item.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {item.links.map((link, idx) => (
                                <a 
                                    key={idx}
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                                >
                                    <ExternalLink size={10} /> {link.title}
                                </a>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              </MotionWrapper>
            ))
          ) : (
            // ✅ 빈 상태 (EmptyState 컴포넌트 사용)
            <EmptyState 
                icon={<Trophy size={32} />}
                content={UI_TEXT.EMPTY.NO_DATA_PERFORMANCE}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Helper Function (뱃지 스타일)
function getBadge(item: Performance) {
  if (item.category === "award") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/20">AWARD</span>;
  if (item.category === "patent") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/20">PATENT</span>;
  
  // 논문 타입에 따른 색상
  const color = item.paper_type === "SCIE" ? "text-green-300 bg-green-500/20 border-green-500/20" : 
                item.paper_type === "KCI" ? "text-blue-300 bg-blue-500/20 border-blue-500/20" : 
                "text-zinc-300 bg-zinc-500/20 border-zinc-500/20";
                
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>{item.paper_type || "PAPER"}</span>;
}