import config from "../../config";

export default [
  "Hello, World!",
  "Name: Eugene Mirotin",
  "Occupation: Web Developer",
  "Tech:",
  "JS/ES6, TypeScript, Node.js",
  "React, Svelte",
  "Docker, Bash",
  "OOP, FP, async",
  "PostgreSQL, SQLite",
  "Redis, MongoDB",
  "HTML5, CSS3, Sass/SCSS",
  "Git, GitHub",
  "",
  "---",
  `Contact: ${config.EMAIL}`,
] as const;
