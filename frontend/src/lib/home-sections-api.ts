import type { HomeSection, HomeSectionId } from "@/lib/data/home-sections";

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

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "請求失敗，請稍後再試";
  } catch {
    return "請求失敗，請稍後再試";
  }
}

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
