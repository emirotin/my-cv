import cvMarkdown from "../../cv/cv.md?raw";
import { renderMarkdown } from "./markdown";

export function getCvMarkdown() {
  return cvMarkdown;
}

export function getCvHtml() {
  return renderMarkdown(cvMarkdown);
}
