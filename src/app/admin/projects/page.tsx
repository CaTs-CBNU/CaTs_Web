"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, CheckCircle, XCircle, ImagePlus, X, Search, Check, Pencil, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { Project, Profile, LinkItem, ProjectRole } from "@/types/db";

// ✅ 선택된 멤버 타입 (ProjectRole 사용)
type SelectedMember = Profile & { projectRole: ProjectRole };

export default function AdminProjectsPage() {
  const supabase = createClient();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMembers, setAllMembers] = useState<Profile[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Form States ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ongoing" | "finished">("ongoing");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // ✅ 동적 리스트 상태
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");

  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);

  const fetchData = async () => {
    const { data: projData } = await supabase
      .from("projects")
      .select(`
        *,
        members:project_members (
          user_id,
          role,
          profiles ( * )
        )
      `)
      .order("created_at", { ascending: false });
    
    if (projData) setProjects(projData as unknown as Project[]);

    const { data: memberData } = await supabase.from("profiles").select("*").order("full_name");
    if (memberData) setAllMembers(memberData);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setStatus("ongoing"); setStartDate(""); setEndDate("");
    setLinks([]); setTags([]); setTagInput("");
    setImageFile(null); setPreviewUrl(""); setOriginalImageUrl("");
    setSelectedMembers([]);
    setEditingId(null); setIsFormOpen(false); setIsSubmitting(false);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    
    setTitle(project.title);
    setDescription(project.description);
    setStatus(project.status);
    setStartDate(project.start_date || "");
    setEndDate(project.end_date || "");
    
    setLinks(project.links || []);
    setTags(project.tags || []);

    if (project.image_url) {
        setPreviewUrl(project.image_url);
        setOriginalImageUrl(project.image_url);
    } else {
        setPreviewUrl("");
        setOriginalImageUrl("");
    }
    setImageFile(null);

    if (project.members) {
      const restoredMembers: SelectedMember[] = project.members.map(pm => ({
        ...pm.profiles,
        projectRole: (pm.role === "leader" || pm.role === "member") ? pm.role : "member" 
      }));
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

  // --- Dynamic Input Handlers (제한 로직 추가됨) ---
  const addLink = () => {
      // ✅ 링크 최대 5개 제한
      if (links.length >= 5) {
          return alert("링크는 최대 5개까지만 추가할 수 있습니다.");
      }
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

  const addTag = () => {
      // ✅ 태그 최대 7개 제한
      if (tags.length >= 7) {
          return alert("태그는 최대 7개까지만 추가할 수 있습니다.");
      }
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
          setTags([...tags, tagInput.trim()]);
          setTagInput("");
      }
  };
  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const deleteImageFromStorage = async (url: string) => {
    try {
        const path = url.split('/images/')[1];
        if (path) {
            await supabase.storage.from('images').remove([path]);
        }
    } catch (err) { console.error(err); }
  };

  const toggleMember = (member: Profile) => {
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, { ...member, projectRole: "member" }]);
    }
  };

  const updateMemberRole = (id: string, newRole: ProjectRole) => {
    setSelectedMembers(prev => prev.map(m => m.id === id ? { ...m, projectRole: newRole } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return alert("필수 항목을 입력해주세요.");
    
    setIsSubmitting(true);

    try {
      let finalImageUrl = previewUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `projects/${Date.now()}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      } else if (!previewUrl) {
        finalImageUrl = ""; 
      }

      const validLinks = links.filter(l => l.title && l.url);

      const payload = {
          title, description, status,
          start_date: startDate || null,
          end_date: endDate || null,
          image_url: finalImageUrl || null,
          tags: tags,
          links: validLinks
      };

      let projectId = editingId;

      if (editingId) {
        const { error: updateError } = await supabase.from("projects").update(payload).eq("id", editingId);
        if (updateError) throw updateError;

        if (originalImageUrl && originalImageUrl !== finalImageUrl) {
            await deleteImageFromStorage(originalImageUrl);
        }
      } else {
        const { data: insertedProj, error: insertError } = await supabase.from("projects").insert(payload).select().single();
        if (insertError) throw insertError;
        projectId = insertedProj.id;
      }

      if (projectId) {
        if (editingId) {
            await supabase.from("project_members").delete().eq("project_id", projectId);
        }

        if (selectedMembers.length > 0) {
          const memberLinks = selectedMembers.map(m => ({
            project_id: projectId,
            user_id: m.id,
            role: m.projectRole
          }));
          const { error: linkError } = await supabase.from("project_members").insert(memberLinks);
          if (linkError) throw linkError;
        }
      }

      alert(editingId ? "프로젝트가 수정되었습니다." : "프로젝트가 추가되었습니다.");
      resetForm();
      fetchData();

    } catch (error: any) {
      alert("오류: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ongoing" ? "finished" : "ongoing";
    await supabase.from("projects").update({ status: newStatus }).eq("id", id);
    fetchData();
  };

  const handleDelete = async (project: Project) => {
    if (!confirm("삭제하시겠습니까? 복구할 수 없습니다.")) return;
    if (project.image_url) await deleteImageFromStorage(project.image_url);
    await supabase.from("projects").delete().eq("id", project.id);
    fetchData();
  };

  const filteredMembers = allMembers.filter(m => 
    m.full_name.includes(memberSearchTerm) || m.student_id.includes(memberSearchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">프로젝트 관리</h1>
        <button 
          onClick={handleOpenCreateForm} 
          className="bg-navy hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg font-bold flex gap-2 transition"
        >
          {isFormOpen && !editingId ? <X size={18}/> : <Plus size={18} />} 
          {isFormOpen && !editingId ? "닫기" : "프로젝트 추가"}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h2 className="text-xl font-bold">
              {editingId ? "프로젝트 수정" : "새 프로젝트 작성"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-zinc-400 hover:text-white underline">
                취소하고 닫기
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-1 font-bold">프로젝트 명 *</label>
                <input type="text" required className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-1 font-bold">설명 *</label>
                <textarea required rows={3} className="w-full bg-black border border-white/20 p-3 rounded-lg text-white resize-none focus:border-white transition outline-none"
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1 font-bold">상태</label>
                <select className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                  value={status} onChange={e => setStatus(e.target.value as any)}>
                  <option value="ongoing">진행 중</option>
                  <option value="finished">완료</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">시작일</label>
                    <input type="date" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                    value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">종료일</label>
                    <input type="date" className="w-full bg-black border border-white/20 p-3 rounded-lg text-white focus:border-white transition outline-none"
                    value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              {/* ✅ 링크 관리 UI (최대 5개 제한) */}
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2 flex justify-between">
                    <span>링크 <span className="text-zinc-500 font-normal text-xs">({links.length}/5)</span></span>
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
                            <input type="text" placeholder="제목 (ex: GitHub)" className="w-1/3 bg-black border border-white/20 p-2 rounded-lg text-white text-sm"
                                value={link.title} onChange={e => updateLink(idx, "title", e.target.value)} />
                            <input type="url" placeholder="URL (https://...)" className="flex-1 bg-black border border-white/20 p-2 rounded-lg text-white text-sm"
                                value={link.url} onChange={e => updateLink(idx, "url", e.target.value)} />
                            <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    {links.length === 0 && <div className="text-xs text-zinc-500">등록된 링크가 없습니다.</div>}
                </div>
              </div>

              {/* ✅ 태그 관리 UI (최대 7개 제한) */}
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-2">
                    태그 <span className="text-zinc-500 font-normal text-xs">({tags.length}/7)</span>
                </label>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        placeholder={tags.length >= 7 ? "최대 개수에 도달했습니다" : "태그 입력 (Enter)"} 
                        className="flex-1 bg-black border border-white/20 p-2 rounded-lg text-white focus:border-white outline-none disabled:opacity-50"
                        value={tagInput} 
                        onChange={e => setTagInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} 
                        disabled={tags.length >= 7}
                    />
                    <button 
                        type="button" 
                        onClick={addTag} 
                        disabled={tags.length >= 7}
                        className={`p-2 rounded-lg ${tags.length >= 7 ? 'bg-white/5 text-zinc-600' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                        <Plus size={20}/>
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <span key={tag} className="bg-navy/30 text-white px-2 py-1 rounded text-sm flex items-center gap-1 border border-navy/50">
                            {tag} <button type="button" onClick={() => removeTag(tag)}><X size={14}/></button>
                        </span>
                    ))}
                </div>
              </div>

              <div className="md:col-span-2">
                 <label className="block text-sm text-zinc-400 mb-2">대표 이미지</label>
                 <div className="flex gap-4 items-start">
                    <div className="relative w-40 h-28 bg-black border border-white/20 rounded-lg overflow-hidden flex items-center justify-center group">
                        {previewUrl ? (
                            <>
                              <Image src={previewUrl} alt="preview" fill className="object-cover" />
                              <button type="button" onClick={() => { setImageFile(null); setPreviewUrl(""); }} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white"><X size={14}/></button>
                            </>
                        ) : <ImagePlus className="text-zinc-600" />}
                    </div>
                    <div className="flex-1">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"/>
                    </div>
                 </div>
              </div>
          </div>

          <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-end mb-2">
                 <label className="block text-sm text-zinc-400 font-bold">참여 멤버 및 역할 설정</label>
                 <div className="text-xs text-zinc-500">{selectedMembers.length}명 선택됨</div>
              </div>

              {selectedMembers.length > 0 && (
                 <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                     {selectedMembers.map(m => (
                         <div key={m.id} className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5 animate-in slide-in-from-left-2">
                             <div className="flex-1">
                                 <span className="font-bold text-sm text-white">{m.full_name}</span>
                                 <span className="text-xs text-zinc-500 ml-2">{m.student_id}</span>
                             </div>
                             <select 
                                className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                value={m.projectRole}
                                onChange={(e) => updateMemberRole(m.id, e.target.value as ProjectRole)}
                             >
                                 <option value="leader">Leader</option>
                                 <option value="member">Member</option>
                             </select>
                             <button type="button" onClick={() => toggleMember(m)} className="text-zinc-500 hover:text-red-400"><X size={16}/></button>
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
                 <div className="h-48 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                 </div>
              </div>
          </div>

          <div className="flex justify-end pt-4 gap-3">
             <button type="button" onClick={resetForm} className="px-4 py-2 text-zinc-400 hover:text-white transition">취소</button>
             <button disabled={isSubmitting} className="bg-navy px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-white hover:text-black transition">
                {isSubmitting ? "처리 중..." : (editingId ? "수정 완료" : "저장하기")}
             </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project.id} className={`bg-white/5 border rounded-xl overflow-hidden flex flex-col transition ${editingId === project.id ? 'border-navy bg-navy/5' : 'border-white/10'}`}>
            <div className="relative h-40 bg-black/50">
               {project.image_url ? (
                   <Image src={project.image_url} alt={project.title} fill className="object-cover" />
               ) : <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>}
               <div className="absolute top-2 right-2 flex gap-1">
                   <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${project.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/50 text-zinc-300'}`}>
                     {project.status}
                   </span>
               </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
               <h3 className="font-bold text-lg mb-1">{project.title}</h3>
               <div className="flex flex-wrap gap-2 mb-2">
                   {project.links?.map((link, i) => (
                       <a key={i} href={link.url} target="_blank" rel="noreferrer" className="text-xs bg-white/10 px-2 py-1 rounded flex items-center gap-1 hover:bg-white/20 text-zinc-300">
                           <LinkIcon size={10}/> {link.title}
                       </a>
                   ))}
               </div>
               <div className="flex justify-end items-center border-t border-white/10 pt-3 gap-2">
                     <button onClick={() => toggleStatus(project.id, project.status)} className="p-2 bg-white/5 rounded hover:bg-white/10 text-zinc-300" title="상태변경">
                        {project.status === 'ongoing' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                     </button>
                     <button onClick={() => handleEdit(project)} className="p-2 bg-white/5 rounded hover:bg-white/10 text-white" title="수정">
                        <Pencil size={16}/>
                     </button>
                     <button onClick={() => handleDelete(project)} className="p-2 bg-red-500/10 rounded hover:bg-red-500/20 text-red-400" title="삭제">
                        <Trash2 size={16}/>
                     </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}