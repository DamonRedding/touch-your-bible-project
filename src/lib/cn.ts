/**
 * Utility function to merge Tailwind classes
 * Based on: https://nativewindui.com/installation/manual
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
