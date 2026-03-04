"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Clock, MapPin, Edit2, X } from "lucide-react";

// DB Enum 타입에 맞춰 수정하세요
const scheduleTypes = [
  { value: "seminar", label: "세미나" },
  { value: "event", label: "행사/이벤트" },
  { value: "deadline", label: "마감" },
  { value: "meeting", label: "미팅" },
];

interface ScheduleItem {
  id: number;
  title: string;
  date: string;
  time: string;
  place: string;
  type: string;
}

export default function AdminSchedulePage() {
  const supabase = createClient();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // 수정 모드 상태 (null이면 생성 모드, ID가 있으면 수정 모드)
  const [editingId, setEditingId] = useState<number | null>(null);

  // 입력 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    place: "",
    type: "seminar",
  });

  // 1. 일정 목록 불러오기
  const fetchSchedules = async () => {
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .order("date", { ascending: false }); // 최신 날짜순
    
    if (data) setSchedules(data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 폼 초기화 함수
  const resetForm = () => {
    setFormData({ title: "", date: "", time: "", place: "", type: "seminar" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  // 2. 저장 (추가 또는 수정) 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      alert("제목, 날짜, 시간은 필수입니다.");
      return;
    }

    let error;

    if (editingId) {
      // [수정 모드] Update
      const { error: updateError } = await supabase
        .from("schedules")
        .update(formData)
        .eq("id", editingId);
      error = updateError;
    } else {
      // [생성 모드] Insert
      const { error: insertError } = await supabase
        .from("schedules")
        .insert([formData]);
      error = insertError;
    }

    if (!error) {
      alert(editingId ? "일정이 수정되었습니다." : "일정이 추가되었습니다.");
      resetForm();
      fetchSchedules();
    } else {
      alert("오류 발생: " + error.message);
    }
  };

  // 3. 수정 버튼 클릭 핸들러
  const handleEditClick = (item: ScheduleItem) => {
    setFormData({
      title: item.title,
      date: item.date,
      time: item.time, // HH:mm:ss 형식 그대로 사용 (input type="time"이 알아서 처리하거나 필요시 slice)
      place: item.place,
      type: item.type,
    });
    setEditingId(item.id);
    setIsFormOpen(true);
    // 화면 상단으로 스크롤 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. 일정 삭제
  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (!error) fetchSchedules();
    else alert(error.message);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">일정(Schedule) 관리</h1>
        <button 
          onClick={() => {
            resetForm(); // 폼 초기화 후 열기
            setIsFormOpen(!isFormOpen);
          }} 
          className="bg-navy hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg font-bold flex gap-2 transition"
        >
          {isFormOpen ? <X size={18}/> : <Plus size={18} />} 
          {isFormOpen ? "닫기" : "일정 추가"}
        </button>
      </div>

      {/* 입력 폼 */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? "일정 수정" : "새 일정 등록"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 제목 */}
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1 font-bold">제목</label>
              <input 
                type="text" required 
                className="w-full bg-black border border-white/20 p-3 rounded-lg text-white"
                placeholder="예: 1주차 정기 세션 (OT)"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            {/* 분류 (Type) */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1 font-bold">분류 (Type)</label>
              <select 
                className="w-full bg-black border border-white/20 p-3 rounded-lg text-white"
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {scheduleTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* 장소 */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1 font-bold">장소</label>
              <input 
                type="text" 
                className="w-full bg-black border border-white/20 p-3 rounded-lg text-white"
                placeholder="예: E9-304 / Zoom"
                value={formData.place} 
                onChange={(e) => setFormData({...formData, place: e.target.value})} 
              />
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1 font-bold">날짜</label>
              <input 
                max = "9999-12-31"
                type="date" required
                className="w-full bg-black border border-white/20 p-3 rounded-lg text-white"
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
              />
            </div>

            {/* 시간 */}
            <div>
              <label className="block text-sm text-zinc-400 mb-1 font-bold">시간</label>
              <input 
                type="time" required
                className="w-full bg-black border border-white/20 p-3 rounded-lg text-white"
                value={formData.time} 
                onChange={(e) => setFormData({...formData, time: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-2">
             <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl text-zinc-400 hover:bg-white/10">
                취소
             </button>
             <button className="bg-navy px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-white hover:text-black transition">
                {editingId ? "수정하기" : "저장하기"}
             </button>
          </div>
        </form>
      )}

      {/* 리스트 */}
      <div className="grid gap-4">
        {schedules.map((item) => (
          <div key={item.id} className={`bg-white/5 border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition
            ${editingId === item.id ? 'border-navy bg-navy/10' : 'border-white/10 hover:bg-white/10'}`}>
             
             {/* 왼쪽: 정보 */}
             <div className="flex gap-5 items-start">
                <div className="bg-black border border-white/10 rounded-xl p-3 text-center min-w-[80px] shrink-0">
                    <div className="text-zinc-500 text-xs uppercase font-bold">{item.date.split('-')[0]}</div>
                    <div className="text-white text-xl font-black">{item.date.split('-')[1]}.{item.date.split('-')[2]}</div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border
                            ${item.type === 'seminar' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                              item.type === 'event' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 
                              item.type === 'deadline' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                              item.type === 'meeting' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                              'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'}`}>
                            {item.type}
                        </span>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mt-2">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {item.time.substring(0, 5)}
                        </div>
                        {item.place && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} />
                                {item.place}
                            </div>
                        )}
                    </div>
                </div>
             </div>

             {/* 오른쪽: 수정/삭제 버튼 */}
             <div className="flex gap-2 self-end md:self-center">
                 <button 
                    onClick={() => handleEditClick(item)} 
                    className="p-3 bg-white/5 text-zinc-300 hover:bg-white/20 rounded-xl transition"
                    title="수정"
                 >
                    <Edit2 size={18} />
                 </button>
                 <button 
                    onClick={() => handleDelete(item.id)} 
                    className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition"
                    title="삭제"
                 >
                    <Trash2 size={18} />
                 </button>
             </div>
          </div>
        ))}

        {schedules.length === 0 && (
            <div className="text-center py-20 text-zinc-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                등록된 일정이 없습니다.
            </div>
        )}
      </div>
    </div>
  );
}