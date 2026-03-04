"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, User, ArrowRight, PenTool, FileText } from "lucide-react";
import { Post } from "@/types/db";

// ✅ 공통 컴포넌트 및 텍스트 상수 import
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MotionWrapper from "@/components/MotionWrapper";
import { UI_TEXT } from "@/constants/uiText";

interface SeminarListProps {
  posts: Post[];
}

export default function SeminarList({ posts }: SeminarListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = posts.filter((post) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = post.title.toLowerCase().includes(term);
    const authorName = post.author?.full_name || "Unknown"; 
    const authorMatch = authorName.toLowerCase().includes(term);
    const contentMatch = post.content.toLowerCase().includes(term);
    return titleMatch || authorMatch || contentMatch;
  });

  return (
    <>
      {/* 1. 헤더 섹션 (PageHeader 컴포넌트 사용) */}
      <section className="flex flex-col items-center mb-16">
        <PageHeader content={UI_TEXT.HEADERS.SEMINAR} />

        {/* 검색창 & 버튼 (MotionWrapper 사용) */}
        <MotionWrapper delay={0.2} className="flex flex-col md:flex-row gap-4 w-full max-w-2xl items-center z-20">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-zinc-500" size={22} />
              </div>
              <input
                  type="text"
                  placeholder="제목, 작성자, 내용 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/50 transition text-white placeholder-zinc-500 text-lg"
              />
            </div>

            <Link 
                href="/seminar/write"
                className="shrink-0 px-6 py-4 bg-navy text-white font-bold rounded-2xl hover:bg-white hover:text-black transition flex items-center gap-2 shadow-lg shadow-navy/30"
            >
                <PenTool size={20} />
                <span className="hidden md:inline">작성하기</span>
            </Link>
        </MotionWrapper>
      </section>

      {/* 2. 포스트 그리드 (MotionWrapper 사용) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              // ✅ motion.div 대신 MotionWrapper 사용
              <MotionWrapper key={post.id} className="h-full">
                <Link href={`/seminar/${post.id}`} className="group block h-full">
                  <article className="h-full flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    
                    {/* 썸네일 */}
                    <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
                      {post.thumbnail ? (
                        <Image
                          src={post.thumbnail}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <FileText size={48} className="opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* 내용 */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                          <Calendar size={12} /> {post.date}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-200 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                        {post.content.replace(/[#*`]/g, '').slice(0, 150)}...
                      </p>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-white text-[10px] overflow-hidden border border-white/10">
                              {post.author?.image_url ? (
                                  <Image src={post.author.image_url} alt="author" width={24} height={24} className="object-cover w-full h-full" />
                              ) : (
                                  <User size={12} />
                              )}
                          </div>
                          <span className="text-xs font-medium text-zinc-300">
                            {post.author?.full_name || "Unknown"}
                          </span>
                        </div>
                        <span className="text-navy text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                          Read More <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </MotionWrapper>
            ))
          ) : (
            // ✅ 빈 상태 (EmptyState 컴포넌트 사용)
            <EmptyState 
              icon={<Search size={32} />}
              content={UI_TEXT.EMPTY.NO_SEARCH_RESULT}
              onAction={() => setSearchTerm("")}
            />
          )}
      </div>
    </>
  );
}