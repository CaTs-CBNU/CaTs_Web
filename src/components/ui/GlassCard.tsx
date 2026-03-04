"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean; // 호버 시 살짝 떠오르는 효과 여부
  onClick?: () => void;
}

export default function GlassCard({ 
  children, 
  className = "", 
  hoverEffect = false, 
  onClick 
}: GlassCardProps) {
  
  const baseStyle = "bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md overflow-hidden relative";
  const hoverStyle = hoverEffect 
    ? "transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 cursor-pointer" 
    : "";

  return (
    <div 
      className={`${baseStyle} ${hoverStyle} ${className}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
}