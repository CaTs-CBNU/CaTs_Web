"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Plus, Calendar, Tag, Pencil, X } from "lucide-react"; // Pencil, X 아이콘 추가

type HistoryItem = {
  id: number;
  date: string;
  title: string;
  description?: string;
  tags?: string[];
};

export default function AdminHistoryPage() {
  const supabase = createClient();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({ date: "", title: "", description: "", tagsStr: "" });
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // ✨ 추가: 수정 모드인지 확인하기 위한 state (null이면 생성 모드)
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchHistories = async () => {
    const { data } = await supabase.from("histories").select("*").order("date", { ascending: false });
    if (data) setHistories(data);
  };

  useEffect(() => { fetchHistories(); }, []);

  // ✨ 추가: 폼 초기화 및 닫기 함수
  const resetForm = () => {
    setFormData({ date: "", title: "", description: "", tagsStr: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  // ✨ 추가: 수정 버튼 클릭 핸들러
  const handleEdit = (item: HistoryItem) => {
    setEditingId(item.id);
    setFormData({
      date: item.date,
      title: item.title,
      description: item.description || "",
      tagsStr: item.tags ? item.tags.join(", ") : "" // 배열을 문자열로 변환하여 input에 표시
    });
    setIsFormOpen(true);
    // 화면 상단으로 스크롤 이동 (모바일 배려)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✨ 추가: '연혁 추가' 버튼 클릭 핸들러 (수정 모드였다면 초기화)
  const handleOpenCreateForm = () => {
    if (editingId) {
      resetForm(); // 수정 중이었다면 초기화 후 열기
      setTimeout(() => setIsFormOpen(true), 0);
    } else {
      setIsFormOpen(!isFormOpen);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.title) return alert("필수 항목을 입력해주세요.");

    // 태그 문자열 -> 배열 변환
    const tagsArray = formData.tagsStr ? formData.tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    let error;

    // ✨ 수정: editingId 유무에 따라 Update / Insert 분기 처리
    if (editingId) {
      // 수정 (Update)
      const result = await supabase.from("histories").update({
        date: formData.date,
        title: formData.title,
        description: formData.description || null,
        tags: tagsArray
      }).eq("id", editingId);
      error = result.error;
    } else {
      // 생성 (Insert)
      const result = await supabase.from("histories").insert({
        date: formData.date,
        title: formData.title,
        description: formData.description || null,
        tags: tagsArray
      });
      error = result.error;
    }
    
    if (!error) {
      alert(editingId ? "연혁이 수정되었습니다." : "연혁이 추가되었습니다.");
      resetForm();
      fetchHistories();
    } else {
      alert("오류 발생: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("histories").delete().eq("id", id);
    fetchHistories();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">연혁 관리</h1>
        <button 
          onClick={handleOpenCreateForm} 
          className="bg-navy hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg font-bold flex gap-2 transition"
        >
          {isFormOpen && !editingId ? <X size={18}/> : <Plus size={18} />} 
          {isFormOpen && !editingId ? "닫기" : "연혁 추가"}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? "연혁 수정하기" : "새 연혁 기록하기"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-zinc-400 hover:text-white underline">
                취소하고 닫기
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1 font-bold">날짜 <span className="text-red-500">*</span></label>
              <input type="date" max = "9999-12-31" required className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1 font-bold">제목 (이벤트명) <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="예: CaTs 창립, 해커톤 대상 수상" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">상세 설명 (Optional)</label>
              <input type="text" placeholder="간단한 설명을 입력하세요" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">태그 (Optional)</label>
              <input type="text" placeholder="콤마(,)로 구분 (예: 주요행사, 수상)" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                value={formData.tagsStr} onChange={(e) => setFormData({...formData, tagsStr: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end pt-4 gap-3">
             <button type="button" onClick={resetForm} className="px-4 py-2 text-zinc-400 hover:text-white transition">취소</button>
             <button className="bg-navy px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-white hover:text-black transition">
                {editingId ? "수정완료" : "저장하기"}
             </button>
          </div>
        </form>
      )}

      {/* 리스트 */}
      <div className="space-y-3">
        {histories.map((item) => (
          <div key={item.id} className={`flex items-center justify-between bg-white/5 border p-5 rounded-xl transition ${editingId === item.id ? 'border-navy bg-navy/10' : 'border-white/10 hover:bg-white/10'}`}>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center justify-center w-14 h-14 bg-black rounded-lg border border-white/10 shrink-0">
                <Calendar size={18} className="text-zinc-500 mb-1"/>
                <span className="text-[10px] font-bold text-zinc-300">{item.date.split('-')[0]}</span>
              </div>
              <div>
                <div className="text-xs text-zinc-400 mb-1 font-mono">{item.date}</div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                {item.description && <p className="text-zinc-500 text-sm mt-1">{item.description}</p>}
                {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                        {item.tags.map(t => (
                            <span key={t} className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400">
                                <Tag size={10}/> {t}
                            </span>
                        ))}
                    </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
                {/* ✨ 추가: 수정 버튼 */}
                <button onClick={() => handleEdit(item)} className="p-3 bg-white/5 text-zinc-400 hover:bg-white/20 hover:text-white rounded-lg transition" title="수정">
                    <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition" title="삭제">
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}