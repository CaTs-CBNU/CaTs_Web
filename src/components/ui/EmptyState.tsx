"use client";

import { ReactNode } from "react";
import MotionWrapper from "@/components/MotionWrapper";

interface EmptyContent {
  message: string;
  actionText?: string;
}

interface EmptyStateProps {
  icon?: ReactNode;
  content: EmptyContent;
  onAction?: () => void;
}

export default function EmptyState({ icon, content, onAction }: EmptyStateProps) {
  return (
    <MotionWrapper 
      className="col-span-full py-20 text-center text-zinc-500 flex flex-col items-center justify-center"
      scale={0.95}
    >
      <div className="inline-block p-4 rounded-full bg-white/5 mb-4 opacity-50">
        {icon}
      </div>
      <p className="mb-2 text-lg">{content.message}</p>
      
      {content.actionText && onAction && (
        <button 
          onClick={onAction} 
          className="mt-2 text-sm text-blue-400 hover:underline font-bold"
        >
          {content.actionText}
        </button>
      )}
    </MotionWrapper>
  );
}