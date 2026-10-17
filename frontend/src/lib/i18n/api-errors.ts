import { getClientLocale, type Locale } from "./config";

/**
 * The API answers in Chinese. Rather than thread a locale header through every
 * request (and CORS), English readers get these messages mapped here; anything
 * unmapped falls through unchanged, so a new backend message degrades to
 * Chinese instead of breaking.
 */
const EXACT: Record<string, string> = {
  "請求失敗，請稍後再試": "Request failed. Please try again later.",
  "請求無效": "Invalid request.",
  "請求過於頻繁，請稍後再試": "Too many requests. Please try again later.",
  "請先登入": "Please log in first.",
  "登入憑證無效或已過期": "Your login has expired or is invalid. Please log in again.",
  "登入已過期，請重新登入": "Your session has expired. Please log in again.",
  "沒有權限執行此操作": "You don't have permission to do this.",
  "帳戶名稱或密碼不正確": "Incorrect username or password.",
  "帳戶名稱至少需要 3 個字元": "Username must be at least 3 characters.",
  "帳戶名稱最多 32 個字元": "Username can be at most 32 characters.",
  "帳戶名稱只能包含英文字母、數字及底線":
    "Username can only contain letters, numbers and underscores.",
  "密碼至少需要 6 個字元": "Password must be at least 6 characters.",
  "密碼最多 128 個字元": "Password can be at most 128 characters.",
  "此帳戶名稱已被使用": "This username is already taken.",
  "請勾選並同意服務條款": "Please accept the Terms of Service.",
  "此帳戶並非管理員，請前往會員頁面登入。":
    "This account is not an admin. Please log in on the Member page.",
  "此帳戶為管理員，請前往管理頁面登入。":
    "This is an admin account. Please log in on the Admin page.",
  "建立帳戶失敗": "Failed to create account.",
  "建立用戶失敗": "Failed to create user.",
  "更新用戶失敗": "Failed to update user.",
  "找不到用戶": "User not found.",
  "無法刪除自己的帳戶": "You can't delete your own account.",
  "無法移除自己的管理員權限": "You can't remove your own admin rights.",
  "VIP 到期日格式不正確": "Invalid VIP expiry date format.",
  "VIP 到期日必須為未來日期": "VIP expiry date must be in the future.",
  "建立紀錄失敗": "Failed to create record.",
  "更新紀錄失敗": "Failed to update record.",
  "找不到紀錄": "Record not found.",
  "找不到影片紀錄": "Video record not found.",
  "紀錄類型無效": "Invalid record type.",
  "請填寫標題": "Please enter a title.",
  "標題最多 200 個字元": "Title can be at most 200 characters.",
  "英文標題最多 300 個字元": "English title can be at most 300 characters.",
  "請選擇有效日期": "Please choose a valid date.",
  "請提供有效日期": "Please provide a valid date.",
  "請填寫 0 至 5 的星級評分": "Please enter a star rating from 0 to 5.",
  "請上傳相片或影片檔案": "Please upload a photo or video file.",
  "請上傳圖片檔案": "Please upload an image file.",
  "相片紀錄需要圖片檔案": "Photo records need an image file.",
  "影片紀錄需要影片檔案": "Video records need a video file.",
  "更改紀錄類型時請上傳新檔案": "Please upload a new file when changing the record type.",
  "只允許上傳圖片或影片檔案": "Only image or video files can be uploaded.",
  "只支援重新處理已上傳的媒體檔案": "Only uploaded media files can be reprocessed.",
  "影片處理失敗": "Video processing failed.",
  "影片轉換失敗": "Video conversion failed.",
  "影片轉換失敗，請確認伺服器已安裝 ffmpeg 並稍後再試":
    "Video conversion failed. Please make sure ffmpeg is installed on the server and try again.",
  "無法處理影片。請在伺服器安裝 ffmpeg：sudo apt install -y ffmpeg":
    "Can't process the video. Please install ffmpeg on the server: sudo apt install -y ffmpeg",
  "offset 無效": "Invalid upload offset.",
  "上傳位置不符，請由指定位置重試": "Upload position mismatch. Retrying from the server's position.",
  "上傳內容為空，請重新上傳": "The upload was empty. Please upload again.",
  "上傳工作階段無效": "Invalid upload session.",
  "找不到上傳工作階段，請重新上傳": "Upload session not found. Please upload again.",
  "文字內容過長": "The text is too long.",
  "找不到精選賽事卡片": "Featured card not found.",
  "更新精選賽事失敗": "Failed to update featured matches.",
  "找不到首頁區塊": "Home section not found.",
  "更新首頁區塊失敗": "Failed to update home section.",
  "請填寫標題與描述": "Please enter a title and description.",
  "請填寫所有文字欄位": "Please fill in all text fields.",
  "請填寫首頁英雄區所有文字欄位": "Please fill in all hero section text fields.",
  "請至少填寫一項欄位": "Please fill in at least one field.",
  "精選預測欄位 ID 無效": "Invalid top-pick slot ID.",
  "精選預測欄位不完整": "Top-pick slot is incomplete.",
  "請填寫主隊、客隊及預測結果": "Please enter the home team, away team and prediction.",
  "更新精選預測失敗": "Failed to update top picks.",
  "更新預測失敗": "Failed to update prediction.",
  "預測文字過長": "Prediction text is too long.",
  "無法載入預測覆寫": "Couldn't load prediction overrides.",
  "賽事 ID 無效": "Invalid match ID.",
  "賽事 ID 過長": "Match ID is too long.",
  "找不到賽事": "Match not found.",
  "無法取得馬會賽事資料": "Couldn't fetch HKJC match data.",
  "無法載入今日已開賽賽事": "Couldn't load today's started matches.",
  "無法載入過往賽事": "Couldn't load past matches.",
  "無法載入過往賽事日期": "Couldn't load past match dates.",
  "無法載入勝率資料": "Couldn't load win-rate data.",
  "Grok API 逾時，請稍後再試": "The AI service timed out. Please try again later.",
  "逾時": "Timed out.",
  // Raised by the frontend itself (upload client, fetch helpers).
  "載入賽事失敗": "Failed to load matches.",
  "無法建立上傳工作階段": "Couldn't start the upload.",
  "上傳重試次數過多，請稍後再試": "Too many upload retries. Please try again later.",
  "上傳中斷": "The upload was interrupted.",
  "上傳已取消": "Upload cancelled.",
  "檔案太大，伺服器拒絕上傳（413）。請聯絡管理員將 Nginx client_max_body_size 設為至少 100M。":
    "The file is too large and the server rejected it (413). Ask the admin to set Nginx client_max_body_size to at least 100M.",
  "與伺服器的連線中斷（伺服器可能剛重新啟動），請再試一次。":
    "Lost connection to the server (it may have just restarted). Please try again.",
  "伺服器錯誤，請稍後再試": "Server error. Please try again later.",
  "伺服器回應格式錯誤": "The server sent an unexpected response.",
};

const PATTERNS: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^檔案大小不能超過 (\d+) MB$/, (m) => `File size can't exceed ${m[1]} MB.`],
  [/^請提供 (\d+) 個精選預測欄位$/, (m) => `Please provide ${m[1]} top-pick slots.`],
  [
    /^伺服器暫時無法處理請求（(\d+)），可能正在重新啟動，請稍候再試一次。$/,
    (m) => `The server can't handle the request right now (${m[1]}); it may be restarting. Please try again shortly.`,
  ],
];

export function localizeApiError(
  message: string,
  locale: Locale = getClientLocale(),
): string {
  if (locale !== "en") return message;
  const exact = EXACT[message.trim()];
  if (exact) return exact;
  for (const [pattern, render] of PATTERNS) {
    const match = message.trim().match(pattern);
    if (match) return render(match);
  }
  return message;
}

const FALLBACK = "請求失敗，請稍後再試";

/** Shared `{ error }` reader for API helpers; localized for the active language. */
export async function readApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return localizeApiError(data.error ?? FALLBACK);
  } catch {
    return localizeApiError(FALLBACK);
  }
}
