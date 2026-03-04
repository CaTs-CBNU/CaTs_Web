"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

// ✅ 공통 컴포넌트 적용
import MotionWrapper from "@/components/MotionWrapper";
import FormInput from "@/components/ui/form/FormInput";

export default function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 학번으로 이메일과 권한(role) 조회
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, role') // ✅ role 추가 조회
        .eq('student_id', studentId)
        .single();

      if (profileError || !profile?.email) {
        alert('존재하지 않는 학번이거나, 등록된 정보가 없습니다.');
        setLoading(false);
        return;
      }

      // 2. 조회된 이메일로 로그인 시도
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email: profile.email, 
        password 
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          alert('이메일 인증이 완료되지 않았습니다. 가입하신 메일함을 확인해주세요.');
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
        setLoading(false);
        return;
      }

      // 3. ✅ 관리자 승인(pending) 상태 검사 로직 추가
      if (profile.role === 'pending') {
          await supabase.auth.signOut(); // 즉시 세션 파기
          alert("관리자 승인 대기 중인 계정입니다.\n승인이 완료된 후 로그인할 수 있습니다.");
          setLoading(false);
          return;
      }

      // 4. 승인된 유저라면 정상적으로 홈으로 이동
      router.push('/');
      router.refresh();

    } catch (err) {
      console.error(err);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-6">
      <div className="max-w-md w-full mx-auto">
        
        {/* 헤더 섹션 */}
        <MotionWrapper className="mb-10 text-center md:text-left">
          <h2 className="text-4xl font-bold text-white leading-tight mb-2">
            Welcome to CaTs
          </h2>
          <p className="text-zinc-400">
            학번과 비밀번호로 로그인해주세요.
          </p>
        </MotionWrapper>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* 학번 입력 (FormInput 적용) */}
          <MotionWrapper delay={0.1}>
            <FormInput 
              label="학번"
              type="text" 
              placeholder="10자리 학번 입력" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value.replace(/[^0-9]/g, ''))} 
              maxLength={10}
              required 
            />
          </MotionWrapper>

          {/* 비밀번호 입력 (FormInput 적용) */}
          <MotionWrapper delay={0.2}>
            <FormInput 
              label="비밀번호"
              type="password" 
              placeholder="비밀번호를 입력해주세요" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </MotionWrapper>

          {/* 버튼 섹션 */}
          <MotionWrapper delay={0.3} className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={loading || studentId.length < 5}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all shadow-lg ${
                loading || studentId.length < 5
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-navy text-white hover:bg-white hover:text-black shadow-navy/30'
              }`}
            >
              <LogIn size={18} /> {loading ? '로그인 중...' : '로그인하기'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="w-full py-4 text-zinc-500 font-medium text-sm hover:text-white transition-colors text-center"
            >
              아직 회원이 아니신가요? <span className="underline ml-1 text-zinc-400 hover:text-white">회원가입 신청</span>
            </button>
          </MotionWrapper>
          
        </form>
      </div>
    </main>
  );
}