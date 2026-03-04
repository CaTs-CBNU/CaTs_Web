"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Plus, Trophy, ScrollText, Lightbulb, Search, Check, X, Pencil, ExternalLink } from "lucide-react";
import { Performance, LinkItem } from "@/types/db"; // DB 타입 사용

// 로컬 타입 정의 (DB 타입 확장)
type ProfileStub = {
  id: string;
  full_name: string;
  student_id: string;
};

export default function AdminPerformancePage() {
  const supabase = createClient();
  
  const [items, setItems] = useState<Performance[]>([]);
  const [allMembers, setAllMembers] = useState<ProfileStub[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Form States ---
  const [category, setCategory] = useState("award");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [awardGrade, setAwardGrade] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [paperType, setPaperType] = useState("SCIE");
  
  // ✅ [추가] 링크 리스트 상태
  const [links, setLinks] = useState<LinkItem[]>([]);
  
  const [selectedMembers, setSelectedMembers] = useState<ProfileStub[]>([]);

  const fetchData = async () => {
    const { data: perfData } = await supabase
      .from("performances")
      .select(`
        *,
        members:performance_members (
          user_id,
          profiles ( id, full_name, student_id )
        )
      `)
      .order("date", { ascending: false });

    if (perfData) setItems(perfData as unknown as Performance[]);

    const { data: memberData } = await supabase
      .from("profiles")
      .select("id, full_name, student_id")
      .order("full_name");
      
    if (memberData) setAllMembers(memberData);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setCategory("award"); setTitle(""); setDate(""); setAwardGrade(""); setOrganizer(""); setPaperType("SCIE");
    setLinks([]); // 링크 초기화
    setSelectedMembers([]);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: Performance) => {
    setEditingId(item.id);
    
    setCategory(item.category);
    setTitle(item.title);
    setDate(item.date);
    setAwardGrade(item.award_grade || "");
    setOrganizer(item.organizer || "");
    setPaperType(item.paper_type || "SCIE");
    
    // ✅ 링크 복원
    setLinks(item.links || []);

    if (item.members) {
      const restoredMembers = item.members.map(pm => pm.profiles);
      setSelectedMembers(restoredMembers);
    } else {
      setSelectedMembers([]);
    }

    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenCreateForm = () => {
    if (editingId) {
        resetForm();
        setTimeout(() => setIsFormOpen(true), 0);
    } else {
        setIsFormOpen(!isFormOpen);
    }
  };

  // --- Dynamic Link Handlers ---
  const addLink = () => {
      if (links.length >= 5) return alert("링크는 최대 5개까지만 추가할 수 있습니다.");
      setLinks([...links, { title: "", url: "" }]);
  };
  const removeLink = (idx: number) => {
      setLinks(links.filter((_, i) => i !== idx));
  };
  const updateLink = (idx: number, field: "title" | "url", value: string) => {
      const newLinks = [...links];
      newLinks[idx][field] = value;
      setLinks(newLinks);
  };

  const toggleMember = (member: ProfileStub) => {
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 유효한 링크만 필터링
      const validLinks = links.filter(l => l.title && l.url);

      const formData = {
          category,
          title,
          date,
          award_grade: awardGrade || null,
          organizer: organizer || null,
          paper_type: paperType || null,
          links: validLinks // ✅ JSONB 배열로 저장
      };

      let performanceId = editingId;

      if (editingId) {
        const { error: updateError } = await supabase
          .from("performances")
          .update(formData)
          .eq("id", editingId);

        if (updateError) throw updateError;
      } else {
        const { data: insertedPerf, error: perfError } = await supabase
          .from("performances")
          .insert([formData])
          .select()
          .single();

        if (perfError) throw perfError;
        performanceId = insertedPerf.id;
      }

      if (performanceId) {
        if (editingId) {
            await supabase.from("performance_members").delete().eq("performance_id", performanceId);
        }

        if (selectedMembers.length > 0) {
          const memberLinks = selectedMembers.map(member => ({
            performance_id: performanceId,
            user_id: member.id
          }));

          const { error: linkError } = await supabase
            .from("performance_members")
            .insert(memberLinks);

          if (linkError) throw linkError;
        }
      }

      alert(editingId ? "수정되었습니다." : "저장되었습니다.");
      resetForm();
      fetchData();

    } catch (error: any) {
      alert("오류: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("performances").delete().eq("id", id);
    fetchData();
  };

  const filteredMembers = allMembers.filter(m => 
    m.full_name.includes(memberSearchTerm) || m.student_id.includes(memberSearchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">실적 및 성과 관리</h1>
        <button 
            onClick={handleOpenCreateForm} 
            className="bg-navy hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg font-bold flex gap-2 transition"
        >
            {isFormOpen && !editingId ? <X size={18}/> : <Plus size={18} />} 
            {isFormOpen && !editingId ? "닫기" : "실적 추가"}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-xl font-bold">
                {editingId ? "실적 수정" : "새 실적 등록"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-zinc-400 hover:text-white underline">
                취소하고 닫기
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">카테고리</label>
              <select className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="award">수상 (Award)</option>
                <option value="paper">논문 (Paper)</option>
                <option value="patent">특허 (Patent)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">날짜</label>
              <input type="date" max = "9999-12-31" required className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">제목</label>
              <input type="text" required className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            
            {category === 'award' && (
                <>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">상훈 (예: 대상)</label>
                        <input type="text" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                            value={awardGrade} onChange={(e) => setAwardGrade(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">주최 기관</label>
                        <input type="text" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                            value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
                    </div>
                </>
            )}

            {category === 'paper' && (
                 <>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">구분</label>
                        <select className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                            value={paperType} onChange={(e) => setPaperType(e.target.value)}>
                            <option value="SCIE">SCIE</option>
                            <option value="KCI">KCI</option>
                            <option value="Conference">Conference</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">학술지/학회명</label>
                        <input type="text" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                            value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
                    </div>
                </>
            )}
            
            {/* ✅ 링크 관리 UI (최대 5개) */}
            <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2 flex justify-between">
                    <span>관련 링크 <span className="text-zinc-500 text-xs">({links.length}/5)</span></span>
                    <button 
                        type="button" 
                        onClick={addLink} 
                        disabled={links.length >= 5}
                        className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${links.length >= 5 ? 'bg-white/5 text-zinc-600 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                        <Plus size={12}/> 추가
                    </button>
                </label>
                <div className="space-y-2">
                    {links.map((link, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input type="text" placeholder="제목 (ex: 논문 링크)" className="w-1/3 bg-black border border-white/20 p-2 rounded-lg text-white text-sm"
                                value={link.title} onChange={e => updateLink(idx, "title", e.target.value)} />
                            <input type="url" placeholder="URL (https://...)" className="flex-1 bg-black border border-white/20 p-2 rounded-lg text-white text-sm"
                                value={link.url} onChange={e => updateLink(idx, "url", e.target.value)} />
                            <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    {links.length === 0 && <div className="text-xs text-zinc-500">등록된 링크가 없습니다.</div>}
                </div>
            </div>
          </div>

          {/* 멤버 선택 UI */}
          <div className="border-t border-white/10 pt-4">
             <div className="flex justify-between items-end mb-2">
                <label className="block text-sm text-zinc-400 font-bold">참여 멤버 선택</label>
                <div className="text-xs text-zinc-500">{selectedMembers.length}명 선택됨</div>
             </div>

             {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    {selectedMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-2 bg-navy px-3 py-1.5 rounded-full text-sm text-white shadow-sm animate-in fade-in zoom-in duration-200">
                            <span>{m.full_name}</span>
                            <button type="button" onClick={() => toggleMember(m)} className="hover:text-red-300"><X size={14}/></button>
                        </div>
                    ))}
                </div>
             )}
             
             <div className="bg-black border border-white/20 rounded-xl overflow-hidden">
                <div className="p-2 border-b border-white/10 bg-zinc-900/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input type="text" placeholder="멤버 검색..." className="w-full pl-9 pr-4 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
                            value={memberSearchTerm} onChange={(e) => setMemberSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="h-60 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredMembers.map(m => {
                        const isSelected = selectedMembers.some(sel => sel.id === m.id);
                        return (
                            <button key={m.id} type="button" onClick={() => toggleMember(m)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition text-left ${isSelected ? 'bg-navy/20 border border-navy text-white' : 'bg-white/5 border border-transparent text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
                                <div>
                                    <div className={`font-bold ${isSelected ? 'text-navy-300' : ''}`}>{m.full_name}</div>
                                    <div className="text-[10px] opacity-70">{m.student_id}</div>
                                </div>
                                {isSelected && <Check size={16} className="text-navy" />}
                            </button>
                        );
                    })}
                    {filteredMembers.length === 0 && <div className="col-span-full text-center py-8 text-zinc-500 text-sm">검색 결과가 없습니다.</div>}
                </div>
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

      {/* 리스트 표시 */}
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className={`bg-white/5 border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between transition gap-4 ${editingId === item.id ? 'border-navy bg-navy/10' : 'border-white/10 hover:bg-white/10'}`}>
             <div className="flex items-start md:items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 
                   ${item.category === 'award' ? 'bg-yellow-500/20 text-yellow-500' : item.category === 'paper' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                   {item.category === 'award' && <Trophy size={20}/>}
                   {item.category === 'paper' && <ScrollText size={20}/>}
                   {item.category === 'patent' && <Lightbulb size={20}/>}
                </div>
                <div>
                   <h3 className="font-bold text-lg">{item.title}</h3>
                   <div className="text-sm text-zinc-400 flex flex-wrap gap-x-2 gap-y-1 mb-1">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.organizer || item.award_grade || item.paper_type}</span>
                   </div>
                   {/* 멤버 표시 */}
                   {item.members && item.members.length > 0 && (
                       <div className="flex flex-wrap gap-1 mt-2">
                           {item.members.map((pm, idx) => (
                               <span key={idx} className="text-xs bg-white/10 px-2 py-0.5 rounded text-zinc-300">
                                   {pm.profiles?.full_name}
                               </span>
                           ))}
                       </div>
                   )}
                   {/* ✅ 링크 표시 */}
                   {item.links && item.links.length > 0 && (
                       <div className="flex flex-wrap gap-2 mt-2">
                           {item.links.map((l, i) => (
                               <a key={i} href={l.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-white flex items-center gap-1">
                                   <ExternalLink size={10}/> {l.title}
                               </a>
                           ))}
                       </div>
                   )}
                </div>
             </div>
             
             <div className="flex items-center gap-2 self-end md:self-auto">
                 <button onClick={() => handleEdit(item)} className="p-2 bg-white/5 text-zinc-400 hover:bg-white/20 hover:text-white rounded-lg transition" title="수정">
                     <Pencil size={18} />
                 </button>
                 <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition" title="삭제">
                    <Trash2 size={18} />
                 </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}