// src/types/db.ts

// --- ENUM Types ---
export type ScheduleType = "seminar" | "event" | "deadline" | "meeting";
export type ProjectStatus = "ongoing" | "finished";
export type PerformanceCategory = "award" | "paper" | "patent";
export type PaperType = "SCIE" | "KCI" | "Conference" | "Patent";

export type UserStatus = "재학" | "졸업" | "휴학"; 
export type UserRole = "president" | "vice_president" | "member" | "pending"; 
export type UserAuthority = "admin" | "user";

export type ProjectRole = "leader" | "member";

// 링크 - 프로젝트나 실적 관련 링크 
export interface LinkItem {
  title: string;
  url: string;
}

// --- Tables ---

// 1. 프로필 (profiles)
export interface Profile {
  id: string;
  full_name: string;
  student_id: string;
  phone: string;
  major: string;
  gender: string;
  birth_date: string;
  
  status: UserStatus;
  role: UserRole;
  authority: UserAuthority;

  bio?: string | null;
  interests?: string[] | null;
  image_url?: string | null;
  email?: string;
  created_at: string;
}

// 2. 스케줄 (schedules)
export interface Schedule {
  id: number;
  title: string;
  date: string;
  time: string;
  place: string;
  type: ScheduleType;
  created_at: string;
}

// 3. 프로젝트 (projects)
export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  image_url?: string | null;
  tags?: string[] | null;
  links?: LinkItem[] | null;
  created_at: string;
  start_date?: string | null;
  end_date?: string | null;
  members?: {
    user_id: string;
    role: ProjectRole;
    profiles: Profile;
  }[];
}

// 4. 게시물 (posts)
export interface Post {
  id: number;
  title: string;
  content: string;
  thumbnail?: string | null;
  date: string;
  author_id: string;
  created_at: string;
  author?: Profile | null;
}

// 5. 실적 (performances)
export interface Performance {
  id: string;
  category: PerformanceCategory;
  date: string;
  title: string;
  award_grade?: string | null;
  organizer?: string | null;
  paper_type?: PaperType | null;
  journal?: string | null;
  number?: string | null;
  
  // 링크 배열
  links?: LinkItem[] | null;
  
  created_at: string;
  members?: {
    user_id: string;
    profiles: Profile;
  }[];
}

// 6. 연혁 (histories)
export interface History {
  id: number;
  date: string;
  title: string;
  description?: string | null;
  tags?: string[] | null;
  created_at: string;
}