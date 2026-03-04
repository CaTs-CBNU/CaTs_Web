"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;      // /intro.mp4 같은 경로
  onDone: () => void;   // 인트로 끝났을 때 호출
};

export default function IntroVideoOverlay({ src, onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [phase, setPhase] = useState<"show" | "fade">("show");

  // ✅ 1. 스크롤 잠금 및 해제 처리
  useEffect(() => {
    // 마운트 시 스크롤 잠금
    document.body.style.overflow = "hidden";

    return () => {
      // 언마운트 시 스크롤 복구
      document.body.style.overflow = "";
    };
  }, []);

  // 종료 처리 함수 (자연스럽게 페이드아웃)
  const finishIntro = () => {
    setPhase("fade");
    // fade 애니메이션(700ms) 후 onDone 호출
    setTimeout(() => {
      onDone();
    }, 700);
  };

  // ✅ 2. 비디오가 끝났을 때 자동 종료
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.addEventListener("ended", finishIntro);
    return () => v.removeEventListener("ended", finishIntro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 3. 클릭 시 스킵 핸들러
  const handleSkip = () => {
    if (phase === "fade") return; // 이미 종료 중이면 무시
    
    // 비디오 즉시 정지 (소리/화면 멈춤)
    if (videoRef.current) {
      videoRef.current.pause();
    }
    finishIntro();
  };

  return (
    <div
      onClick={handleSkip} // ✅ 화면 클릭 시 스킵
      className={[
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-black", // ✅ 완전 검은색 배경 + 클릭 가능 커서
        "transition-opacity duration-700",
        phase === "fade" ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      {/* ✅ 경계 모호하게 만들기 전략:
        1. 둥근 모서리(rounded) 제거
        2. 너비 제한을 풀거나, 배경 블러(Ambilight 효과)를 통해 검은 배경과 섞이게 함
      */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">  
      <div className="absolute inset-0 bg-black/40" />

        {/* ✅ 실제 재생되는 메인 비디오 */}
        <video
          ref={videoRef}
          // max-w, max-h를 사용하여 원본 비율 유지하면서 화면 안에 들어오게 함
          className="relative z-10 w-full max-w-5xl max-h-screen object-contain shadow-2xl"
          src={src}
          muted
          playsInline
          autoPlay
          controls={false}
        />

        {/* ✅ 노이즈(그레인) + 비네팅 오버레이 (퀄리티 보정) */}
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* 그레인 */}
          <div
            className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E\")",
            }}
          />
          {/* 비네팅: 외곽을 어둡게 눌러줌 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        {/* 스킵 안내 문구 (선택 사항 - 필요 없으면 삭제 가능) */}
        <div className="absolute bottom-10 z-30 text-white/30 text-sm animate-pulse">
          Click anywhere to skip
        </div>
      </div>
    </div>
  );
}