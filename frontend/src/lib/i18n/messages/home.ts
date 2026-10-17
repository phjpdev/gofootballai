import { defineMessages } from "../define";

/** /home onboarding (mobile pager + desktop sections) and its admin section editor. */
export const home = defineMessages({
  "zh-HK": {
    sectionLabels: {
      hero: "首頁英雄區",
      score: "精準分析",
      daily: "全球聯賽",
      metrics: "專業分析",
      records: "會員紀錄",
      rating: "5星體驗",
    },
    hero: {
      ctaFallback: "立即開始",
      desktopCtaFallback: "開始分析",
      loginPromptFallback: "已有帳戶？",
      loginLinkFallback: "登入",
    },
    imageAlt: {
      score: "AI 賽事分析預覽",
      daily: "全球聯賽賽事列表預覽",
      metrics: "賽事數據分析預覽",
      records: "會員營利紀錄預覽",
      rating: "5星級評分",
    },
    pageNav: {
      prev: "上一頁",
      next: "下一頁",
      progress: "頁面進度",
    },
    desktopCta: {
      eyebrow: "準備好了嗎？",
      title: "立即體驗 AI 足球分析",
      description:
        "加入 GO Football AI，用數據與演算法找出高信心賽事，建立屬於你的理性投注優勢。",
      start: "開始分析",
      login: "會員登入",
    },
    editButton: "編輯區塊內容",
    editor: {
      heading: (label: string) => `編輯${label}`,
      subtitle: "更新此區塊的文字與圖片，所有用戶將會看到最新內容。",
      eyebrow: "副標題",
      eyebrowPlaceholder: "例如：GO Football AI",
      eyebrowEn: "副標題（英文，選填）",
      eyebrowEnPlaceholder: "例如：GO Football AI",
      title: "標題",
      titlePlaceholder: "區塊標題",
      titleEn: "標題（英文，選填）",
      titleEnPlaceholder: "英文區塊標題",
      description: "描述",
      descriptionPlaceholder: "區塊描述",
      descriptionEn: "描述（英文，選填）",
      descriptionEnPlaceholder: "英文區塊描述",
      ctaText: "按鈕文字",
      ctaTextPlaceholder: "例如：立即開始",
      ctaTextEn: "按鈕文字（英文，選填）",
      ctaTextEnPlaceholder: "例如：Get started",
      loginPrompt: "登入提示",
      loginPromptPlaceholder: "例如：已有帳戶？",
      loginPromptEn: "登入提示（英文，選填）",
      loginPromptEnPlaceholder: "例如：Already have an account?",
      loginLinkText: "登入連結文字",
      loginLinkTextPlaceholder: "例如：登入",
      loginLinkTextEn: "登入連結文字（英文，選填）",
      loginLinkTextEnPlaceholder: "例如：Log in",
      image: "區塊圖片",
      upload: "上傳圖片",
      errors: {
        titleAndDescription: "請填寫標題與描述",
        heroFields: "請填寫首頁英雄區所有文字欄位",
        saveFailed: "儲存失敗",
      },
    },
    postFeed: {
      title: "最新動態",
      empty: "暫無最新資訊，管理員上傳後會顯示於此。",
    },
    systemIntro: {
      title: "2026 世界盃 AI 分析平台",
      description:
        "專為香港球迷而設，一站式掌握世界盃賽程、AI 戰術分析、球隊數據及最新會員資訊。",
      features: {
        analysis: {
          title: "AI 賽事分析",
          description:
            "深度學習模型即時拆解每一腳傳球、射門與戰術變化，掌握 2026 世界盃每場對決。",
        },
        tracking: {
          title: "數據追蹤",
          description:
            "xG 圖表、控球率、球員評分及進攻威脅指數，賽事中即時更新。",
        },
        prediction: {
          title: "專業預測",
          description:
            "結合歷史數據與 AI 模型，為香港球迷提供可靠的賽果參考與戰術洞察。",
        },
      },
    },
  },
  en: {
    sectionLabels: {
      hero: "Hero section",
      score: "Precision analysis",
      daily: "Global leagues",
      metrics: "Expert analysis",
      records: "Member records",
      rating: "5-star experience",
    },
    hero: {
      ctaFallback: "Get started",
      desktopCtaFallback: "Start analysing",
      loginPromptFallback: "Already have an account?",
      loginLinkFallback: "Log in",
    },
    imageAlt: {
      score: "AI match analysis preview",
      daily: "Preview of the global league match list",
      metrics: "Match data analysis preview",
      records: "Member profit records preview",
      rating: "5-star rating",
    },
    pageNav: {
      prev: "Previous page",
      next: "Next page",
      progress: "Page progress",
    },
    desktopCta: {
      eyebrow: "Ready to go?",
      title: "Try AI football analysis today",
      description:
        "Join GO Football AI and let data and algorithms find high-confidence matches, so you can build your own disciplined betting edge.",
      start: "Start analysing",
      login: "Member login",
    },
    editButton: "Edit section content",
    editor: {
      heading: (label: string) => `Edit section: ${label}`,
      subtitle:
        "Update this section's text and image. All users will see the latest content.",
      eyebrow: "Subtitle (Chinese)",
      eyebrowPlaceholder: "e.g. GO Football AI",
      eyebrowEn: "Subtitle (English, optional)",
      eyebrowEnPlaceholder: "e.g. GO Football AI",
      title: "Title (Chinese)",
      titlePlaceholder: "Section title",
      titleEn: "Title (English, optional)",
      titleEnPlaceholder: "Section title in English",
      description: "Description (Chinese)",
      descriptionPlaceholder: "Section description",
      descriptionEn: "Description (English, optional)",
      descriptionEnPlaceholder: "Section description in English",
      ctaText: "Button text (Chinese)",
      ctaTextPlaceholder: "e.g. 立即開始",
      ctaTextEn: "Button text (English, optional)",
      ctaTextEnPlaceholder: "e.g. Get started",
      loginPrompt: "Login prompt (Chinese)",
      loginPromptPlaceholder: "e.g. 已有帳戶？",
      loginPromptEn: "Login prompt (English, optional)",
      loginPromptEnPlaceholder: "e.g. Already have an account?",
      loginLinkText: "Login link text (Chinese)",
      loginLinkTextPlaceholder: "e.g. 登入",
      loginLinkTextEn: "Login link text (English, optional)",
      loginLinkTextEnPlaceholder: "e.g. Log in",
      image: "Section image",
      upload: "Upload image",
      errors: {
        titleAndDescription: "Please enter a title and description.",
        heroFields: "Please fill in every text field in the hero section.",
        saveFailed: "Couldn't save. Please try again.",
      },
    },
    postFeed: {
      title: "Latest updates",
      empty: "No updates yet. They'll appear here once an admin posts them.",
    },
    systemIntro: {
      title: "2026 World Cup AI analysis platform",
      description:
        "Built for Hong Kong fans: World Cup fixtures, AI tactical analysis, team data and the latest member news, all in one place.",
      features: {
        analysis: {
          title: "AI match analysis",
          description:
            "Deep-learning models break down every pass, shot and tactical shift in real time, so you can follow every 2026 World Cup clash.",
        },
        tracking: {
          title: "Data tracking",
          description:
            "xG charts, possession, player ratings and attacking threat index, updated live during matches.",
        },
        prediction: {
          title: "Expert predictions",
          description:
            "Historical data and AI models combine to give Hong Kong fans reliable result guidance and tactical insight.",
        },
      },
    },
  },
});
