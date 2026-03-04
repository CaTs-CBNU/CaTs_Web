"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, ExternalLink, User, PenTool } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminSeminarPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    // 작성자 정보 포함해서 가져오기
    const { data } = await supabase
      .from("posts")
      .select("*, author:profiles(full_name, image_url)")
      .order("date", { ascending: false });
    if (data) setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까? (복구 불가)")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) {
        alert("삭제되었습니다.");
        fetchPosts();
    } else {
        alert(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">세미나 게시글 관리</h1>
        {/* 일반 작성 페이지로 이동 */}
        <Link href="/seminar/write" target="_blank" className="bg-navy hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg font-bold flex gap-2 transition">
            <PenTool size={18} /> 새 글 작성하기
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition gap-4">
            
            <div className="flex items-center gap-4 overflow-hidden">
                {/* 썸네일 */}
                <div className="w-16 h-16 bg-black rounded-lg shrink-0 overflow-hidden relative border border-white/10">
                    {post.thumbnail ? (
                        <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">No img</div>
                    )}
                </div>

                <div className="min-w-0">
                    <h3 className="text-lg font-bold truncate pr-4">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                        <div className="flex items-center gap-1">
                            {post.author?.image_url ? (
                                <Image src={post.author.image_url} alt="a" width={16} height={16} className="rounded-full" />
                            ) : <User size={14}/>}
                            <span>{post.author?.full_name || "Unknown"}</span>
                        </div>
                        <span>•</span>
                        <span>{post.date}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              {/* 수정은 상세페이지에서 본인/관리자 권한으로 수행 */}
              <Link 
                href={`/seminar/${post.id}`} 
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-white/5 hover:bg-white/20 rounded-lg transition"
              >
                <ExternalLink size={14} /> 보기
              </Link>
              <button 
                onClick={() => handleDelete(post.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition"
              >
                <Trash2 size={14} /> 삭제
              </button>
            </div>
          </div>
        ))}
      </div>
      {posts.length === 0 && <div className="text-zinc-500 text-center py-20">등록된 게시글이 없습니다.</div>}
    </div>
  );
}