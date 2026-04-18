import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidVercelCredentials(vercelProjectId: string, vercelToken: string): boolean {
  const isValidProjectId = vercelProjectId.startsWith('prj_') && vercelProjectId.length === 32;
  const isValidToken = vercelToken.length === 24;

  return isValidProjectId && isValidToken;
}