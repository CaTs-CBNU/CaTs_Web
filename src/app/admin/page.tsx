import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Users, FolderKanban, Presentation, Trophy, ArrowRight, History } from "lucide-react";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // 1. 각 테이블의 데이터 개수 가져오기 (병렬 처리)
  const [
    { count: membersCount },
    { count: projectsCount },
    { count: postsCount },
    { count: performancesCount },
    { count: historyCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("performances").select("*", { count: "exact", head: true }),
    supabase.from("histories").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "전체 멤버", value: membersCount || 0, icon: Users, href: "/admin/members", color: "bg-blue-500/10 text-blue-500" },
    { label: "프로젝트", value: projectsCount || 0, icon: FolderKanban, href: "/admin/projects", color: "bg-green-500/10 text-green-500" },
    { label: "세미나 글", value: postsCount || 0, icon: Presentation, href: "/admin/seminar", color: "bg-purple-500/10 text-purple-500" },
    { label: "실적/성과", value: performancesCount || 0, icon: Trophy, href: "/admin/performance", color: "bg-yellow-500/10 text-yellow-500" },
    { label: "연혁 기록", value: historyCount || 0, icon: History, href: "/admin/history", color: "bg-pink-500/10 text-pink-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black mb-2 tracking-tight">Dashboard</h1>
      <p className="text-zinc-400 mb-8">CaTs 웹사이트 현황을 한눈에 확인하세요.</p>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <Link 
            key={stat.label} 
            href={stat.href}
            className="group bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:border-white/20 transition duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="bg-black/50 px-2 py-1 rounded text-xs text-zinc-500 group-hover:text-white transition">
                바로가기 <ArrowRight size={10} className="inline ml-1" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-zinc-400 text-sm font-medium">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* 최근 활동 섹션 (예시) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-4">📢 관리자 공지</h2>
        <div className="text-zinc-400 text-sm leading-relaxed space-y-2">
          <p>• 관리자 페이지는 <strong>PC 환경</strong>에 최적화되어 있습니다.</p>
          <p>• 데이터를 삭제할 경우 복구가 어려우니 신중하게 진행해주세요.</p>
        </div>
      </div>
    </div>
  );
}