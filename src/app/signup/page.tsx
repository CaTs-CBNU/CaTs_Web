// src/app/signup/page.tsx (서버 컴포넌트)

import { Metadata } from "next";
import SignUpPageContent from "@/components/pages/SignUpPage"; // 방금 만든 컴포넌트 import

export const metadata: Metadata = {
  title: "회원가입 | CaTs",
  description: "CaTs 동아리에 가입하여 함께 성장하세요.",
};

export default function SignUpPage() {
  return <SignUpPageContent />;
}