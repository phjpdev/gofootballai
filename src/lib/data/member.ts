import type { QAItem } from "@/types";

export const QA_ITEMS: QAItem[] = [
  {
    id: "qa-1",
    question: "What is GoFootball.ai?",
    answer:
      "GoFootball.ai is an AI-powered football analytics platform that delivers match analysis, performance insights, and data-driven predictions for players, coaches, and fans.",
  },
  {
    id: "qa-2",
    question: "How does the Analysis feature work?",
    answer:
      "Select a date to view scheduled matches, then tap any match to see detailed AI analysis including xG charts, player performance metrics, and tactical breakdowns.",
  },
  {
    id: "qa-3",
    question: "Who can post on the Records page?",
    answer:
      "Only administrators can upload photos, videos, and announcements. All published content appears on the Home page for every user.",
  },
  {
    id: "qa-4",
    question: "How do I become an admin?",
    answer:
      "Contact the GoFootball.ai team to request admin access. Once approved, you can log in from the Member page.",
  },
];

export const POLICY_SECTIONS = [
  {
    title: "Terms of Service",
    content:
      "By using GoFootball.ai, you agree to use the platform for lawful purposes only. Match data and AI insights are provided for informational purposes and should not be used as the sole basis for betting or financial decisions.",
  },
  {
    title: "Privacy Policy",
    content:
      "We collect minimal usage data to improve our AI models. Personal information is never sold to third parties. Admin-uploaded media is stored securely and displayed publicly on the Home feed.",
  },
  {
    title: "Content Policy",
    content:
      "Administrators must only upload football-related content. Offensive, copyrighted, or misleading material will be removed. Users may report inappropriate posts through the Member page.",
  },
];
