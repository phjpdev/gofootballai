import type { Locale } from "@/lib/i18n/config";
import type { QAItem } from "@/types";

type LocalizedQAItem = QAItem & {
  questionEn: string;
  answerEn: string;
};

const QA_ITEMS: LocalizedQAItem[] = [
  {
    id: "qa-1",
    question: "這個APP的分析準確率如何？",
    answer:
      "我們使用先進AI模型，結合海量歷史數據、即時球隊狀態與多維度分析，為每一場賽事提供信心指數（80%–90%+）。所有預測均基於數據驅動，幫助用戶找出高價值投注機會，長期回報更穩定。",
    questionEn: "How accurate is the app's analysis?",
    answerEn:
      "We use advanced AI models that combine extensive historical data, real-time team form and multi-dimensional analysis to give every match a confidence index (80%–90%+). Every prediction is data-driven, helping users find high-value betting opportunities for steadier long-term returns.",
  },
  {
    id: "qa-2",
    question: "APP支援哪些聯賽和賽事？",
    answer:
      "覆蓋全球主要聯賽，包括英超、歐冠、西甲、意甲、德甲、世界杯、歐洲國家聯賽等，幾乎每日都有最新賽事分析更新。",
    questionEn: "Which leagues and competitions does the app cover?",
    answerEn:
      "We cover the world's major leagues and competitions, including the Premier League, Champions League, La Liga, Serie A, Bundesliga, World Cup and UEFA Nations League, with new match analysis almost every day.",
  },
  {
    id: "qa-3",
    question: "這個APP的數據來源是什麼？",
    answer:
      "數據來自多個可靠渠道，包括官方聯賽數據、國際知名數據供應商、歷史交鋒紀錄、即時傷停資訊及球隊最新動態。我們經過嚴格清洗與交叉驗證，確保數據準確及時。",
    questionEn: "Where does the app's data come from?",
    answerEn:
      "Our data comes from multiple reliable sources, including official league data, well-known international data providers, head-to-head records, live injury and suspension news, and the latest team updates. It is rigorously cleaned and cross-checked to keep it accurate and up to date.",
  },
  {
    id: "qa-4",
    question: "與市面上其他足球分析APP有什麼差別？",
    answer:
      "• 更精準的信心指數：不只給結果，還清楚標示每場比賽的信心程度\n• 真實會員營利紀錄：透明展示用戶實際成果，而非只講空洞勝率\n• 堅持理性分析：拒絕代投注、毒會等不良服務，專注長期價值投注\n• 簡單易用：新手友好，介面乾淨，無需複雜操作\n• 本地化優勢：針對香港用戶習慣，支援亞盤、讓球、總入球等常用玩法分析",
    questionEn: "How is it different from other football analysis apps?",
    answerEn:
      "• A more precise confidence index: we don't just give a result, we clearly show how confident we are in every match\n• Real member profit records: members' actual results shown openly, not empty win-rate claims\n• Rational analysis only: no betting on your behalf, no shady tipster syndicates, just long-term value betting\n• Easy to use: beginner-friendly, with a clean interface and no complicated steps\n• Built for Hong Kong: designed around local betting habits, covering popular markets such as Asian handicap, handicap and total goals",
  },
  {
    id: "qa-5",
    question: "分析內容更新頻率如何？",
    answer:
      "每日即時更新。賽前至少12小時提供詳細分析，重要賽事會在開賽前1–3小時進行最後確認與更新，讓你永遠掌握最新球隊動態與數據變化。",
    questionEn: "How often is the analysis updated?",
    answerEn:
      "Every day, in real time. Detailed analysis is published at least 12 hours before each match, and key matches get a final check and update 1–3 hours before kick-off, so you always have the latest team news and data.",
  },
  {
    id: "qa-6",
    question: "什麼是「會員營利紀錄」？",
    answer:
      "會員營利紀錄會透明展示真實用戶的使用成果與盈利統計，讓新用戶能清楚看到其他會員的實際表現，增加信任感（資料已作適當匿名處理）。",
    questionEn: "What are “member profit records”?",
    answerEn:
      "Member profit records openly show real users' results and profit statistics, so new users can clearly see how other members are actually doing and know they can trust us (all data is suitably anonymised).",
  },
  {
    id: "qa-7",
    question: "新手容易上手嗎？",
    answer:
      "非常簡單易用！介面設計簡潔直觀，即使是第一次使用的朋友也能快速掌握。提供智慧推薦與信心指數，一目了然。",
    questionEn: "Is it easy for beginners?",
    answerEn:
      "Very easy! The interface is clean and intuitive, so even first-time users pick it up quickly. Smart picks and confidence indexes make everything clear at a glance.",
  },
  {
    id: "qa-9",
    question: "APP是否支援賽馬分析？",
    answer:
      "足球專屬的白金計劃只包含足球分析；若想同時使用足球+賽馬，請選擇鑽石計劃。",
    questionEn: "Does the app cover horse racing?",
    answerEn:
      "The football-only Platinum plan includes football analysis only. For both football and horse racing, choose the Diamond plan.",
  },
  {
    id: "qa-10",
    question: "如何聯絡Go Football？",
    answer:
      "歡迎隨時透過以下方式聯絡我們：\nAPP內「聯絡我們」或「客服」功能\nTelegram：@gofootballai",
    questionEn: "How do I contact Go Football?",
    answerEn:
      "You're welcome to reach us any time via:\nThe in-app “Contact us” or “Customer service” feature\nTelegram: @gofootballai",
  },
];

