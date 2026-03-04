"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Profile } from "@/types/db";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";

// ✅ 공통 컴포넌트 및 상수 import
import MotionWrapper from "@/components/MotionWrapper";
import PageHeader from "@/components/ui/PageHeader";
import FilterTabs from "@/components/ui/FilterTabs";
import EmptyState from "@/components/ui/EmptyState";
import { UI_TEXT } from "@/constants/uiText";

// 필터 타입 정의 (상태값과 UI 텍스트 매핑)
type FilterType = "student" | "leave" | "alumni";

interface MemberCarouselProps {
  members: Profile[];
}

export default function MemberCarousel({ members }: MemberCarouselProps) {
  const [filter, setFilter] = useState<FilterType>("student");

  // 필터링 로직
  const filtered = useMemo(
    () => members.filter((m) => {
        if (filter === 'student') return m.status === '재학';
        if (filter === 'leave') return m.status === '휴학';
        if (filter === 'alumni') return m.status === '졸업';
        return true;
    }),
    [filter, members]
  );

  const gridMembers = filtered;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 선택된 멤버 찾기 (없으면 첫 번째 멤버)
  const selected: Profile | undefined = gridMembers.find((m) => m.id === selectedId) ?? gridMembers[0];
  const PANEL_H = "h-[580px]";

  return (
    <div className="w-full max-w-7xl mx-auto text-white">
      
      {/* 1. 헤더 섹션 (PageHeader 사용) */}
      <section className="flex flex-col items-center">
        <PageHeader content={UI_TEXT.HEADERS.MEMBERS} />
      </section>

      {/* 2. 필터 버튼 (FilterTabs 사용) */}
      <MotionWrapper delay={0.2} className="flex justify-center mb-10">
        <FilterTabs 
          items={[
            { label: "재학생", value: "student" },
            { label: "휴학생", value: "leave" },
            { label: "졸업생", value: "alumni" }
          ]}
          activeValue={filter}
          onSelect={(val) => {
             setFilter(val);
             setSelectedId(null); // 필터 변경 시 선택 초기화
          }}
        />
      </MotionWrapper>

      {/* 3. 본문 그리드 */}
      {gridMembers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1px_1fr] gap-8 items-start">
            
            {/* 좌측 리스트 패널 */}
            <MotionWrapper 
                delay={0.3} 
                className={`rounded-[28px] border border-white/10 bg-white/5 p-4 ${PANEL_H} overflow-auto jelly-scroll backdrop-blur-md`}
            >
            <div className="grid grid-cols-3 gap-5 content-start">
                <AnimatePresence mode="popLayout">
                {gridMembers.map((m) => {
                    const active = selected?.id === m.id;
                    return (
                    <motion.button
                        key={m.id}
                        layoutId={`member-${m.id}`} // layoutId 고유하게 변경
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedId(m.id)}
                        className={`w-full rounded-3xl border overflow-hidden text-left transition relative focus:outline-none ${active ? "border-white ring-1 ring-white z-10 scale-105 shadow-xl shadow-navy/50" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30"}`}
                    >
                        <div className="relative aspect-[3/4]">
                        {(m.role === "president" || m.role === "vice_president") && (
                            <div className="absolute top-2 left-2 z-10">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold backdrop-blur-md shadow-md border border-white/20 ${m.role === 'president' ? 'bg-navy' : 'bg-zinc-600'}`}>
                                {m.role === 'president' ? '회장' : '부회장'}
                            </span>
                            </div>
                        )}
                        <Image src={m.image_url || "/cats.png"} alt={m.full_name} fill className="object-cover" sizes="(max-width: 1024px) 30vw, 160px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                        <div className="p-3 absolute bottom-0 left-0 w-full">
                        <div className="text-[10px] text-zinc-300 opacity-80">{m.major}</div>
                        <div className="font-bold text-sm text-white">{m.full_name}</div>
                        </div>
                    </motion.button>
                    );
                })}
                </AnimatePresence>
            </div>
            </MotionWrapper>

            <motion.div 
                className="hidden lg:block w-px bg-white/10 rounded-full h-full" 
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: "100%" }}
                transition={{ delay: 0.4, duration: 0.8 }}
            />

            {/* 우측 상세 카드 패널 */}
            <MotionWrapper 
                delay={0.4} 
                className={`rounded-[32px] border border-white/10 bg-white/5 overflow-hidden relative ${PANEL_H} backdrop-blur-md`}
            >
            <AnimatePresence mode="wait">
                <motion.div 
                key={selected?.id || "empty"}
                initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full flex flex-col"
                >
                    {/* 상단 비주얼 */}
                    <div className="relative h-[260px] shrink-0">
                    {selected?.image_url ? (
                        <Image src={selected.image_url} alt={selected.full_name} fill className="object-cover opacity-80" sizes="(max-width: 1024px) 100vw, 800px" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                    <div className="absolute left-8 top-10 right-8">
                        <div className="text-xs tracking-widest text-zinc-400 font-bold">CATS MEMBER</div>
                        <h2 className="mt-4 text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-lg">{selected ? `${selected.full_name}` : "Select Member"}</h2>
                        {selected && (
                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                            <span className="px-3 py-1 rounded-full bg-navy/80 text-white font-bold border border-white/10 backdrop-blur-md">{selected.role}</span>
                            {selected.major && <span className="px-3 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/10 backdrop-blur-md">{selected.major}</span>}
                        </div>
                        )}
                    </div>
                    </div>

                    {/* 하단 내용 */}
                    <div className="flex-1 min-h-0 p-8 bg-[#121212]">
                    <div className="h-full overflow-auto pr-2 jelly-scroll">
                        <div className="mb-8">
                        <div className="text-xs text-white font-bold mb-2 tracking-wider flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"/> MAJOR</div>
                        <div className="text-lg text-white font-medium">{selected?.major ?? "등록된 전공 정보가 없어요."}</div>
                        </div>
                        <div className="mb-8">
                        <div className="text-xs text-white font-bold mb-3 tracking-wider flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"/> INTERESTS</div>
                        {selected?.interests?.length ? (
                            <div className="flex flex-wrap gap-2">
                            {selected.interests.map((tag) => (
                                <span key={tag} className="text-xs px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-zinc-300 hover:border-white/30 transition-colors">{tag}</span>
                            ))}
                            </div>
                        ) : <div className="text-sm text-zinc-500">등록된 관심분야가 없어요.</div>}
                        </div>
                        <div>
                        <div className="text-xs text-white font-bold mb-2 tracking-wider flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"/> BIO</div>
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{selected?.bio ?? "등록된 소개가 없어요."}</p>
                        </div>
                    </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            </MotionWrapper>
        </div>
      ) : (
        // ✅ 데이터 없음 처리 (EmptyState)
        <EmptyState 
            icon={<Users size={32} />}
            content={UI_TEXT.EMPTY.NO_DATA_MEMBERS}
        />
      )}

      {filtered.length > 9 && (
        <MotionWrapper delay={1} className="mt-6 text-center text-xs text-zinc-600">
          스크롤하여 더 많은 멤버를 확인하세요. (총 {filtered.length}명)
        </MotionWrapper>
      )}

      <style jsx global>{`
        .jelly-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .jelly-scroll::-webkit-scrollbar-thumb { border-radius: 999px; background: #1C2541; border: 2px solid transparent; background-clip: padding-box; }
      `}</style>
    </div>
  );
}