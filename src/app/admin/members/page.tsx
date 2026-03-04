"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Image from "next/image";
import { Profile } from "@/types/db"; 

export default function AdminMembersPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 권한(authority) 체크
    const { data: currentUser } = await supabase.from("profiles").select("authority").eq("id", user.id).single();
    if (currentUser?.authority !== "admin") {
        alert("관리자 권한이 필요합니다.");
        router.push("/");
        return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setMembers(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateProfile = async (id: string, field: 'role' | 'status' | 'authority', value: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));

    const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", id);

    if (error) {
        alert("업데이트 실패: " + error.message);
        fetchData(); 
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.includes(searchTerm) || m.student_id?.includes(searchTerm)
  );

  if (loading) return <div className="p-20 text-center text-white">Loading...</div>;

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto text-white min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold">회원 관리</h1>
            <p className="text-zinc-400 mt-2">회원의 상태, 직책, 시스템 권한을 관리합니다.</p>
        </div>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
                type="text" 
                placeholder="이름/학번 검색" 
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-sm w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-white/5 text-zinc-400 text-sm border-b border-white/10">
                    <th className="p-4 font-medium">프로필</th>
                    <th className="p-4 font-medium">학번/이름</th>
                    <th className="p-4 font-medium">학적 (Status)</th>
                    <th className="p-4 font-medium">직책 (Role)</th>
                    <th className="p-4 font-medium">권한 (Auth)</th>
                </tr>
            </thead>
            <tbody>
                {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative">
                                {member.image_url ? (
                                    <Image src={member.image_url} alt={member.full_name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">IMG</div>
                                )}
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="font-bold">{member.full_name}</div>
                            <div className="text-xs text-zinc-500 font-mono">{member.student_id}</div>
                        </td>
                        
                        {/* 1. 학적 상태 (한글 Enum) */}
                        <td className="p-4">
                            <select 
                                value={member.status} 
                                onChange={(e) => updateProfile(member.id, 'status', e.target.value)}
                                className={`bg-transparent border border-white/10 rounded px-2 py-1 text-sm outline-none cursor-pointer ${
                                    member.status === '재학' ? 'text-green-400' : member.status === '졸업' ? 'text-blue-400' : 'text-zinc-400'
                                }`}
                            >
                                <option value="재학" className="bg-zinc-900">재학</option>
                                <option value="휴학" className="bg-zinc-900">휴학</option>
                                <option value="졸업" className="bg-zinc-900">졸업</option>
                            </select>
                        </td>

                        {/* 2. 동아리 직책 (pending 추가됨) */}
                        <td className="p-4">
                            <select 
                                value={member.role} 
                                onChange={(e) => updateProfile(member.id, 'role', e.target.value)}
                                className={`bg-transparent border border-white/10 rounded px-2 py-1 text-sm outline-none cursor-pointer font-bold ${
                                    member.role === 'president' ? 'text-yellow-400' : member.role === 'vice_president' ? 'text-yellow-200' : member.role === 'pending' ? 'text-zinc-500' : 'text-white'
                                }`}
                            >
                                <option value="pending" className="bg-zinc-900 text-zinc-500">미정 (Pending)</option>
                                <option value="member" className="bg-zinc-900 text-white">부원 (Member)</option>
                                <option value="president" className="bg-zinc-900 text-yellow-400">회장 (President)</option>
                                <option value="vice_president" className="bg-zinc-900 text-yellow-200">부회장 (VP)</option>
                            </select>
                        </td>

                        {/* 3. 시스템 권한 */}
                        <td className="p-4">
                            <select 
                                value={member.authority} 
                                onChange={(e) => updateProfile(member.id, 'authority', e.target.value)}
                                className={`bg-transparent border border-white/10 rounded px-2 py-1 text-sm outline-none cursor-pointer font-bold ${
                                    member.authority === 'admin' ? 'text-red-400 border-red-500/30' : 'text-zinc-500'
                                }`}
                            >
                                <option value="user" className="bg-zinc-900">일반 (User)</option>
                                <option value="admin" className="bg-zinc-900">관리자 (Admin)</option>
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}