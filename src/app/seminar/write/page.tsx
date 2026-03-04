"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MarkdownViewer from "@/components/MarkdownViewer";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion"; // ✅ 추가

export default function WritePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null); 
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert("로그인이 필요합니다."); router.push("/login"); return; }
      setUser(user);
    };
    getUser();
  }, [router, supabase.auth]);

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreviewUrl("");
  };

  const handleSave = async () => {
    // ... (기존 저장 로직 동일)
    if (!title || !content) { alert("필수 입력"); return; }
    setIsSubmitting(true);
    try {
        let uploadedImageUrl = null;
        if(thumbnailFile) {
            const fileExt = thumbnailFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
            const {error} = await supabase.storage.from('images').upload(`thumbnails/${fileName}`, thumbnailFile);
            if(error) throw error;
            const {data} = supabase.storage.from('images').getPublicUrl(`thumbnails/${fileName}`);
            uploadedImageUrl = data.publicUrl;
        }
        const {error} = await supabase.from('posts').insert({
            title, content, thumbnail: uploadedImageUrl, author_id: user.id, date: new Date().toISOString().split('T')[0]
        });
        if(error) throw error;
        alert("등록 성공"); router.push("/seminar"); router.refresh();
    } catch(e:any) { alert(e.message); } finally { setIsSubmitting(false); }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-24 pb-12 px-4 max-w-[1600px] mx-auto min-h-screen text-white flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <Link href="/seminar" className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
          <ArrowLeft size={20} /> 돌아가기
        </Link>
        <button onClick={handleSave} disabled={isSubmitting} className={`bg-navy hover:bg-white hover:text-black text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-navy/30 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Save size={18} /> {isSubmitting ? '저장 중...' : '출판하기'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
            <input type="text" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-white/50 transition w-full placeholder-zinc-500 text-white" />
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-400 w-full flex items-center gap-2">
                <span className="text-xs bg-navy px-2 py-0.5 rounded text-white">Author</span>
                {user?.user_metadata?.full_name || "Loading..."}
            </div>
        </div>

        <div className="lg:col-span-1">
            <div className="relative h-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition group">
                {thumbnailPreviewUrl ? (
                    <>
                        <Image src={thumbnailPreviewUrl} alt="Thumbnail preview" fill className="object-cover opacity-50 group-hover:opacity-100 transition" />
                        <button onClick={clearThumbnail} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-white hover:text-black transition z-10">
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer text-zinc-500 hover:text-white transition">
                        <ImagePlus size={32} className="mb-2" />
                        <span className="text-sm font-bold">썸네일 업로드</span>
                        <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                    </label>
                )}
            </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        <div className="flex flex-col">
          <div className="text-zinc-400 text-sm mb-2 font-bold ml-1">Markdown Editor</div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="# 여기에 내용을 작성하세요..." className="flex-1 w-full bg-white/5 text-zinc-200 p-6 rounded-2xl border border-white/10 focus:outline-none focus:border-white/50 resize-none font-mono leading-relaxed custom-scrollbar placeholder-zinc-600" />
        </div>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="text-zinc-400 text-sm mb-2 font-bold ml-1">Preview</div>
          <div className="flex-1 bg-white/5 border border-white/10 p-8 rounded-2xl overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
            <MarkdownViewer content={content || "*미리보기 화면입니다.*"} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}