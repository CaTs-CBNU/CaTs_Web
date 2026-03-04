export const dynamic = "force-dynamic"; 
import { getMembers } from "@/data/members"; // ✅ DB Fetch 함수
import MemberCarousel from "@/components/pages/MemberCarousel"; // ✅ 위에서 수정한 컴포넌트

export default async function MembersPage() {
  // 1. 서버에서 멤버 데이터 가져오기
  const members = await getMembers();

  return (
    <main className="pt-24 pb-14 px-4 min-h-screen">
      {/* 2. 데이터 전달 */}
      <MemberCarousel members={members} />
    </main>
  );
}