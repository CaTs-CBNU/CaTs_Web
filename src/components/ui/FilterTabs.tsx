"use client";

import { motion } from "framer-motion";

// 제네릭 타입 T를 사용하여 어떤 문자열 타입(예: 'ongoing' | 'finished')이든 받을 수 있게 함
interface TabItem<T extends string> {
  label: string;
  value: T;
}

interface FilterTabsProps<T extends string> {
  items: TabItem<T>[];
  activeValue: T;
  onSelect: (value: T) => void;
  layoutId?: string; // 여러 개의 탭이 한 페이지에 있을 경우 구분용 (기본값: "activeTab")
}

export default function FilterTabs<T extends string>({ 
  items, 
  activeValue, 
  onSelect,
  layoutId = "activeTab" 
}: FilterTabsProps<T>) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 p-1">
      {items.map((item) => {
        const isActive = activeValue === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onSelect(item.value)}
            className={`relative px-6 py-2 rounded-xl text-sm font-bold transition-colors duration-300 z-0 ${
              isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-navy rounded-xl shadow-lg shadow-navy/30 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}