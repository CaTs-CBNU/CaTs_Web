export const dynamic = "force-dynamic"; 

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Edit } from "lucide-react";
import MarkdownViewer from "@/components/MarkdownViewer";
import { supabase } from "@/lib/supabase/client"; 
import { createServerClient } from "@supabase/ssr"; 
import { cookies } from "next/headers";
import MotionWrapper from "@/components/MotionWrapper"; 

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params;

  // 1. 게시글 조회
  const { data: post, error } = await supabase
    .from("posts")
    .select(`*, author:profiles(id, full_name, image_url)`)
    .eq("id", postId)
    .single();

  if (error || !post) {
    return <div className="text-center py-40 text-white bg-black min-h-screen">게시글을 찾을 수 없습니다.</div>;
  }

  const postData = post as any; 
  const authorName = postData.author?.full_name || "Unknown";
  const authorImage = postData.author?.image_url;

  const cookieStore = await cookies();
  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  );
  
  const { data: { user } } = await supabaseServer.auth.getUser();
  const isAuthor = user && postData.author_id === user.id;
  
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("authority")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.authority === 'admin';
  }

  return (
    <main className="pt-24 pb-20 px-4 max-w-4xl mx-auto min-h-screen text-white">
      
      {/* ✨ 상단 네비게이션 (delay 0) */}
      <MotionWrapper className="flex justify-between items-center mb-8">
        <Link href="/seminar" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition">
            <ArrowLeft size={18} /> 목록으로
        </Link>
        
        {(isAdmin || isAuthor) && (
            <Link 
              href={`/seminar/edit/${postId}`} 
              className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition border border-white/10"
            >
                <Edit size={16} /> 수정하기
            </Link>
        )}
      </MotionWrapper>

      {/* ✨ 헤더 (delay 0.1초) */}
      <MotionWrapper delay={0.1} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white">
          {postData.title}
        </h1>
        
        <div className="flex items-center gap-6 text-zinc-400 pb-8 border-b border-white/10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white shadow-lg shadow-navy/40 overflow-hidden border border-white/10">
                    {authorImage ? (
                        <Image src={authorImage} alt="author" width={32} height={32} className="object-cover w-full h-full"/>
                    ) : (
                        <User size={16} />
                    )}
                </div>
                <span className="font-medium text-white">{authorName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <Calendar size={18} /> {postData.date}
            </div>
        </div>
      </MotionWrapper>

      {/* ✨ 썸네일 (delay 0.2초) */}
      {postData.thumbnail && (
        <MotionWrapper delay={0.2} className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12 border border-white/10 bg-zinc-900">
          <Image 
            src={postData.thumbnail} 
            alt={postData.title} 
            fill 
            className="object-cover" 
          />
        </MotionWrapper>
      )}

      {/* ✨ 본문 (delay 0.3초) */}
      <MotionWrapper delay={0.3}>
        <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-a:text-blue-300 hover:prose-a:text-blue-200">
            <MarkdownViewer content={postData.content} />
        </article>
      </MotionWrapper>
    </main>
  );
}