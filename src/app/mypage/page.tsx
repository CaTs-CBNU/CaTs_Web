"use client";
export const dynamic = "force-dynamic"; 

import { useState, useEffect, useRef, useMemo, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, FolderKanban, Trophy, Calendar, ChevronDown } from "lucide-react";

// ✅ 공통 컴포넌트 및 상수 import
import MotionWrapper from "@/components/MotionWrapper";
import PageHeader from "@/components/ui/PageHeader";
import FormInput from "@/components/ui/form/FormInput";
import FormSelect from "@/components/ui/form/FormSelect";
import ProfileUploader from "@/components/ui/form/ProfileUploader";
import TagSelector from "@/components/ui/form/TagSelector";
import { UI_TEXT } from "@/constants/uiText";

// 옵션 상수 (SignUpPage와 동일하게 유지)
const MAJOR_OPTIONS = ['컴퓨터공학과', '소프트웨어학과', '정보통신공학과', '직접 입력'];
const STATUS_OPTIONS = [
  { label: '재학', value: '재학' },
  { label: '휴학', value: '휴학' },
  { label: '졸업', value: '졸업' }
];
const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'kakao.com', 'outlook.com', 'chungbuk.ac.kr', '직접 입력'];
const INTEREST_OPTIONS = ['웹 개발', '앱 개발', 'AI/데이터', '디자인', '보안', '게임 개발'];

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // --- Form States ---
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");

  const [gender, setGender] = useState<'남성' | '여성' | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState('재학');

  const [majorSelection, setMajorSelection] = useState('컴퓨터공학과');
  const [customMajor, setCustomMajor] = useState('');

  const [emailId, setEmailId] = useState('');
  const [emailDomainInput, setEmailDomainInput] = useState('');
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");

  // 참여 활동 데이터
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [myPerformances, setMyPerformances] = useState<any[]>([]);

  // Refs
  const dateInputRef = useRef<HTMLInputElement>(null);
  const phone2Ref = useRef<HTMLInputElement>(null);
  const phone3Ref = useRef<HTMLInputElement>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 1. 프로필 조회
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
      } else if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name);
        setStudentId(profileData.student_id);
        setGender(profileData.gender || '');
        setBirthDate(profileData.birth_date || '');
        setStatus(profileData.status || '재학');
        setBio(profileData.bio || "");
        setSelectedInterests(profileData.interests || []);

        if (profileData.phone && profileData.phone.length >= 10) {
            setPhone1(profileData.phone.substring(0, 3));
            setPhone2(profileData.phone.substring(3, 7));
            setPhone3(profileData.phone.substring(7));
        }

        if (MAJOR_OPTIONS.includes(profileData.major)) {
            setMajorSelection(profileData.major);
        } else {
            setMajorSelection('직접 입력');
            setCustomMajor(profileData.major);
        }

        if (profileData.email) {
            const [id, domain] = profileData.email.split('@');
            setEmailId(id || '');
            if (EMAIL_DOMAINS.includes(domain)) {
                setEmailDomainInput(domain);
                setIsCustomDomain(false);
            } else {
                setEmailDomainInput(domain);
                setIsCustomDomain(true);
            }
        }

        if (profileData.image_url) {
          setPreviewUrl(profileData.image_url);
          setOriginalImageUrl(profileData.image_url);
        }
      }

      // 2. 참여 프로젝트 조회
      const { data: projectData } = await supabase
        .from("project_members")
        .select(`role, projects ( * )`)
        .eq("user_id", user.id);
      setMyProjects(projectData || []);

      // 3. 참여 실적 조회
      const { data: perfData } = await supabase
        .from("performance_members")
        .select(`performances ( * )`)
        .eq("user_id", user.id);
      setMyPerformances(perfData || []);

      setLoading(false);
    };
    fetchData();
  }, [router, supabase]);

  // --- 변경 감지 ---
  const hasChanges = useMemo(() => {
    if (!profile) return false;
    const currentPhone = `${phone1}${phone2}${phone3}`;
    const currentMajor = majorSelection === '직접 입력' ? customMajor : majorSelection;
    const currentEmail = `${emailId}@${emailDomainInput}`;

    return (
        fullName !== profile.full_name ||
        currentPhone !== profile.phone ||
        gender !== profile.gender ||
        birthDate !== profile.birth_date ||
        status !== profile.status ||
        currentMajor !== profile.major ||
        currentEmail !== profile.email ||
        JSON.stringify(selectedInterests.sort()) !== JSON.stringify((profile.interests || []).sort()) ||
        bio !== (profile.bio || "") ||
        previewUrl !== (profile.image_url || "")
    );
  }, [profile, fullName, phone1, phone2, phone3, gender, birthDate, status, majorSelection, customMajor, emailId, emailDomainInput, selectedInterests, bio, previewUrl]);

  // --- Handlers ---
  const handlePhoneChange = (part: 1 | 2 | 3, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (part === 1) { setPhone1(cleaned); if (cleaned.length === 3) phone2Ref.current?.focus(); }
    else if (part === 2) { setPhone2(cleaned); if (cleaned.length === 4) phone3Ref.current?.focus(); }
    else { setPhone3(cleaned); }
  };

  const handleDomainSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '직접 입력') {
        setIsCustomDomain(true);
        setEmailDomainInput('');
    } else {
        setIsCustomDomain(false);
        setEmailDomainInput(selected);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    if (!confirm(UI_TEXT.ERRORS.CONFIRM_DELETE)) return;
    setImageFile(null);
    setPreviewUrl("");
  };

  const deleteImageFromStorage = async (url: string) => {
    try {
        const path = url.split('/images/')[1];
        if (path) await supabase.storage.from('images').remove([path]);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!profile) return;
    // 필수 항목 체크에서 studentId 제외 (수정 불가하므로)
    if (!fullName || !phone1 || !phone2 || !phone3 || !emailId || !emailDomainInput) {
        return alert(UI_TEXT.ERRORS.INVALID_INPUT);
    }

    setSaving(true);
    try {
        let finalImageUrl = previewUrl;
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `profiles/${profile.id}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, imageFile);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            finalImageUrl = data.publicUrl;
        } else if (!previewUrl) {
            finalImageUrl = "";
        }

        const finalPhone = `${phone1}${phone2}${phone3}`;
        const finalMajor = majorSelection === '직접 입력' ? customMajor : majorSelection;
        const finalEmail = `${emailId}@${emailDomainInput}`;

        // 학번(student_id)은 업데이트하지 않음
        const { error } = await supabase.from('profiles').update({
            full_name: fullName, phone: finalPhone, gender, birth_date: birthDate,
            status, major: finalMajor, email: finalEmail, interests: selectedInterests,
            bio, image_url: finalImageUrl || null,
        }).eq('id', profile.id);

        if (error) throw error;
        if (originalImageUrl && originalImageUrl !== finalImageUrl) {
            await deleteImageFromStorage(originalImageUrl);
        }

        alert(UI_TEXT.ERRORS.SAVE_SUCCESS);
        setOriginalImageUrl(finalImageUrl);
        setImageFile(null);
        setProfile({ ...profile, full_name: fullName, phone: finalPhone, gender, birth_date: birthDate, status, major: finalMajor, email: finalEmail, interests: selectedInterests, bio, image_url: finalImageUrl || null });
        router.refresh();

    } catch (error: any) {
        alert(UI_TEXT.ERRORS.SAVE_FAILED + " (" + error.message + ")");
    } finally {
        setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
        if (confirm(UI_TEXT.ERRORS.CONFIRM_EXIT)) router.back();
    } else router.back();
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto min-h-screen text-white">
      {/* 1. 헤더 (PageHeader 사용) */}
      <PageHeader content={UI_TEXT.HEADERS.MYPAGE} />

      <div className="space-y-8">
        
        {/* 프로필 사진 (ProfileUploader 사용) */}
        <MotionWrapper delay={0.1}>
            <ProfileUploader 
                previewUrl={previewUrl} 
                onImageChange={handleImageChange} 
                onDelete={handleDeleteImage} 
            />
        </MotionWrapper>

        {/* 이름 & 학번 */}
        <MotionWrapper delay={0.2} className="grid grid-cols-2 gap-4">
            <FormInput label="이름" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <FormInput label="학번 (수정불가)" value={studentId} disabled className="text-zinc-500 cursor-not-allowed" />
        </MotionWrapper>

        {/* 연락처 */}
        <MotionWrapper delay={0.3}>
            <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">휴대전화 번호</label>
            <div className="flex items-center gap-2">
                <FormInput value={phone1} onChange={(e) => handlePhoneChange(1, e.target.value)} maxLength={3} />
                <span className="text-zinc-500">-</span>
                <FormInput ref={phone2Ref} value={phone2} onChange={(e) => handlePhoneChange(2, e.target.value)} maxLength={4} />
                <span className="text-zinc-500">-</span>
                <FormInput ref={phone3Ref} value={phone3} onChange={(e) => handlePhoneChange(3, e.target.value)} maxLength={4} />
            </div>
        </MotionWrapper>

        {/* 성별 & 학적 */}
        <MotionWrapper delay={0.4} className="grid grid-cols-2 gap-4">
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
                <FormSelect label="학적 상태" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
        </MotionWrapper>

        {/* 생년월일 & 전공 */}
        <MotionWrapper delay={0.5} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">생년월일</label>
                <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer relative h-[52px]" onClick={() => dateInputRef.current?.showPicker()}>
                    <span className={`text-sm ${birthDate ? 'text-white' : 'text-zinc-500'}`}>{birthDate || 'YYYY-MM-DD'}</span>
                    <Calendar className="text-zinc-500" size={18} />
                    <input ref={dateInputRef} type="date" className="absolute inset-0 opacity-0 pointer-events-none" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                </div>
            </div>
            <div>
                <FormSelect label="전공" options={MAJOR_OPTIONS} value={majorSelection} onChange={(e) => setMajorSelection(e.target.value)} />
                {majorSelection === '직접 입력' && (
                    <FormInput className="mt-2" placeholder="전공 입력" value={customMajor} onChange={(e) => setCustomMajor(e.target.value)} />
                )}
            </div>
        </MotionWrapper>

        {/* 관심분야 & 자기소개 */}
        <MotionWrapper delay={0.6} className="space-y-6">
            <TagSelector 
                label="관심 분야" 
                options={INTEREST_OPTIONS} 
                selected={selectedInterests} 
                onToggle={toggleInterest} 
            />
            
            {/* 이메일 */}
            <div>
                <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">이메일</label>
                <div className="flex gap-2 items-center">
                    <FormInput value={emailId} onChange={(e) => setEmailId(e.target.value)} className="flex-1" />
                    <span className="text-zinc-400 font-bold">@</span>
                    <FormInput value={emailDomainInput} onChange={(e) => setEmailDomainInput(e.target.value)} disabled={!isCustomDomain} className="flex-1" />
                    <div className="relative w-32">
                        <select className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={handleDomainSelect} value={isCustomDomain ? '직접 입력' : emailDomainInput}>
                            {EMAIL_DOMAINS.map(d => <option key={d} value={d} className="bg-zinc-900">{d}</option>)}
                        </select>
                        <div className="w-full h-[52px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center pointer-events-none">
                            <ChevronDown className="text-zinc-500" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-1 ml-1 font-bold">자기소개</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-navy outline-none transition resize-none text-center" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
        </MotionWrapper>

        {/* 7. 참여 활동 섹션 */}
        <MotionWrapper delay={0.7} className="border-t border-white/10 pt-8 mt-8">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">Participated Activities</h2>

            {/* Projects */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2"><FolderKanban size={16}/> Projects</h3>
                {myProjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {myProjects.map((item: any, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition">
                                <div>
                                    <h4 className="font-bold text-white">{item.projects?.title}</h4>
                                    <div className="text-xs text-zinc-400 mt-1 flex gap-2">
                                        <span className="bg-white/10 px-2 py-0.5 rounded">{item.role.toUpperCase()}</span>
                                        <span>{item.projects?.status === 'ongoing' ? '진행중' : '완료'}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-500">{item.projects?.start_date?.split('-')[0] || ''}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5 text-zinc-500 text-sm">참여한 프로젝트가 없습니다.</div>
                )}
            </div>

            {/* Performances */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2"><Trophy size={16}/> Performances</h3>
                {myPerformances.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {myPerformances.map((item: any, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition">
                                <div>
                                    <h4 className="font-bold text-white">{item.performances?.title}</h4>
                                    <div className="text-xs text-zinc-400 mt-1 flex gap-2">
                                        <span className="bg-navy/50 text-white px-2 py-0.5 rounded border border-navy">{item.performances?.category.toUpperCase()}</span>
                                        <span>{item.performances?.date}</span>
                                    </div>
                                </div>
                                {item.performances?.award_grade && <div className="text-xs font-bold text-yellow-400">{item.performances.award_grade}</div>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5 text-zinc-500 text-sm">등록된 실적이 없습니다.</div>
                )}
            </div>
        </MotionWrapper>

        {/* 8. 버튼 영역 */}
        <MotionWrapper delay={0.8} className="pt-4 flex gap-3">
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-navy hover:bg-white hover:text-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-navy/30 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={18} /> {saving ? "저장 중..." : "변경사항 저장"}
            </button>
            <button onClick={handleBack} className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/10 text-zinc-400 transition flex items-center gap-2" title="나가기">
                <ArrowLeft size={18} /> 나가기
            </button>
        </MotionWrapper>

      </div>
    </main>
  );
}