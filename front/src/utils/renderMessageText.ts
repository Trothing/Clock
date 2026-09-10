import twemoji from "twemoji";
import {escapeHtml} from "./escapeHtml.ts";

export function renderMessageTextHtml(text: string): string {
    return twemoji.parse(escapeHtml(text), {folder: 'svg', ext: '.svg'})
}
