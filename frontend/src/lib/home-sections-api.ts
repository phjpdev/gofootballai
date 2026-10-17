import type { HomeSection, HomeSectionId } from "@/lib/data/home-sections";
import { readApiError } from "@/lib/i18n/api-errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiHomeSection = {
  id: HomeSectionId;
  eyebrow: string | null;
  title: string;
  description: string;
  imageSrc: string;
  ctaText: string | null;
  loginPrompt: string | null;
  loginLinkText: string | null;
  eyebrowEn: string | null;
  titleEn: string | null;
  descriptionEn: string | null;
  ctaTextEn: string | null;
  loginPromptEn: string | null;
  loginLinkTextEn: string | null;
};

function mapHomeSection(section: ApiHomeSection): HomeSection {
  return {
    id: section.id,
    eyebrow: section.eyebrow,
    title: section.title,
    description: section.description,
    imageSrc: section.imageSrc,
    ctaText: section.ctaText,
    loginPrompt: section.loginPrompt,
    loginLinkText: section.loginLinkText,
    eyebrowEn: section.eyebrowEn,
    titleEn: section.titleEn,
    descriptionEn: section.descriptionEn,
    ctaTextEn: section.ctaTextEn,
    loginPromptEn: section.loginPromptEn,
    loginLinkTextEn: section.loginLinkTextEn,
  };
}

export function resolveHomeSectionImageUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) {
    const base = API_URL.replace(/\/$/, "");
    return `${base}${src}`;
  }
  return src;
}

const parseError = readApiError;

export async function fetchHomeSections(): Promise<HomeSection[]> {
  const response = await fetch(`${API_URL}/api/home-sections/public`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { sections: ApiHomeSection[] };
  return data.sections.map(mapHomeSection);
}

export type HomeSectionInput = {
  eyebrow?: string;
  title: string;
  description: string;
  ctaText?: string;
  loginPrompt?: string;
  loginLinkText?: string;
  eyebrowEn?: string;
  titleEn?: string;
  descriptionEn?: string;
  ctaTextEn?: string;
  loginPromptEn?: string;
  loginLinkTextEn?: string;
  file?: File;
};

export async function updateHomeSection(
  token: string,
  id: HomeSectionId,
  input: HomeSectionInput,
): Promise<HomeSection> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  if (input.eyebrow !== undefined) formData.append("eyebrow", input.eyebrow);
  if (input.ctaText !== undefined) formData.append("ctaText", input.ctaText);
  if (input.loginPrompt !== undefined) {
    formData.append("loginPrompt", input.loginPrompt);
  }
  if (input.loginLinkText !== undefined) {
    formData.append("loginLinkText", input.loginLinkText);
  }
  for (const key of [
    "eyebrowEn",
    "titleEn",
    "descriptionEn",
    "ctaTextEn",
    "loginPromptEn",
    "loginLinkTextEn",
  ] as const) {
    const value = input[key];
    if (value !== undefined) formData.append(key, value);
  }
  if (input.file) formData.append("file", input.file);

  const response = await fetch(`${API_URL}/api/home-sections/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { section: ApiHomeSection };
  return mapHomeSection(data.section);
}
