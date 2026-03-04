"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { HistoryYearBlock } from "@/data/history";
import MotionWrapper from "@/components/MotionWrapper";
import PageHeader from "../ui/PageHeader";
import { UI_TEXT } from "@/constants/uiText";
import EmptyState from "../ui/EmptyState";

type Dir = 1 | -1;

interface RoadmapTimelineProps {
  historyRoadmap: HistoryYearBlock[];
}

export default function RoadmapTimeline({ historyRoadmap }: RoadmapTimelineProps) {
  // 데이터 정렬
  const years = useMemo(() => {
    const sortedYears = [...historyRoadmap].sort((a, b) => b.year - a.year);
    return sortedYears.map((yearBlock) => ({
      ...yearBlock,
      items: [...yearBlock.items].sort((a, b) => {
        if (!a.date) return 1; if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      }),
    }));
  }, [historyRoadmap]);

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<Dir>(1);
  
  // ✅ 탄성 효과를 위한 상태
  const [pullY, setPullY] = useState(0); 

  const wheelLockRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null); // 복원 타이머

  const goTo = useCallback((nextIndex: number, nextDir: Dir) => {
      const clamped = Math.max(0, Math.min(years.length - 1, nextIndex));
      if (clamped === index) {
        // 더 이상 갈 곳이 없으면 튕겨져 나가는 효과 초기화
        setPullY(0);
        wheelAccumRef.current = 0;
        return;
      }
      setDir(nextDir);
      setIndex(clamped);
      setPullY(0); // 이동 후 위치 초기화
      wheelAccumRef.current = 0;
  }, [index, years.length]);

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // ✅ 고도화된 휠 이벤트 로직 (탄성 + 임계값)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (wheelLockRef.current) {
        e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      // 오차 보정 (1px 여유)
      const isAtTop = scrollTop <= 0;
      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 1;
      const isScrollable = scrollHeight > clientHeight;

      // 🔥 설정: 넘어가기 위해 필요한 스크롤 양 (높을수록 많이 굴려야 함)
      const TRIGGER_THRESHOLD = 400; 
      // 🔥 설정: 시각적으로 당겨지는 저항 계수 (낮을수록 뻑뻑함)
      const RESISTANCE_FACTOR = 0.2; 

      // 사용자 스크롤 멈춤 감지 및 복원 (Snap back)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        if (!wheelLockRef.current) {
            setPullY(0);
            wheelAccumRef.current = 0;
        }
      }, 150); // 0.15초 동안 입력 없으면 원위치

      // 🔽 아래로 스크롤 (다음 연도로)
      if (e.deltaY > 0) {
        if (isScrollable && !isAtBottom) {
            // 내용 중간 스크롤 중에는 게이지 초기화
            wheelAccumRef.current = 0;
            setPullY(0);
            return;
        }

        // 바닥에 닿았을 때
        e.preventDefault();
        wheelAccumRef.current += e.deltaY;
        
        // 시각적 당김 효과 적용 (위쪽으로 당겨짐 -negative)
        // 최대 100px까지만 시각적으로 움직이게 제한
        const visualMove = Math.min(wheelAccumRef.current * RESISTANCE_FACTOR, 100);
        setPullY(-visualMove);

        // 임계값 초과 시 페이지 전환
        if (wheelAccumRef.current > TRIGGER_THRESHOLD) {
          wheelLockRef.current = true;
          goNext();
          setTimeout(() => {
             wheelLockRef.current = false;
             setPullY(0);
             wheelAccumRef.current = 0;
          }, 800);
        }
      } 
      // 🔼 위로 스크롤 (이전 연도로)
      else if (e.deltaY < 0) {
        if (isScrollable && !isAtTop) {
            wheelAccumRef.current = 0;
            setPullY(0);
            return;
        }

        // 천장에 닿았을 때
        e.preventDefault();
        wheelAccumRef.current += e.deltaY; // 음수 값 누적

        // 시각적 당김 효과 (아래쪽으로 당겨짐 +positive)
        const visualMove = Math.max(wheelAccumRef.current * RESISTANCE_FACTOR, -100);
        setPullY(-visualMove); // visualMove가 음수이므로 - 붙여서 양수로 변환

        // 임계값 초과 시 페이지 전환 (-500 보다 작아지면)
        if (wheelAccumRef.current < -TRIGGER_THRESHOLD) {
          wheelLockRef.current = true;
          goPrev();
          setTimeout(() => {
             wheelLockRef.current = false;
             setPullY(0);
             wheelAccumRef.current = 0;
          }, 800);
        }
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel as any);
  }, [goNext, goPrev, index]);

  // 키보드 네비게이션
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); goNext(); } 
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  if (years.length === 0) return <EmptyState content={UI_TEXT.EMPTY.NO_DATA_HISTORY}></EmptyState>;

  const current = years[index];

  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
    show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 80, damping: 15 } },
  };

  return (
    <main className="pt-24 pb-10 px-4 max-w-7xl mx-auto text-white">
      <PageHeader content={UI_TEXT.HEADERS.HISTORY}/>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 items-start">
        {/* 사이드바 (타임라인) */}
        <MotionWrapper delay={0.1}>
          <aside className="lg:sticky lg:top-24">
            <div className="text-xs tracking-[0.2em] text-zinc-400 mb-6">TIMELINE</div>
            <div className="relative pl-4">
              <div className="absolute left-[6px] top-0 bottom-0 w-px bg-white/10" />
              <ul className="space-y-5">
                {years.map((y, i) => {
                  const active = i === index;
                  return (
                    <li key={y.year} className="relative group">
                      {active && ( <motion.span layoutId="active-dot" className="absolute left-[2px] top-[8px] h-2 w-2 rounded-full bg-black-500 z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} /> )}
                      {!active && ( <span className="absolute left-[2px] top-[8px] h-2 w-2 rounded-full bg-white/20 transition group-hover:bg-white/40" /> )}
                      <button type="button" onClick={() => goTo(i, i > index ? 1 : -1)} className={["w-full text-left pl-6 py-1 rounded-lg transition relative z-0", active ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"].join(" ")}>
                        {y.year}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] text-zinc-400">CURRENT</div>
                <motion.div key={current.year} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-4xl font-black">
                  {current.year}
                </motion.div>
                {current.headline && <div className="mt-2 text-sm text-zinc-300">{current.headline}</div>}
              </div>
            </div>
          </aside>
        </MotionWrapper>

        <MotionWrapper delay={0.2}>
        {/* 메인 콘텐츠 영역 */}
        <section className="relative">
          <div className="mb-6 overflow-hidden">
            <div className="text-xs tracking-[0.25em] text-zinc-400">YEAR</div>
            <motion.div key={current.year + "title"} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "circOut" }} className="mt-2 text-5xl font-black">
              {current.year}
            </motion.div>
          </div>

          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5">
            {/* 배경 흐림 효과 */}
            <div className="pointer-events-none absolute inset-0">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-black-600/10 blur-3xl" />
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -left-32 -bottom-40 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
            </div>

            {/* ✅ 메인 콘텐츠 컨테이너 */}
            <motion.div 
                layout="size" 
                className="relative p-8 md:p-10" 
                transition={{ layout: { type: "spring", stiffness: 140, damping: 22, mass: 0.9 } }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.year}
                  layout="position"                  
                  // ✅ 탄성 효과 적용 (pullY)
                  animate={{ y: pullY, opacity: 1, filter: "blur(0px)" }}
                  initial={{ opacity: 0, y: dir === 1 ? 30 : -30, filter: "blur(4px)" }}
                  exit={{ opacity: 0, y: dir === 1 ? -30 : 30, filter: "blur(4px)" }}
                  
                  // ✅ 복원 애니메이션 (스프링 효과)
                  transition={{ 
                      y: { type: "spring", stiffness: 300, damping: 30 }, 
                      opacity: { duration: 0.35 },
                      filter: { duration: 0.35 }
                  }}
                  
                  style={{ transformOrigin: "center top" }}>
                  <div 
                    ref={scrollContainerRef}
                    className="max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar"
                  >
                
                  {current.headline ? <div className="text-right text-sm text-zinc-300 mb-8 pb-4 border-b border-white/5">{current.headline}</div> : <div className="mb-8" />}
                  
                  <motion.ul className="relative space-y-8 pl-2" variants={listContainerVariants} initial="hidden" animate="show">
                    {current.items.length > 1 && ( <div className="absolute left-[23px] top-4 bottom-4 w-px border-l border-dashed border-white/20 z-0" /> )}
                    {current.items.map((it, i) => (
                      <motion.li key={`${current.year}-${i}`} variants={listItemVariants} className="relative pl-12 z-10">
                        <span className="absolute left-[19px] top-6 h-2 w-2 rounded-full bg-black-500 ring-4 ring-[#18181b] ring-opacity-80" />
                        <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/20">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <span className="text-lg font-bold text-white group-hover:text-black-400 transition-colors">{it.title}</span>
                            {it.date && ( <span className="inline-block px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-300 bg-white/10 rounded-full shrink-0">{it.date}</span> )}
                          </div>
                          {it.description && ( <p className="text-sm text-zinc-400 leading-relaxed mb-4">{it.description}</p> )}
                          {it.tags?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {it.tags.map((t) => ( <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-zinc-400 group-hover:border-white/20 group-hover:text-zinc-300 transition-colors"># {t}</span> ))}
                            </div>
                          ) : null}
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
        </MotionWrapper>

      </div>
                    
      {/* ✅ 스크롤바 숨기기 스타일 */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </main>
  );
}