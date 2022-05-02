import { getAge } from "../../util";
import config from "../../config";

export default [
  "Hello, World!",
  "Name: Eugene Mirotin",
  "Age: " + getAge(),
  "Occupation: Web Developer",
  "Tech:",
  "JS/ES6, TypeScript, Node.js",
  "React, Svelte",
  "Docker, Bash",
  "OOP, FP, Promises",
  "PostgreSQL, SQLite",
  "Redis, MongoDB",
  "HTML5, CSS3, Sass/SCSS",
  "Webpack, Babel",
  "Git, GitHub",
  "",
  "---",
  `Contact: ${config.EMAIL}`,
];
