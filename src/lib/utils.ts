import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Strip leading "The ", "A ", "An " for sorting purposes */
export function sortableTitle(title: string): string {
  return title.replace(/^(the|a|an)\s+/i, "");
}
