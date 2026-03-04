"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; 
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";

// ✅ 공통 컴포넌트 및 상수 import
import MotionWrapper from "@/components/MotionWrapper";
import GlassCard from "@/components/ui/GlassCard"; // Recent News 섹션용
import { UI_TEXT } from "@/constants/uiText";

import IntroVideoOverlay from "@/components/IntroVideoOverlay";
import ProjectCarousel from "@/components/ProjectCarousel";
import SeminarCalendar from "@/components/SeminarCalendar";
import { Schedule, Project, Performance } from "@/types/db";

interface HomeClientProps {
  schedules: Schedule[];
  projects: Project[];
  recentPerformances: Performance[];
}

export default function HomeClient({ schedules, projects, recentPerformances }: HomeClientProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const supabase = createClient();

  // --- 기존 스크롤 및 페이지 이동 로직 ---
  const pageRef = useRef(0);
  const isLocked = useRef(false);
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);

  const movePage = useCallback((pageNum: number) => {
    isLocked.current = true;
    pageRef.current = pageNum;
    const pageHeight = window.innerHeight;
    window.scrollTo({ top: pageHeight * pageNum, behavior: "smooth" });
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => { isLocked.current = false; }, 1200); 
  }, []);

  // 1. 새로고침 시 무조건 최상단 이동 & 로그인 체크
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    movePage(0);

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();
  }, [movePage, supabase]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        if (showIntro) return;
        if (window.innerWidth < 768) return;
        if (isLocked.current) { e.preventDefault(); e.stopPropagation(); return; }
        
        const { deltaY } = e;
        const { scrollTop } = document.documentElement;
        
        if (pageRef.current === 0) {
          if (deltaY > 0) { e.preventDefault(); movePage(1); }
        } else if (pageRef.current === 1) {
          if (deltaY > 0) { e.preventDefault(); movePage(2); }
          else if (deltaY < 0) { e.preventDefault(); movePage(0); }
        } else if (pageRef.current === 2) {
          if (deltaY < 0) {
             const page2Top = window.innerHeight * 2;
             if (scrollTop <= page2Top + 10) { e.preventDefault(); movePage(1); }
          }
        }
      };
  
      window.addEventListener("wheel", handleWheel, { passive: false });
      const handleResize = () => { 
          if (window.innerWidth >= 768) {
              window.scrollTo({ top: window.innerHeight * pageRef.current, behavior: "auto" }); 
          }
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("resize", handleResize);
        if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      };
  }, [showIntro, movePage]);

  const handleStartJourney = (e: React.MouseEvent) => {
    if (isLoggedIn) {
      e.preventDefault();
      movePage(1);
    }
  };

  const gradationClass = "inline-block text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-300 to-zinc-600 font-black drop-shadow-sm pb-5";

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroVideoOverlay src="/intro.mp4" onDone={() => setShowIntro(false)} />}
      </AnimatePresence>

      <main className="w-full bg-black text-white selection:bg-navy/30 overflow-x-hidden overflow-y-auto md:overflow-hidden">
        
        {/* Page 0: Hero Section */}
        <section className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 md:px-20 overflow-hidden pt-20 md:pt-0">
           <div className="absolute inset-0 z-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 blur-[2px] scale-105">
              <source src="/main_background.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          {!showIntro && (
            <MotionWrapper 
                delay={0.5} 
                duration={1}
                className="relative z-10 w-full max-w-4xl p-6 md:p-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col items-center text-center"
            >
                <div className="inline-block px-4 py-1.5 mb-6 md:mb-8 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm shadow-inner">
                    <span className="text-[10px] md:text-sm font-semibold text-white/90 tracking-widest uppercase">
                        {UI_TEXT.HOME.HERO.EST}
                    </span>
                </div>
                <h1 className="text-4xl md:text-8xl font-black tracking-tight mb-6 md:mb-8 text-white leading-[1.2] drop-shadow-lg w-full text-left break-keep">
                    C<span className={gradationClass}>ollaborating</span> <br />
                    a<span className={gradationClass}>nd</span> <br />
                    T<span className={gradationClass}>echnology</span> <br />
                    s<span className={gradationClass}>tudio</span>
                </h1>
                
                {/* ✅ UI_TEXT 적용 + 줄바꿈 처리 */}
                <p className="text-base md:text-2xl text-zinc-300 mb-8 md:mb-12 max-w-2xl font-light leading-relaxed break-keep whitespace-pre-line">
                    {UI_TEXT.HOME.HERO.SUBTITLE}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-5 w-full sm:w-auto justify-center">
                    <Link href={isLoggedIn ? "#" : "/signup"} onClick={handleStartJourney} className="px-6 md:px-10 py-3 md:py-4 rounded-full bg-navy text-white font-bold text-base md:text-lg hover:bg-white hover:text-black transition shadow-lg shadow-navy/30 flex items-center justify-center gap-2 group w-full sm:w-auto">
                        {UI_TEXT.HOME.HERO.BTN_START} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/projects" className="px-6 md:px-10 py-3 md:py-4 rounded-full border border-white/30 text-white font-bold text-base md:text-lg hover:bg-white/10 transition flex items-center justify-center w-full sm:w-auto">
                        {UI_TEXT.HOME.HERO.BTN_PROJECTS}
                    </Link>
                </div>
            </MotionWrapper>
          )}
        </section>

        {/* Page 1: Projects */}
        <section className="min-h-screen md:h-screen w-full flex items-center justify-center relative overflow-hidden bg-main-black z-10">
           <ProjectCarousel projects={projects} />
        </section>

        {/* Page 2: Info */}
        <section className="min-h-screen w-full flex items-center justify-center py-24 px-4 bg-main-black z-10">
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-full min-h-[500px]">
              <MotionWrapper direction="left" duration={0.8} className="h-full">
                <SeminarCalendar schedules={schedules} />
              </MotionWrapper>
            </div>

            <div className="lg:col-span-1 h-full min-h-[500px]">
              {/* ✅ MotionWrapper + GlassCard 적용 */}
              <MotionWrapper direction="right" duration={0.8} delay={0.2} className="h-full">
                <GlassCard className="h-full p-6 flex flex-col">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> {UI_TEXT.HOME.RECENT_NEWS.TITLE}
                    </h2>
                    
                    <div className="flex-1 space-y-6">
                    {recentPerformances.map((perf, idx) => (
                        <div key={perf.id} className="relative pl-4 border-l-2 border-white/10 pb-2 last:pb-0">
                        <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-600'}`} />
                        <div className="text-xs font-mono text-zinc-500 mb-1">{perf.date}</div>
                        <div className="font-bold text-white text-sm line-clamp-2 mb-1">{perf.title}</div>
                        <div className="text-xs text-zinc-400">
                            {perf.award_grade ? <span className="text-yellow-200">{perf.award_grade}</span> : <span>{perf.journal}</span>}
                        </div>
                        </div>
                    ))}
                    </div>
                    
                    <Link href="/performance" className="mt-6 text-sm text-center text-zinc-500 hover:text-white transition block border-t border-white/10 pt-4">
                        {UI_TEXT.HOME.RECENT_NEWS.VIEW_ALL}
                    </Link>
                </GlassCard>
              </MotionWrapper>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}