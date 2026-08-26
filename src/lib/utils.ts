import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cx = cn;

export async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string; fields?: Record<string, string> };
    };
    return {
      message: payload.error?.message || "请求失败，请稍后重试。",
      fields: payload.error?.fields,
    };
  } catch {
    return { message: "请求失败，请稍后重试。" };
  }
}
