"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Save, ArrowLeft, Calendar, ChevronDown } from "lucide-react";

import MotionWrapper from "@/components/MotionWrapper";
import FormInput from "@/components/ui/form/FormInput";
import FormSelect from "@/components/ui/form/FormSelect";
import ProfileUploader from "@/components/ui/form/ProfileUploader";
import TagSelector from "@/components/ui/form/TagSelector";
import { UI_TEXT } from "@/constants/uiText";

// 상수들
const MAJOR_OPTIONS = ['컴퓨터공학과', '소프트웨어학과', '정보통신공학과', '직접 입력'];
const STATUS_OPTIONS = [
  { label: '재학', value: '재학' },
  { label: '휴학', value: '휴학' },
  { label: '졸업', value: '졸업' }
];
const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'kakao.com', 'outlook.com', 'chungbuk.ac.kr', '직접 입력'];
const INTEREST_OPTIONS = ['웹 개발', '앱 개발', 'AI/데이터', '디자인', '보안', '게임 개발'];

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  // --- Form States ---
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  
  const [phone1, setPhone1] = useState("010");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");

  const [gender, setGender] = useState<'남성' | '여성' | ''>('');
  const [birthDate, setBirthDate] = useState("");
  const [status, setStatus] = useState("재학");
  
  const [majorSelection, setMajorSelection] = useState("컴퓨터공학과");
  const [customMajor, setCustomMajor] = useState("");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  // 이미지 관련
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Refs for Phone Focus
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handlePhoneChange = (part: 1 | 2 | 3, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (part === 1) {
        setPhone1(cleaned);
        if (cleaned.length === 3) phone2Ref.current?.focus();
    } else if (part === 2) {
        setPhone2(cleaned);
        if (cleaned.length === 4) phone3Ref.current?.focus();
    } else {
        setPhone3(cleaned);
    }
  };

  const handleDomainChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '직접 입력') {
        setIsCustomDomain(true);
        setEmailDomain("");
    } else {
        setIsCustomDomain(false);
        setEmailDomain(val);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // ✅ 학번 입력 핸들러 (숫자만 입력되도록)
  const handleStudentIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, ''); // 숫자 이외 제거
    if (cleaned.length <= 10) { // 최대 10자리까지만 입력
      setStudentId(cleaned);
    }
  };

  // --- Submit Logic ---
  const handleSignUp = async () => {
    // 1. 유효성 검사
    if (!emailId || !emailDomain || !password || !fullName || !studentId || !phone2 || !phone3) {
        return alert(UI_TEXT.ERRORS.INVALID_INPUT);
    }
    if (password !== passwordConfirm) {
        return alert("비밀번호가 일치하지 않습니다.");
    }
    // ✅ 1-1. 학번 10자리 검사 추가
    const studentIdRegex = /^\d{10}$/;
    if (!studentIdRegex.test(studentId)) {
        return alert("학번은 10자리 숫자여야 합니다.");
    }

    setLoading(true);
    const finalEmail = `${emailId}@${emailDomain}`;
    const finalPhone = `${phone1}${phone2}${phone3}`;
    const finalMajor = majorSelection === '직접 입력' ? customMajor : majorSelection;

    try {
        // ✅ 2. 중복 학번 사전 체크 (Profiles 테이블 조회)
        // (트리거에서 에러를 뿜기 전에 미리 체크해서 친절한 에러 메시지를 띄움)
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('student_id', studentId)
            .maybeSingle();

        if (existingUser) {
            alert("이미 가입된 학번입니다.");
            setLoading(false);
            return;
        }

        // 3. Supabase Auth 회원가입
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: finalEmail,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    student_id: studentId, // 메타데이터에도 저장
                }
            }
        });

        // "Database error saving new user" 발생 시 로그 출력
        if (authError) {
             console.error("Auth Sign Up Error:", authError);
             throw authError;
        }
        if (!authData.user) throw new Error("회원가입 실패 (User null)");

        // 4. 이미지 업로드 (선택)
        let finalImageUrl = "";
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `profiles/${authData.user.id}_${Date.now()}.${fileExt}`;
            const { error: upError } = await supabase.storage.from('images').upload(fileName, imageFile);
            if (upError) throw upError;
            const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
            finalImageUrl = urlData.publicUrl;
        }

        // 5. Profiles 테이블 추가 정보 저장
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: finalEmail,
                full_name: fullName,
                student_id: studentId,
                phone: finalPhone,
                major: finalMajor,
                gender: gender || null,
                birth_date: birthDate || null,
                status: status,
                interests: selectedInterests,
                bio: bio,
                image_url: finalImageUrl || null,
                role: 'pending', // 가입 승인 대기 상태
                authority: 'user'
            });

        if (profileError) {
             console.error("Profile Upsert Error:", profileError);
             throw profileError;
        }

        await supabase.auth.signOut();

        alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        router.push('/login');

    } catch (error: any) {
        alert("오류 발생: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-24 px-4 text-white">
      {/* 헤더 */}
      <MotionWrapper className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Join CaTs</h1>
        <p className="text-zinc-400">동아리 회원이 되어 함께 성장하세요.</p>
      </MotionWrapper>

      <div className="space-y-8">
        {/* 1. 프로필 이미지 */}
        <MotionWrapper delay={0.1}>
            <ProfileUploader 
                previewUrl={previewUrl} 
                onImageChange={handleImageChange} 
                onDelete={() => { setImageFile(null); setPreviewUrl(""); }} 
            />
        </MotionWrapper>

        {/* 2. 계정 정보 (이메일/비번) */}
        <MotionWrapper delay={0.2}>
            <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">이메일 (아이디)</label>
                <div className="flex gap-2 items-center">
                    <FormInput value={emailId} onChange={(e) => setEmailId(e.target.value)} placeholder="example" className="flex-1" />
                    <span className="text-zinc-400 font-bold">@</span>
                    <FormInput value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} disabled={!isCustomDomain} className="flex-1" />
                    <div className="relative w-32">
                        <select className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={handleDomainChange} value={isCustomDomain ? '직접 입력' : emailDomain}>
                            {EMAIL_DOMAINS.map(d => <option key={d} value={d} className="bg-zinc-900">{d}</option>)}
                        </select>
                        <div className="w-full h-[52px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center pointer-events-none">
                            <ChevronDown className="text-zinc-500" size={18} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput type="password" label="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자리 이상 입력" />
                <FormInput type="password" label="비밀번호 확인" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="비밀번호 재입력" />
            </div>
        </MotionWrapper>

        {/* 3. 기본 정보 (이름/학번) */}
        <MotionWrapper delay={0.3} className="grid grid-cols-2 gap-4">
            <FormInput label="이름" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="홍길동" />
            {/* ✅ 학번 입력 핸들러 적용 (숫자 10자리 제한) */}
            <FormInput label="학번" value={studentId} onChange={handleStudentIdChange} placeholder="202XXXXXX (10자리 숫자)" maxLength={10} />
        </MotionWrapper>

        {/* 4. 연락처 */}
        <MotionWrapper delay={0.4}>
            <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">휴대전화 번호</label>
            <div className="flex items-center gap-2">
                <FormInput value={phone1} onChange={(e) => handlePhoneChange(1, e.target.value)} maxLength={3} />
                <span className="text-zinc-500">-</span>
                <FormInput ref={phone2Ref} value={phone2} onChange={(e) => handlePhoneChange(2, e.target.value)} maxLength={4} />
                <span className="text-zinc-500">-</span>
                <FormInput ref={phone3Ref} value={phone3} onChange={(e) => handlePhoneChange(3, e.target.value)} maxLength={4} />
            </div>
        </MotionWrapper>

        {/* 5. 학적 및 전공 */}
        <MotionWrapper delay={0.5} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <FormSelect 
                    label="학적 상태" 
                    options={STATUS_OPTIONS} 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                />
            </div>
            <div>
                <FormSelect 
                    label="전공" 
                    options={MAJOR_OPTIONS} 
                    value={majorSelection} 
                    onChange={(e) => setMajorSelection(e.target.value)} 
                />
                {majorSelection === '직접 입력' && (
                    <FormInput className="mt-2" placeholder="전공 입력" value={customMajor} onChange={(e) => setCustomMajor(e.target.value)} />
                )}
            </div>
        </MotionWrapper>

        {/* 6. 개인 정보 (성별/생일) */}
        <MotionWrapper delay={0.6} className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">성별</label>
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl h-[52px] items-center">
                    {['남성', '여성'].map((g) => (
                        <button key={g} type="button" onClick={() => setGender(g as any)} className={`flex-1 h-full text-sm font-bold rounded-lg transition-all ${gender === g ? 'bg-navy text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}>
                            {g}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">생년월일</label>
                <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer relative h-[52px]" onClick={() => dateInputRef.current?.showPicker()}>
                    <span className={`text-sm ${birthDate ? 'text-white' : 'text-zinc-500'}`}>{birthDate || 'YYYY-MM-DD'}</span>
                    <Calendar className="text-zinc-500" size={18} />
                    <input ref={dateInputRef} type="date" className="absolute inset-0 opacity-0 pointer-events-none" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </div>
            </div>
        </MotionWrapper>

        {/* 7. 관심 분야 & 자기소개 */}
        <MotionWrapper delay={0.7} className="space-y-6">
            <TagSelector 
                label="관심 분야 (중복 선택 가능)" 
                options={INTEREST_OPTIONS} 
                selected={selectedInterests} 
                onToggle={toggleInterest} 
            />
            <div>
                <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">자기소개</label>
                <textarea 
                    rows={4} 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-navy outline-none transition resize-none text-white text-center placeholder-zinc-500" 
                    placeholder="간단한 자기소개를 입력해주세요."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
            </div>
        </MotionWrapper>

        {/* 버튼 */}
        <MotionWrapper delay={0.8} className="pt-4 flex gap-3">
            <button 
                onClick={handleSignUp} 
                disabled={loading}
                className="flex-1 bg-navy hover:bg-white hover:text-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-navy/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Save size={18} /> {loading ? "처리 중..." : "가입하기"}
            </button>
            <button 
                onClick={() => router.back()} 
                className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/10 text-zinc-400 transition flex items-center gap-2"
            >
                <ArrowLeft size={18} /> 취소
            </button>
        </MotionWrapper>
      </div>
    </div>
  );
}