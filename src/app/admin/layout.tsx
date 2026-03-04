import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { 
  LayoutDashboard, Users, History, 
  Presentation, FolderKanban, Trophy, 
  LogOut, CalendarDays 
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // 1. 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. 관리자 권한 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("authority")
    .eq("id", user.id)
    .single();

  if (profile?.authority !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">접근 권한 없음</h1>
          <p className="text-zinc-400 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
          <Link href="/" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">홈으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "대시보드", href: "/admin", icon: LayoutDashboard },
    { name: "일정 관리", href: "/admin/schedule", icon: CalendarDays }, 
    { name: "멤버 관리", href: "/admin/members", icon: Users },
    { name: "연혁 관리", href: "/admin/history", icon: History },
    { name: "세미나 관리", href: "/admin/seminar", icon: Presentation },
    { name: "프로젝트 관리", href: "/admin/projects", icon: FolderKanban },
    { name: "실적 관리", href: "/admin/performance", icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white pt-16">
      
      {/* 사이드바 */}
      <aside className="w-64 border-r border-white/10 fixed left-0 h-full bg-zinc-900/50 backdrop-blur-md z-40">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black tracking-tighter">CaTs Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition font-medium"
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium">
                <LogOut size={18} /> 나가기
            </Link>
          </div>
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}