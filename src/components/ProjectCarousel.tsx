"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/types/db";

interface ProjectCarouselProps {
  projects: Project[];
}

export default function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const router = useRouter();
  const ongoingProjects = projects.filter((p) => p.status === "ongoing");

  const items = ongoingProjects.length > 0 && ongoingProjects.length < 5 
    ? [...ongoingProjects, ...ongoingProjects, ...ongoingProjects] 
    : ongoingProjects;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; 

    const interval = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex, isHovered]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // ✅ [수정] 클릭 시 ID를 쿼리 파라미터로 전달
  const handleCardClick = (id: string) => {
    router.push(`/projects?id=${id}`);
  };

  const getCardStyle = (index: number) => {
    const total = items.length;
    if (total === 0) return {};
    let offset = (index - activeIndex + total) % total;
    
    if (offset > total / 2) {
      offset -= total;
    }

    if (offset === 0) {
      return { zIndex: 20, x: "0%", scale: 1, opacity: 1, filter: "brightness(1)", display: "block", pointerEvents: "auto" };
    } else if (offset === 1) {
      return { zIndex: 10, x: "60%", scale: 0.85, opacity: 0.6, filter: "brightness(0.5)", display: "block", pointerEvents: "none" };
    } else if (offset === -1) {
      return { zIndex: 10, x: "-60%", scale: 0.85, opacity: 0.6, filter: "brightness(0.5)", display: "block", pointerEvents: "none" };
    } else if (offset === 2) {
      return { zIndex: 5, x: "110%", scale: 0.7, opacity: 0.3, filter: "brightness(0.3)", display: "block", pointerEvents: "none" };
    } else if (offset === -2) {
      return { zIndex: 5, x: "-110%", scale: 0.7, opacity: 0.3, filter: "brightness(0.3)", display: "block", pointerEvents: "none" };
    } else {
      return { zIndex: 0, x: offset > 0 ? "200%" : "-200%", scale: 0.5, opacity: 0, display: "none", pointerEvents: "none" };
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 min-h-[500px] flex items-center justify-center">
        진행 중인 프로젝트가 없습니다.
      </div>
    );
  }

  return (
    <div 
      className="relative z-0 w-full max-w-5xl mx-auto py-20 flex flex-col items-center justify-center overflow-hidden min-h-[500px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-3xl font-bold mb-10 text-center text-white relative z-10">
        🚀 Ongoing Projects
      </h2>

      <div className="relative w-full h-[450px] flex items-center justify-center perspective-1000">
        {items.map((project, idx) => {
          const style = getCardStyle(idx);
          
          return (
            <motion.div
              key={`${project.id}-${idx}`}
              // ✅ [수정] ID 전달
              onClick={style.zIndex === 20 ? () => handleCardClick(project.id) : undefined} 
              className={`absolute w-[280px] md:w-[320px] h-[420px] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl flex flex-col
                  ${style.zIndex === 20 ? 'cursor-pointer hover:border-white/30 transition-colors' : ''}`}
              initial={false} 
              animate={{
                zIndex: style.zIndex as number,
                x: style.x as string,
                scale: style.scale as number,
                opacity: style.opacity as number,
                filter: style.filter as string,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                display: style.display as string,
                transformOrigin: "center bottom",
              }}
            >
              <div className="relative h-3/5 w-full shrink-0">
                <Image
                  src={project.image_url || "/cats.png"}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold text-black bg-white/90 px-2 py-1 rounded-full shadow-lg">
                    {project.tags?.[0] || "Project"}
                  </span>
                </div>
              </div>

              <div className="h-2/5 bg-zinc-900 p-5 flex flex-col border-t border-white/5 relative z-20">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-xl font-bold text-white line-clamp-1">
                      {project.title}
                    </h3>
                    <span className="text-[10px] text-zinc-500 mb-1 whitespace-nowrap ml-2">
                       {project.start_date ? project.start_date.split('-')[0] : ''}
                       {project.end_date ? ` ~ ${project.end_date.split('-')[0]}` : ' ~ ing'}
                    </span>
                </div>
                
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-normal break-words line-clamp-4">
                      {project.description}
                    </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-8 z-50">
        <button
          onClick={handlePrev}
          className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:scale-110 transition text-white backdrop-blur-md"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNext}
          className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 hover:scale-110 transition text-white backdrop-blur-md"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex gap-2 mt-6">
        {items.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? "w-8 bg-white" : "w-1.5 bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}