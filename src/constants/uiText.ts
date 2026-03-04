// src/constants/uiText.ts

export const UI_TEXT = {
  // 1. 헤더 (PageHeader용)
  HEADERS: {
    ABOUT: {
      title: "About CaTs",
      desc: "우리는 기술을 통해 더 나은 세상을 고민하고,\n함께 성장하며 미래를 만들어가는 컴퓨터공학과 동아리입니다."
    },
    MEMBERS: {
      title: "Members",
      desc: "CaTs 멤버들의 이야기를 들려드립니다"
    },
    HISTORY: {
      title: "History",
      desc: "CaTs의 발자취를 로드맵 형태로 정리했습니다"
    },
    SEMINAR: {
      title: "Seminar Blog",
      desc: "CaTs 멤버들의 기술 연구와 지식 공유 공간입니다."
    },
    PROJECTS: {
      title: "Projects",
      desc: "우리가 함께 만들어낸 결과물들을 소개합니다."
    },
    MYPAGE: {
      title: "My Profile",
      desc: "개인정보와 활동 내역을 확인하세요."
    },
    PERFORMANCE: {
      title: "Performances",
      desc: "대내외 활동을 통해 얻은 값진 성과들입니다."
    }
  },

  // 2. 빈 상태 (EmptyState용)
  EMPTY: {
    NO_SEARCH_RESULT: {
      message: "검색 결과가 없습니다.",
      actionText: "전체 목록 보기"
    },
    NO_DATA_PROJECT: {
      message: "현재 등록된 프로젝트가 없습니다.",
    },
    NO_DATA_PERFORMANCE: {
      message: "해당 카테고리의 실적이 없습니다.",
    },
    NO_DATA_SCHEDULE: {
      message: "등록된 일정이 없습니다.",
      actionText: "예정 목록 보기"
    },
    NO_DATA_HISTORY: {
      message: "등록된 연혁이 없습니다."
    },
    NO_DATA_MEMBERS: {
      message: "해당 부원이 없습니다."
    }
  },

  // 3. 에러 메시지 (공통 관리)
  ERRORS: {
    AUTH_REQUIRED: "로그인이 필요한 서비스입니다.",
    SAVE_SUCCESS: "성공적으로 저장되었습니다.",
    SAVE_FAILED: "저장에 실패했습니다. 다시 시도해주세요.",
    INVALID_INPUT: "필수 정보를 모두 입력해주세요.",
    CONFIRM_DELETE: "정말 삭제하시겠습니까? 복구할 수 없습니다.",
    CONFIRM_EXIT: "변경 사항이 저장되지 않았습니다. 정말 나가시겠습니까?"
  },
  HOME: {
    HERO: {
      EST: "EST. 2023 • Chungbuk Univ.",
      // 줄바꿈은 \n으로 처리 (컴포넌트에서 whitespace-pre-line 사용)
      SUBTITLE: "협업을 통한 기술적 성장을 지향하는\n충북대학교 컴퓨터공학과 학술 동아리 CaTs 입니다.",
      BTN_START: "Start Journey",
      BTN_PROJECTS: "View Projects"
    },
    RECENT_NEWS: {
      TITLE: "Recent News",
      VIEW_ALL: "View All Performances →"
    },
  },
  ABOUT: {
    MAIN_CARD: {
      TITLE: "Collaborating and Technology Studio",
      DESC: "CaTs는 '협업(Collaborating)'과 '기술(Technology)'이 만나는 창작소(Studio)입니다.\n혼자서는 해결하기 어려운 문제들을 다양한 전공자들과 함께 고민하며,\n단순한 코딩을 넘어 서로의 지식을 잇고 새로운 가치를 설계합니다."
    },
    STATS: {
      HISTORY: "YEARS HISTORY",
      MEMBERS: "MEMBERS",
      PROJECTS: "PROJECTS"
    },
    CTA: {
      TITLE: "CaTs와 함께 성장할 준비가 되셨나요?",
      DESC: "열정 있는 여러분의 지원을 기다립니다.",
      BTN_APPLY: "지원하러 가기",
      BTN_CONTACT: "문의하기"
    }
  }
} as const;