// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 기존 설정이 있다면 유지 */
  
  // ✅ 아래 images 설정을 추가하세요
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gklmpesbtjhcpmhsxwkr.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**', 
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', 
      },
    ],
  },
};

export default nextConfig;