import { createServerFn } from "@tanstack/react-start";
import cvMarkdown from "../../cv/cv.md?raw";
import { renderMarkdown } from "./markdown";

export const getCvMarkdown = createServerFn({ method: "GET" }).handler(() => {
  return cvMarkdown;
});

export const getCvHtml = createServerFn({ method: "GET" }).handler(() => {
  return renderMarkdown(cvMarkdown);
});
