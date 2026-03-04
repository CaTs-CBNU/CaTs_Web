export const dynamic = "force-dynamic"; 

"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, ImagePlus, X, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import MarkdownViewer from "@/components/MarkdownViewer";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/db";
import { motion } from "framer-motion"; // ✅ 추가

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.postId); 
  const supabase = createClient();
  
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("");
  const [originalThumbnailUrl, setOriginalThumbnailUrl] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ... (기존 데이터 페칭 로직 동일)
    // ... fetchData 함수 내용 그대로 사용
    const fetchPostAndCheckAuth = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) { alert("로그인이 필요합니다."); router.push("/login"); return; }
            setUser(currentUser);

            const { data: profile } = await supabase.from("profiles").select("authority").eq("id", currentUser.id).single();
            const isAdmin = profile?.authority === 'admin';

            const { data: postData, error } = await supabase.from("posts").select("*, author:profiles(*)").eq("id", postId).single();
            if (error || !postData) { alert("게시글 오류"); router.back(); return; }

            if (postData.author_id !== currentUser.id && !isAdmin) { alert("권한 없음"); router.back(); return; }

            const loadedPost = postData as Post;
            setPost(loadedPost);
            setTitle(loadedPost.title);
            setContent(loadedPost.content);
            if (loadedPost.thumbnail) {
                setThumbnailPreviewUrl(loadedPost.thumbnail);
                setOriginalThumbnailUrl(loadedPost.thumbnail);
            }
        } catch(e) { console.error(e) } finally { setIsLoading(false); }
    }
    if(postId) fetchPostAndCheckAuth();
  }, [postId, router, supabase]);

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

  const deleteImageFromStorage = async (url: string) => {
    try {
      const path = url.split('/images/')[1];
      if (path) await supabase.storage.from('images').remove([path]);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async () => {
    // ... (기존 업데이트 로직 동일)
    if (!title || !content) { alert("필수 입력"); return; }
    setIsSubmitting(true);
    try {
        let finalThumbnailUrl = thumbnailPreviewUrl;
        if (thumbnailFile) {
            const fileExt = thumbnailFile.name.split('.').pop();
            const fileName = `thumbnails/${Date.now()}_${Math.random()}.${fileExt}`;
            const { error } = await supabase.storage.from('images').upload(fileName, thumbnailFile);
            if(error) throw error;
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            finalThumbnailUrl = data.publicUrl;
        } else if (!thumbnailPreviewUrl) { finalThumbnailUrl = ""; }

        const { error } = await supabase.from('posts').update({ title, content, thumbnail: finalThumbnailUrl || null }).eq('id', postId);
        if(error) throw error;

        if (originalThumbnailUrl && originalThumbnailUrl !== finalThumbnailUrl) {
            await deleteImageFromStorage(originalThumbnailUrl);
        }
        alert("수정 완료"); router.push(`/seminar/${postId}`); router.refresh();
    } catch(e:any) { alert(e.message); } finally { setIsSubmitting(false); }
  };

  const handleDeletePost = async () => {
    // ... (기존 삭제 로직 동일)
    if(!confirm("삭제하시겠습니까?")) return;
    try {
        setIsSubmitting(true);
        if(originalThumbnailUrl) await deleteImageFromStorage(originalThumbnailUrl);
        await supabase.from('posts').delete().eq('id', postId);
        alert("삭제됨"); router.replace('/seminar'); router.refresh();
    } catch(e:any) { alert(e.message); setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
      </div>
    );
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-24 pb-12 px-4 max-w-[1600px] mx-auto min-h-screen text-white flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
          <ArrowLeft size={20} /> 취소하고 돌아가기
        </button>
        <div className="flex gap-3">
            <button onClick={handleDeletePost} disabled={isSubmitting} className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
              <Trash2 size={18} /> 삭제
            </button>
            <button onClick={handleUpdate} disabled={isSubmitting} className={`bg-navy hover:bg-white hover:text-black text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-navy/30 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Save size={18} /> {isSubmitting ? '저장 중...' : '수정 완료'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
            <input type="text" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-white/50 transition w-full placeholder-zinc-500 text-white" />
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-400 w-full flex items-center gap-2">
                <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded text-white">Editor</span>
                {user?.user_metadata?.full_name || "Unknown"}
            </div>
        </div>

        <div className="lg:col-span-1">
            <div className="relative h-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition group">
                {thumbnailPreviewUrl ? (
                    <>
                        <Image src={thumbnailPreviewUrl} alt="Thumbnail preview" fill className="object-cover opacity-60 group-hover:opacity-100 transition" />
                        <button onClick={clearThumbnail} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition z-10">
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer text-zinc-500 hover:text-white transition">
                        <ImagePlus size={32} className="mb-2" />
                        <span className="text-sm font-bold">썸네일 변경/업로드</span>
                        <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                    </label>
                )}
            </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        <div className="flex flex-col">
          <div className="text-zinc-400 text-sm mb-2 font-bold ml-1">Markdown Editor</div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="# 내용을 수정하세요..." className="flex-1 w-full bg-white/5 text-zinc-200 p-6 rounded-2xl border border-white/10 focus:outline-none focus:border-white/50 resize-none font-mono leading-relaxed custom-scrollbar placeholder-zinc-600" />
        </div>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="text-zinc-400 text-sm mb-2 font-bold ml-1">Preview</div>
          <div className="flex-1 bg-white/5 border border-white/10 p-8 rounded-2xl overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
            <MarkdownViewer content={content || "*내용을 입력하면 미리보기가 표시됩니다.*"} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}