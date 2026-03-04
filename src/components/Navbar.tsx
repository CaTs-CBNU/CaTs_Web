"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, X, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client"; // Supabase 클라이언트 import

const menuItems = [
  {
    title: "About",
    sub: [
      { name: "동아리 소개", href: "/about" },
      { name: "구성원", href: "/members" },
      { name: "연혁", href: "/history" },
    ],
  },
  {
    title: "Community",
    sub: [{ name: "세미나 블로그", href: "/seminar" }],
  },
  {
    title: "Archive",
    sub: [
      { name: "프로젝트", href: "/projects" },
      { name: "실적(수상/논문)", href: "/performance" },
    ],
  },
];

export default function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // 유저 상태 추가
  const router = useRouter();
  const supabase = createClient();
  // ✅ 초기 로드 시 세션 확인
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 로그인/로그아웃 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ✅ 로그아웃 핸들러
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh(); // 페이지 새로고침하여 상태 반영
  };

  // 모바일 스크롤 제어 (기존 유지)
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-white/10 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 로고 */}
        <Link href="/" className="text-2xl font-black text-white tracking-tighter hover:opacity-80 transition z-50">
          CaTs
        </Link>

        {/* PC 전용 메뉴 */}
        <div className="hidden md:flex gap-8 items-center h-full">
          {menuItems.map((item, index) => (
            <div 
              key={item.title} 
              className="relative h-full flex items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <button 
                className={`flex items-center gap-1 font-bold text-sm transition-colors ${
                  hoveredIndex === index ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.title} 
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-300 ${hoveredIndex === index ? "rotate-180" : ""}`} 
                />
              </button>

              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-[calc(100%-0.5rem)] left-1/2 -translate-x-1/2 pt-4 w-48"
                  >
                    <div className="bg-black border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1">
                      {item.sub.map((s) => (
                        <Link
                          key={s.name}
                          href={s.href}
                          className="block px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Link href="/contact" className="font-bold text-sm text-zinc-400 hover:text-white transition-colors">
            Contact
          </Link>
        </div>

        {/* ✅ PC 우측 버튼 (로그인 상태에 따라 분기) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* 프로필 바로가기 (추후 구현) */}
              <Link href="/mypage" className="flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-white transition">
                <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white border border-white/10">
                   <User size={16} />
                </div>
                <span>{user.user_metadata.full_name}님</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">로그인</Link>
              <Link href="/signup" className="bg-navy text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all shadow-lg shadow-navy/20">가입하기</Link>
            </>
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button 
          className="md:hidden text-white p-2 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 📱 모바일 메뉴 드롭다운 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            // ✅ [핵심 수정] 
            // 1. h-[calc(100dvh-4rem)]: 동적 뷰포트 높이 사용 (브라우저 주소창 고려)
            // 2. top-16: 헤더 높이(4rem) 만큼 띄움
            className="md:hidden fixed top-16 left-0 w-full h-[calc(100dvh-4rem)] bg-black/95 backdrop-blur-md border-t border-white/10 overflow-y-auto overscroll-contain z-40"
          >
            {/* ✅ pb-24: 하단에 충분한 여백을 주어 내용이 잘리지 않게 함 */}
            <div className="px-6 py-6 flex flex-col gap-6 pb-24">
              {menuItems.map((item) => (
                <div key={item.title} className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">{item.title}</span>
                  <div className="flex flex-col gap-2 pl-2 border-l border-white/10">
                    {item.sub.map((s) => (
                      <Link 
                        key={s.name} 
                        href={s.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        // 글자 크기 살짝 조정 (text-lg -> text-base)하여 화면에 더 잘 들어오게 함
                        className="text-zinc-300 hover:text-white text-base font-medium block py-1.5"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold text-white pt-4 border-t border-white/10">
                Contact
              </Link>
              {/* ✅ 모바일 하단 버튼 (로그인 상태 분기) */}
              <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-white/10">
                {user ? (
                  <>
                    <div className="text-white font-bold text-lg mb-2">반가워요, {user.user_metadata.full_name}님! 👋</div>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-center py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors">로그아웃</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 text-zinc-400 font-bold border border-white/10 rounded-xl hover:bg-white/5 transition-colors">로그인</Link>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 bg-navy text-white font-bold rounded-xl hover:bg-white hover:text-black transition-colors">가입하기</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}