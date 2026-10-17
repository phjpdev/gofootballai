import { defineMessages } from "../define";

/** Member page: login/signup form, FAQ and policy headings (long copy lives in lib/data/member.ts). */
export const member = defineMessages({
  "zh-HK": {
    auth: {
      portalTitle: {
        member: "會員登入",
        admin: "管理員登入",
      },
      login: "登入",
      signup: "註冊",
      usernamePlaceholder: "帳戶名稱",
      passwordPlaceholder: "密碼",
      termsPrefix: "點擊「註冊」即表示你同意我們的",
      termsLink: "《服務條款》",
      acceptTermsRequired: "請勾選並同意服務條款",
      genericError: "發生錯誤，請稍後再試",
    },
    faq: {
      title: "常見問題",
      winRateResults: "勝率結果",
    },
    policies: {
      title: "政策條款",
    },
  },
  en: {
    auth: {
      portalTitle: {
        member: "Member login",
        admin: "Admin login",
      },
      login: "Log in",
      signup: "Sign up",
      usernamePlaceholder: "Username",
      passwordPlaceholder: "Password",
      termsPrefix: "By tapping “Sign up”, you agree to our",
      termsLink: "Terms of Service",
      acceptTermsRequired: "Please tick the box to accept the Terms of Service.",
      genericError: "Something went wrong. Please try again later.",
    },
    faq: {
      title: "FAQ",
      winRateResults: "Win-rate results",
    },
    policies: {
      title: "Policies & Terms",
    },
  },
});
