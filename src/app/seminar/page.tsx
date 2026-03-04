import { getPosts } from "@/data/posts"; // ✅ DB Fetch 함수
import SeminarList from "@/components/pages/SeminarList"; // ✅ 위에서 만든 UI 컴포넌트

export default async function SeminarPage() {
  // 1. 서버 사이드에서 데이터 가져오기
  const posts = await getPosts();

  return (
    <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto text-white min-h-screen">
      {/* 2. 데이터를 클라이언트 컴포넌트로 전달 */}
      <SeminarList posts={posts} />
    </main>
  );
}