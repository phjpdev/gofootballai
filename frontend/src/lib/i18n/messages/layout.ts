import { defineMessages } from "../define";

/** Site chrome: navigation, header, footer, language switch, shared pickers. */
export const layout = defineMessages({
  "zh-HK": {
    nav: {
      home: "首頁",
      analysis: "賽事分析",
      records: "紀錄",
      member: "會員",
      manage: "管理",
      telegram: "聯絡我們",
      mainNavigation: "主要導覽",
    },
    logout: "登出",
    language: {
      label: "語言",
      switchTo: "Switch to English",
      zh: "中",
      en: "EN",
    },
    footer: {
      tagline:
        "專為香港球迷打造的 2026 世界盃 AI 分析平台，提供賽事預測、戰術數據及會員最新資訊。",
      siteNav: "網站導覽",
      legal: "法律條款",
      termsOfService: "服務條款",
      privacy: "私隱政策",
      contentPolicy: "內容政策",
      refundPolicy: "退款政策",
      copyright: (year: number) => `© ${year} Go Football AI。版權所有。`,
    },
    datePickerAll: "全部",
    periodTabs: {
      "1d": "1日",
      "1w": "1週",
      "1m": "1月",
      "1y": "1年",
      all: "全部",
    },
    metaDescription:
      "專為香港球迷而設的 2026 世界盃 AI 分析平台，提供賽事預測、戰術拆解、球隊數據及會員最新資訊。",
  },
  en: {
    nav: {
      home: "Home",
      analysis: "Analysis",
      records: "Records",
      member: "Member",
      manage: "Admin",
      telegram: "Contact us",
      mainNavigation: "Main navigation",
    },
    logout: "Log out",
    language: {
      label: "Language",
      switchTo: "切換至中文",
      zh: "中",
      en: "EN",
    },
    footer: {
      tagline:
        "The 2026 World Cup AI analysis platform built for Hong Kong football fans, with match predictions, tactical data and member updates.",
      siteNav: "Site",
      legal: "Legal",
      termsOfService: "Terms of Service",
      privacy: "Privacy Policy",
      contentPolicy: "Content Policy",
      refundPolicy: "Refund Policy",
      copyright: (year: number) => `© ${year} Go Football AI. All rights reserved.`,
    },
    datePickerAll: "All",
    periodTabs: {
      "1d": "1D",
      "1w": "1W",
      "1m": "1M",
      "1y": "1Y",
      all: "All",
    },
    metaDescription:
      "The 2026 World Cup AI analysis platform for Hong Kong football fans: match predictions, tactical breakdowns, team data and member updates.",
  },
});
