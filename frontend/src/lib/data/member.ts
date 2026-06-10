import type { QAItem } from "@/types";

export const QA_ITEMS: QAItem[] = [
  {
    id: "qa-1",
    question: "什麼是 GO Football AI？",
    answer:
      "GO Football AI 是專為 2026 世界盃而設的 AI 足球分析平台，為香港球迷提供賽事預測、戰術拆解、球隊數據及最新資訊。",
  },
  {
    id: "qa-2",
    question: "賽事分析功能如何使用？",
    answer:
      "在「賽事分析」頁面選擇日期，即可查看當日賽程。點擊任何一場比賽，即可查看 AI 生成的 xG 圖表、球員表現數據及戰術分析。",
  },
  {
    id: "qa-3",
    question: "誰可以在紀錄頁面上傳內容？",
    answer:
      "只有管理員可以上傳相片、影片及公告。所有已發佈內容會顯示在首頁，供所有會員查閱。",
  },
  {
    id: "qa-4",
    question: "如何成為管理員？",
    answer:
      "請聯絡 GO Football AI 團隊申請管理員權限。獲批後，可使用會員頁面登入並管理用戶及上傳內容。",
  },
];

export const POLICY_SECTIONS = [
  {
    title: "服務條款",
    content:
      "使用 GO Football AI 即表示你同意僅以合法方式使用本平台。賽事數據及 AI 分析僅供參考，不應作為投注或財務決策的唯一依據。",
  },
  {
    title: "私隱政策",
    content:
      "我們僅收集改善 AI 模型所需的最少使用數據，絕不會向第三方出售個人資料。管理員上傳的媒體會安全儲存，並公開顯示於首頁動態。",
  },
  {
    title: "內容政策",
    content:
      "管理員只可上傳與 2026 世界盃及足球相關的內容。冒犯性、侵權或誤導性資料將被移除。如有不當內容，可透過會員頁面反映。",
  },
];
