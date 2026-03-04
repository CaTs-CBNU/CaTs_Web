"use client";
import MotionWrapper from "@/components/MotionWrapper";

// 텍스트 데이터 타입 정의 (줄바꿈 처리를 위해)
interface HeaderContent {
  title: string;
  desc: string;
}

interface PageHeaderProps {
  content: HeaderContent; // 통째로 객체를 받음
}

export default function PageHeader({ content }: PageHeaderProps) {
  return (
    <MotionWrapper className="text-center mb-16 relative flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy/30 blur-[100px] rounded-full -z-10 pointer-events-none" />
      
      <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white">
        {content.title}
      </h1>
      
      {/* \n을 <br/>로 치환하여 렌더링 */}
      <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
        {content.desc}
      </p>
    </MotionWrapper>
  );
}