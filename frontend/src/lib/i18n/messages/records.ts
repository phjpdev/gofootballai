import { defineMessages } from "../define";

/** Records page: daily record grid, detail viewer and the admin upload form. */
export const records = defineMessages({
  "zh-HK": {
    page: {
      adminHint: "點擊 + 上傳相片、影片或文字公告。",
      addRecord: "新增紀錄",
      publicIntro: "Go football 每日紀錄",
    },
    list: {
      empty: "暫無紀錄，管理員上傳後會顯示於此。",
      confirmDelete: "確定刪除此紀錄？此操作無法復原。",
    },
    card: {
      edit: "編輯紀錄",
      delete: "刪除紀錄",
    },
    /** "2026年9月28日" + "週一" → "2026年9月28日(週一)" */
    dateLabel: (date: string, weekday: string) => `${date}(${weekday})`,
    detail: {
      decodeIssue:
        "此影片為 iPhone HEVC 格式，Chrome 無法播放。請轉換為 H.264 後再試。",
      networkIssue: "無法載入影片，請檢查網路或稍後再試。",
      retranscoding: "轉換中…",
      retranscode: "轉換為可播放格式",
      retranscodeFailed: "影片轉換失敗",
    },
    form: {
      createTitle: "新增紀錄",
      editTitle: "編輯紀錄",
      createSubtitle: "上傳相片或影片，並填寫標題、日期、描述與星級。",
      editSubtitle: "更新標題、日期、描述、星級或媒體內容。",
      mediaTypes: {
        photo: "相片",
        video: "影片",
      },
      titlePlaceholder: "標題",
      titleEnPlaceholder: "標題（英文，選填）",
      dateLabel: "日期",
      descriptionLabel: "描述",
      descriptionPlaceholder: "描述",
      descriptionEnLabel: "描述（英文，選填）",
      descriptionEnPlaceholder: "描述（英文）",
      ratingLabel: "星級（0–5）",
      replaceFile: "點擊以替換現有檔案",
      uploadPrompt: {
        photo: "點擊上傳相片（或選擇其他媒體類型）",
        video: "點擊上傳影片（或選擇其他媒體類型）",
      },
      sizeLimit: (mb: number) => `上限 ${mb} MB`,
      previewAlt: "預覽",
      fileTooLarge: (mb: number) => `檔案大小不能超過 ${mb} MB`,
      invalidFile: "請選擇有效的圖片或影片檔案（例如 JPG、PNG、MP4、MOV）",
      videoNotice:
        "iPhone 影片上傳後會自動轉換為網頁可播放格式，轉換可能需要 1–2 分鐘。",
      invalidRating: "請填寫 0 至 5 的星級評分",
      fileRequired: {
        photo: "請選擇要上傳的相片檔案",
        video: "請選擇要上傳的影片檔案",
      },
      saveFailed: "儲存紀錄失敗",
      uploadingPercent: (percent: number) => `上傳中… ${percent}%`,
      publish: "發佈至紀錄",
      uploadingVideo: (percent: number) => `上傳影片中… ${percent}%`,
      converting: "上傳完成，正在轉換影片格式…",
      savingRecord: "儲存紀錄中…",
    },
  },
  en: {
    page: {
      adminHint: "Tap + to upload a photo, video or text announcement.",
      addRecord: "Add record",
      publicIntro: "Go Football daily records",
    },
    list: {
      empty: "No records yet. They'll appear here once an admin uploads them.",
      confirmDelete: "Delete this record? This can't be undone.",
    },
    card: {
      edit: "Edit record",
      delete: "Delete record",
    },
    /** "28 Sept 2026" + "Mon" → "28 Sept 2026 (Mon)" */
    dateLabel: (date: string, weekday: string) => `${date} (${weekday})`,
    detail: {
      decodeIssue:
        "This video is in iPhone HEVC format, which Chrome can't play. Convert it to H.264 and try again.",
      networkIssue:
        "Couldn't load the video. Check your connection or try again later.",
      retranscoding: "Converting…",
      retranscode: "Convert to a playable format",
      retranscodeFailed: "Video conversion failed",
    },
    form: {
      createTitle: "New record",
      editTitle: "Edit record",
      createSubtitle:
        "Upload a photo or video and add a title, date, description and rating.",
      editSubtitle: "Update the title, date, description, rating or media.",
      mediaTypes: {
        photo: "Photo",
        video: "Video",
      },
      titlePlaceholder: "Title",
      titleEnPlaceholder: "Title (English, optional)",
      dateLabel: "Date",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Description",
      descriptionEnLabel: "Description (English, optional)",
      descriptionEnPlaceholder: "Description in English",
      ratingLabel: "Rating (0–5)",
      replaceFile: "Tap to replace the current file",
      uploadPrompt: {
        photo: "Tap to upload a photo (or pick another media type)",
        video: "Tap to upload a video (or pick another media type)",
      },
      sizeLimit: (mb: number) => `Max ${mb} MB`,
      previewAlt: "Preview",
      fileTooLarge: (mb: number) => `Files can't be larger than ${mb} MB.`,
      invalidFile:
        "Please choose a valid image or video file (e.g. JPG, PNG, MP4, MOV).",
      videoNotice:
        "iPhone videos are converted to a web-playable format after upload. This can take 1–2 minutes.",
      invalidRating: "Enter a star rating from 0 to 5.",
      fileRequired: {
        photo: "Please choose a photo to upload.",
        video: "Please choose a video to upload.",
      },
      saveFailed: "Couldn't save the record.",
      uploadingPercent: (percent: number) => `Uploading… ${percent}%`,
      publish: "Publish to Records",
      uploadingVideo: (percent: number) => `Uploading video… ${percent}%`,
      converting: "Upload complete. Converting video…",
      savingRecord: "Saving record…",
    },
  },
});
