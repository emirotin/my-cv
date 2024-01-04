import type React from "react";

const LINKS = [
  [
    "https://github.com/emirotin/lcd-cv",
    "This CV, it has some interesting parts",
  ],
  [
    "https://medium.com/@kennel_panic/aoc-2017-intro-299b668330c",
    "A series of blog posts about my solutions to Advent of Code 2017",
  ],
  ["https://github.com/resin-io/resin-sdk", "OSS: resin-sdk"],
  ["https://github.com/botpress/botpress", "OSS: Botpress"],
  ["http://emirotin.github.io/hover-dover/", "A fun experiment with PNG"],
];

const Links: React.FC = () => (
  <ul className="lead">
    {LINKS.map(([link, title], i) => (
      <li key={i}>
        <a href={link} target="_blank">
          {title}
        </a>
      </li>
    ))}
  </ul>
);

export default Links;
