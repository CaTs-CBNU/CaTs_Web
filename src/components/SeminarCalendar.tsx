"use client";

import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin 
} from "lucide-react";
import { Schedule } from "@/types/db"; 
import EmptyState from "./ui/EmptyState";
import { UI_TEXT } from "@/constants/uiText";

// ✅ 타입별 색상 스타일 헬퍼 함수
const getTypeStyles = (type: string) => {
  const t = type.toLowerCase();
  if (t === 'seminar') return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
  if (t === 'event') return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
  if (t === 'deadline') return 'bg-red-500/10 border-red-500/30 text-red-400';
  if (t === 'meeting') return 'bg-green-500/10 border-green-500/30 text-green-400';
  return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'; // 기본값
};

interface SeminarCalendarProps {
  schedules: Schedule[];
}

export default function SeminarCalendar({ schedules }: SeminarCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<"calendar" | "picker">("calendar");
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  // --- 날짜 계산 ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => null);

  // --- 데이터 필터링 ---
  const monthEvents = useMemo(() => {
    return schedules.filter(s => { 
      const d = new Date(s.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [year, month, schedules]);

  const displaySchedules = useMemo(() => {
    if (selectedDateStr) {
      return schedules.filter(s => s.date === selectedDateStr);
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      return schedules
        .filter(s => s.date >= todayStr)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
    }
  }, [selectedDateStr, schedules]);

  // --- 핸들러 함수들 ---
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const clickedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (selectedDateStr === clickedDateStr) setSelectedDateStr(null);
    else setSelectedDateStr(clickedDateStr);
  };

  const togglePicker = () => {
    if (viewMode === "calendar") {
      setPickerYear(year); 
      setViewMode("picker");
    } else {
      setViewMode("calendar");
    }
  };

  const prevYear = () => setPickerYear(pickerYear - 1);
  const nextYear = () => setPickerYear(pickerYear + 1);

  const handleMonthSelect = (selectedMonthIndex: number) => {
    setCurrentDate(new Date(pickerYear, selectedMonthIndex, 1));
    setViewMode("calendar"); 
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md h-full flex flex-col">
      
      {/* --- 상단 헤더 --- */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="text-blue-500" /> 
          Schedule
        </h2>
        
        <div className="flex items-center gap-2 bg-black/20 rounded-full px-2 py-1.5 border border-white/5">
          <button 
            onClick={viewMode === "picker" ? prevYear : prevMonth} 
            className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={togglePicker}
            className="text-lg font-mono text-zinc-200 min-w-[140px] text-center hover:text-blue-400 hover:bg-white/5 rounded px-2 py-0.5 transition"
          >
            {viewMode === "picker" 
              ? `${pickerYear}` 
              : currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }) 
            }
          </button>

          <button 
            onClick={viewMode === "picker" ? nextYear : nextMonth} 
            className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* --- [왼쪽] 뷰 영역 (Calendar or Picker) --- */}
        <div className="relative">
          {viewMode === "calendar" ? (
            <>
               <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-zinc-500">
                 {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                   <div key={d} className={d === 'SUN' ? 'text-red-900/70' : ''}>{d}</div>
                 ))}
               </div>
               
               <div className="grid grid-cols-7 gap-2 text-center">
                 {padding.map((_, i) => <div key={`pad-${i}`} />)}
                 
                 {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasEvent = monthEvents.some(s => s.date === dateStr);
                    const isSelected = selectedDateStr === dateStr;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    return (
                     <button 
                       key={day} 
                       onClick={() => handleDateClick(day)}
                       className={`
                           aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition relative
                           ${isSelected 
                             ? "bg-navy text-white shadow-lg shadow-blue-500/30 scale-105 z-10" 
                             : "text-zinc-400 hover:bg-white/5 hover:text-white"}
                           ${isToday && !isSelected ? "border border-blue-500/50 text-blue-400" : ""}
                        `}
                     >
                        {day}
                        {hasEvent && (
                          <div className={`w-1 h-1 rounded-full mt-1 bg-white`} />
                        )}
                     </button>
                    )
                 })}
               </div>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-3 h-full content-center">
              {Array.from({ length: 12 }, (_, i) => i).map((mIndex) => {
                const isCurrentMonth = mIndex === month && pickerYear === year;
                const monthName = new Date(2000, mIndex, 1).toLocaleString('en-US', { month: 'short' });

                return (
                  <button
                    key={mIndex}
                    onClick={() => handleMonthSelect(mIndex)}
                    className={`
                      py-4 rounded-xl text-sm font-bold transition border border-transparent
                      ${isCurrentMonth 
                        ? "bg-navy text-white border-blue-500" 
                        : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/10"}
                    `}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* --- [오른쪽] 이벤트 리스트 --- */}
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                    {selectedDateStr ? "Selected Date" : "Upcoming Schedules"}
                </h3>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {displaySchedules.length > 0 ? (
                    displaySchedules.map(schedule => (
                        <div 
                            key={schedule.id} 
                            className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition group"
                        >
                            {/* 날짜 박스 (연도 추가됨) */}
                            <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-14 bg-black/20 rounded-xl border border-white/10 group-hover:border-blue-500/30 transition py-1">
                                {/* ✅ 연도 표시 */}
                                <span className="text-[9px] font-bold text-zinc-600 leading-none mb-0.5">
                                    {schedule.date.split('-')[0]}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase leading-none">
                                    {new Date(schedule.date).toLocaleString('en-US', { month: 'short' })}
                                </span>
                                <span className="text-lg font-bold text-white group-hover:text-blue-400 transition leading-tight">
                                    {schedule.date.split('-')[2]}
                                </span>
                            </div>

                            <div className="min-w-0">
                                {/* ✅ 타입(Type) 뱃지와 제목 */}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getTypeStyles(schedule.type)}`}>
                                        {schedule.type}
                                    </span>
                                    <div className="font-bold text-white text-lg leading-tight group-hover:text-blue-200 transition truncate">
                                        {schedule.title}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} className="text-zinc-500"/> {schedule.time.substring(0, 5)}
                                    </span>
                                    {schedule.place && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} className="text-zinc-500"/> {schedule.place}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState
                      icon={ <CalendarIcon/>}
                      content={UI_TEXT.EMPTY.NO_DATA_SCHEDULE}
                      onAction={() => setSelectedDateStr(null)}
                    />
          
                )}
            </div>
        </div>
      </div>
    </div>
  );
}