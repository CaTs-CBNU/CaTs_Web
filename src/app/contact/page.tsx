"use client";

import Image from "next/image";
import { Mail, MapPin, Building2 } from "lucide-react";
import MotionWrapper from "@/components/MotionWrapper"; // ✅ MotionWrapper 적용

export default function ContactPage() {
  const cardBase = "rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-md p-8";

  return (
    <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto text-white min-h-screen">
      
      {/* 헤더 섹션 */}
      <MotionWrapper className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy/30 blur-[100px] rounded-full -z-10 pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white">
          Contact Us
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Collaborating and Technology Studio
        </p>
      </MotionWrapper>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* 왼쪽: 연락처 정보 & QR 코드 */}
        <div className="flex flex-col gap-8">
          
          {/* 정보 카드 */}
          <MotionWrapper delay={0.2} className={`${cardBase} flex-1`}>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-white">
              <span>CATS</span> Information
            </h2>

            <div className="space-y-8">
              {/* 주소 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white shrink-0 shadow-lg shadow-navy/40">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-white">Location</div>
                  <p className="text-zinc-300 leading-relaxed">
                    충청북도 청주시 서원구 충대로 1 <br />
                    충북대학교 공과 대학 본관 (E8-1) 3층 44-342호
                  </p>
                  <p className="text-zinc-500 text-sm mt-2">
                    * 공학교육혁신센터 인근
                  </p>
                </div>
              </div>

              {/* 이메일 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white shrink-0 shadow-lg shadow-navy/40">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg mb-1 text-white">Email</div>
                  <a 
                    href="mailto:aries043@chungbuk.ac.kr" 
                    className="text-zinc-300 hover:text-white hover:underline transition text-lg"
                  >
                    aries043@chungbuk.ac.kr
                  </a>
                </div>
              </div>
            </div>
          </MotionWrapper>

          {/* QR 코드 카드 */}
          <MotionWrapper delay={0.3} className={`${cardBase} flex flex-col items-center justify-center text-center`}>
            <div className="relative w-48 h-48 bg-white p-2 rounded-xl mb-4 shadow-inner">
              <Image 
                src="/cats_kakao_qrcode.png"
                alt="CATS Kakao Channel QR"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-white">CATS KAKAO CHANNEL</h3>
            <p className="text-zinc-400 text-sm mt-1">QR코드를 스캔하여 문의해주세요.</p>
          </MotionWrapper>
        </div>

        {/* 오른쪽: 지도 */}
        <MotionWrapper 
            delay={0.4}
            className="rounded-[32px] border border-white/10 bg-white/5 p-2 backdrop-blur-md h-[500px] lg:h-auto overflow-hidden relative"
        >
            <iframe
              src="https://www.google.com/maps?q=JFG5%2BM8+청주시+충청북도&output=embed"              
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '24px', filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Club Location Map"
            ></iframe>
            
            <div className="absolute top-6 left-6 bg-navy/90 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg text-white">
               <Building2 size={14} className="text-white"/> E8-1 공과대학 본관
            </div>
        </MotionWrapper>

      </div>
    </main>
  );
}