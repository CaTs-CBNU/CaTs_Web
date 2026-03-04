"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

// ✅ 공통 컴포넌트 및 상수 import
import MotionWrapper from "@/components/MotionWrapper";
import PageHeader from "@/components/ui/PageHeader";
import GlassCard from "@/components/ui/GlassCard";
import { UI_TEXT } from "@/constants/uiText";

interface AboutContentProps {
  yearsHistory: number;
  activeMembersCount: number;
  projectsCount: number;
}

export default function AboutContent({ yearsHistory, activeMembersCount, projectsCount }: AboutContentProps) {
  return (
    <div className="w-full">
      {/* 1. 헤더 섹션 (PageHeader 사용) */}
      <section className="flex flex-col items-center mb-16">
        <PageHeader content={UI_TEXT.HEADERS.ABOUT} />
      </section>

      {/* 2. 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 메인 설명 카드 */}
        <MotionWrapper delay={0.1} className="lg:col-span-2 h-full">
            {/* ✅ hoverEffect 제거: 클릭 불가능한 정적 카드로 변경 */}
            <GlassCard className="p-8 md:p-12 h-full flex flex-col justify-center relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center mb-6 text-white shadow-lg shadow-navy/50">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-white">
                        {UI_TEXT.ABOUT.MAIN_CARD.TITLE}
                    </h2>
                    <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-line">
                        {UI_TEXT.ABOUT.MAIN_CARD.DESC}
                    </p>
                </div>
            </GlassCard>
        </MotionWrapper>

        {/* 통계 카드 */}
        <MotionWrapper delay={0.2} className="h-full">
            {/* ✅ hoverEffect 제거 */}
            <GlassCard className="p-8 h-full flex flex-col justify-center items-center text-center">
                <div className="space-y-8 relative z-10 w-full">
                    <div>
                        <div className="text-4xl font-black text-white mb-1">{yearsHistory}+</div>
                        <div className="text-sm text-zinc-500 font-medium tracking-wide">
                            {UI_TEXT.ABOUT.STATS.HISTORY}
                        </div>
                    </div>
                    <div className="w-12 h-px bg-white/10 mx-auto" />
                    <div>
                        <div className="text-4xl font-black text-white mb-1">{activeMembersCount}</div>
                        <div className="text-sm text-zinc-500 font-medium tracking-wide">
                            {UI_TEXT.ABOUT.STATS.MEMBERS}
                        </div>
                    </div>
                    <div className="w-12 h-px bg-white/10 mx-auto" />
                    <div>
                        <div className="text-4xl font-black text-white mb-1">{projectsCount}+</div>
                        <div className="text-sm text-zinc-500 font-medium tracking-wide">
                            {UI_TEXT.ABOUT.STATS.PROJECTS}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </MotionWrapper>
      </div>

      {/* 3. 하단 CTA */}
      <MotionWrapper delay={0.3} className="mt-16 text-center">
        <GlassCard className="p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
                {UI_TEXT.ABOUT.CTA.TITLE}
            </h2>
            <p className="text-zinc-400 mb-8">
                {UI_TEXT.ABOUT.CTA.DESC}
            </p>
            <div className="flex justify-center gap-4">
               <Link href="/signup" className="inline-flex items-center gap-2 bg-navy text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-black transition duration-300 shadow-lg shadow-navy/30">
                   {UI_TEXT.ABOUT.CTA.BTN_APPLY} <ArrowRight size={18} />
               </Link>
               <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white border border-white/20 hover:bg-white hover:text-black transition duration-300">
                   {UI_TEXT.ABOUT.CTA.BTN_CONTACT}
               </Link>
            </div>
          </div>
        </GlassCard>
      </MotionWrapper>
    </div>
  );
}