"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number; // 지연 시간 (초)
  direction?: "up" | "down" | "left" | "right" | "none"; // 등장 방향
  scale?: number; // 시작 크기
  duration?: number; // 애니메이션 지속 시간
  layoutId?: string; // ✅ [추가] Shared Layout Animation을 위한 ID
}

export default function MotionWrapper({
  children,
  className,
  delay = 0,
  direction = "up", 
  scale = 1,        
  duration = 0.5,
  layoutId, // ✅ [추가] props로 받음
}: MotionWrapperProps) {
  
  // 방향에 따른 초기 위치 설정
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { x: 0, y: 30 };
      case "down": return { x: 0, y: -30 };
      case "left": return { x: 30, y: 0 };
      case "right": return { x: -30, y: 0 };
      case "none": return { x: 0, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      layoutId={layoutId} 
      initial={{ 
        opacity: 0, 
        x: initialPos.x, 
        y: initialPos.y, 
        scale: scale 
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1 
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: duration, 
        ease: "easeOut", 
        delay: delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}