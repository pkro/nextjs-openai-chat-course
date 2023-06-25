import {ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

// twMerge combines tailwind classes, e.g. "left-0 right-0" -> "inset-x-0"
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}