/** Ids are page anchors (the footer links to /member#<id>); keep them unchanged. */
const POLICY_SECTIONS = [
  {
    id: "terms-of-service",
    title: "服務條款",
    content:
      "使用 GO Football AI 即表示你同意僅以合法方式使用本平台。賽事數據及 AI 分析僅供參考，不應作為投注或財務決策的唯一依據。",
    titleEn: "Terms of Service",
    contentEn:
      "By using GO Football AI, you agree to use the platform only in a lawful manner. Match data and AI analysis are for reference only and should not be the sole basis for any betting or financial decision.",
  },
  {
    id: "privacy",
    title: "私隱政策",
    content:
      "我們僅收集改善 AI 模型所需的最少使用數據，絕不會向第三方出售個人資料。管理員上傳的媒體會安全儲存，並公開顯示於首頁動態。",
    titleEn: "Privacy Policy",
    contentEn:
      "We collect only the minimum usage data needed to improve our AI models and will never sell personal data to third parties. Media uploaded by admins is stored securely and displayed publicly in the home page feed.",
  },
  {
    id: "content-policy",
    title: "內容政策",
    content:
      "管理員只可上傳與 2026 世界盃及足球相關的內容。冒犯性、侵權或誤導性資料將被移除。如有不當內容，可透過會員頁面反映。",
    titleEn: "Content Policy",
    contentEn:
      "Admins may upload only content related to the 2026 World Cup and football. Offensive, infringing or misleading material will be removed. Inappropriate content can be reported via the Member page.",
  },
  {
    id: "refund-policy",
    title: "退款政策",
    content:
      "若為訂閱制服務，您可隨時取消下期訂閱，當期已產生的費用恕不退還。",
    titleEn: "Refund Policy",
    contentEn:
      "For subscription services, you may cancel your subscription for the next billing period at any time. Fees already incurred for the current period are non-refundable.",
  },
] as const;

const BETTING_DISCLAIMER: Record<Locale, string> = {
  "zh-HK":
    "所有分析僅供參考，請在香港賽馬會（HKJC）進行合法投注。\n博彩要有節制，量力而為。\n未滿十八歲人士不得投注或進入投注場所。\n向非法或海外莊家下注屬違法行為，一經定罪可被判監禁。\n切勿沉迷賭博。如需尋求輔導協助，請致電平和基金熱線：1834 633。",
  en:
    "All analysis is for reference only. Please bet legally with the Hong Kong Jockey Club (HKJC).\nBet responsibly and within your means.\nPersons under the age of 18 may not bet or enter betting premises.\nBetting with illegal or overseas bookmakers is an offence; offenders are liable to imprisonment on conviction.\nDon't let gambling take over your life. For counselling, call the Ping Wo Fund hotline: 1834 633.",
};

export function getQaItems(locale: Locale): QAItem[] {
  return QA_ITEMS.map((item) => ({
    id: item.id,
    question: locale === "en" ? item.questionEn : item.question,
    answer: locale === "en" ? item.answerEn : item.answer,
  }));
}

export function getPolicySections(
  locale: Locale,
): { id: string; title: string; content: string }[] {
  return POLICY_SECTIONS.map((section) => ({
    id: section.id,
    title: locale === "en" ? section.titleEn : section.title,
    content: locale === "en" ? section.contentEn : section.content,
  }));
}

export function getBettingDisclaimer(locale: Locale): string {
  return BETTING_DISCLAIMER[locale];
}
